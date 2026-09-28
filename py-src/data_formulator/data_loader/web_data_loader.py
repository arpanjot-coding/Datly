"""Web URL data loader.

Fetches one public http(s) URL through ``web_utils`` (SSRF + size cap).
Data files (csv / json / xlsx / parquet) expose one stem catalog node.
HTML pages expose ``table_0`` .. ``table_n`` via ``extract_tables_from_html``
(cap 20). Empty HTML is an honest empty catalog. Links are not followed.

``render=true`` is opt-in only. When set (and format is auto or html), the
loader calls ``render_url_with_playwright`` if Playwright is available.
If Playwright is missing, the HTML path fails closed (no silent static
fallback, no crawl).
"""

from __future__ import annotations

import io
import json
import logging
import re
from pathlib import PurePosixPath
from typing import Any
from urllib.parse import unquote, urlparse

import pandas as pd
import pyarrow as pa

from data_formulator.agents.web_utils import (
    _validate_url_for_ssrf,
    extract_tables_from_html,
    fetch_url_bytes,
    playwright_available,
    render_url_with_playwright,
)
from data_formulator.data_loader import probe_utils
from data_formulator.data_loader.external_data_loader import (
    ExternalDataLoader,
    MAX_IMPORT_ROWS,
    apply_import_projection,
)
from data_formulator.data_loader.probe_utils import assert_source_table_identifier
from data_formulator.datalake.parquet_utils import (
    df_to_safe_records,
    sanitize_dataframe_for_arrow,
)
from data_formulator.datalake.table_names import sanitize_external_loader_table_name

logger = logging.getLogger(__name__)

_DATA_FILE_FORMATS = frozenset({"csv", "json", "jsonl", "tsv", "xlsx", "parquet"})
_HTML_FORMATS = frozenset({"html"})

_CONTENT_TYPE_FORMAT = {
    "text/csv": "csv",
    "application/csv": "csv",
    "text/tab-separated-values": "tsv",
    "application/json": "json",
    "text/json": "json",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xlsx",
    "application/vnd.apache.parquet": "parquet",
    "application/parquet": "parquet",
    "application/x-parquet": "parquet",
    "text/html": "html",
    "application/xhtml+xml": "html",
}

_EXT_FORMAT = {
    ".csv": "csv",
    ".tsv": "tsv",
    ".json": "json",
    ".jsonl": "jsonl",
    ".xlsx": "xlsx",
    ".xls": "xlsx",
    ".parquet": "parquet",
    ".html": "html",
    ".htm": "html",
}

_JSON_LIST_KEYS = ("data", "rows", "records", "items")
_TEST_CONNECTION_MAX_BYTES = 65_536
_HTML_TABLE_CAP = 20
_HTML_TABLE_NAME_RE = re.compile(r"^table_(\d+)$")


def _url_stem(url: str) -> str:
    parsed = urlparse(url)
    path = unquote(parsed.path or "")
    name = PurePosixPath(path).name
    if not name:
        host = (parsed.hostname or "table").replace(".", "_")
        return sanitize_external_loader_table_name(host)
    return sanitize_external_loader_table_name(PurePosixPath(name).stem)


def _format_from_url(url: str) -> str | None:
    path = (urlparse(url).path or "").lower()
    for ext, fmt in _EXT_FORMAT.items():
        if path.endswith(ext):
            return fmt
    return None


def _format_from_content_type(content_type: str | None) -> str | None:
    ct = (content_type or "").split(";")[0].strip().lower()
    return _CONTENT_TYPE_FORMAT.get(ct)


def _unwrap_json_payload(payload: Any) -> Any:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in _JSON_LIST_KEYS:
            value = payload.get(key)
            if isinstance(value, list):
                return value
        return [payload]
    return payload


class WebDataLoader(ExternalDataLoader):
    """Load a data file from one public HTTP or HTTPS URL."""

    DISPLAY_NAME = "Web"
    DESCRIPTION = (
        "Load a CSV, JSON, Excel, Parquet file, or HTML tables from a "
        "public HTTP or HTTPS URL."
    )
    AUTH_GUIDE = "web.md"

    @staticmethod
    def list_params() -> list[dict[str, Any]]:
        return [
            {
                "name": "url",
                "type": "string",
                "required": True,
                "default": "",
                "tier": "connection",
                "description": "Public HTTP or HTTPS URL of a data file or HTML page",
            },
            {
                "name": "format",
                "type": "string",
                "required": False,
                "default": "auto",
                "tier": "connection",
                "description": "auto, csv, json, html, or xlsx",
            },
            {
                "name": "render",
                "type": "boolean",
                "required": False,
                "default": False,
                "tier": "connection",
                "advanced": True,
                "description": (
                    "Opt-in headless render via Playwright. Off by default. "
                    "Fails closed if Playwright is missing."
                ),
            },
            {
                "name": "authorization",
                "type": "string",
                "required": False,
                "default": "",
                "sensitive": True,
                "tier": "auth",
                "description": "Optional Authorization header (Bearer token or raw value)",
            },
        ]

    @staticmethod
    def catalog_hierarchy() -> list[dict[str, str]]:
        return [{"key": "table", "label": "Table"}]

    def __init__(self, params: dict[str, Any] | None = None):
        self.params = params or {}

    def _url(self) -> str:
        url = str(self.params.get("url") or "").strip()
        if not url:
            raise ValueError("url is required")
        return url

    def _source_table_id(self) -> str:
        return assert_source_table_identifier(_url_stem(self._url()), allow_spaces=True)

    def _declared_format(self) -> str:
        raw = str(self.params.get("format") or "auto").strip().lower()
        if raw in {"auto", "csv", "json", "html", "xlsx", "parquet", "tsv", "jsonl"}:
            return raw
        return "auto"

    def _resolve_format(self, content_type: str | None = None) -> str | None:
        declared = self._declared_format()
        if declared != "auto":
            return declared
        return _format_from_url(self._url()) or _format_from_content_type(content_type)

    def _request_headers(self) -> dict[str, str] | None:
        raw = self.params.get("authorization")
        if not isinstance(raw, str) or not raw.strip():
            return None
        value = raw.strip()
        if " " not in value:
            value = f"Bearer {value}"
        return {"Authorization": value}

    def _record_safe_final_url(self, final_url: Any) -> None:
        """Stamp redirect landing URL on params when it is a public http(s) URL."""
        if not isinstance(final_url, str):
            return
        candidate = final_url.strip()
        if not candidate:
            return
        try:
            validated = _validate_url_for_ssrf(candidate)
        except ValueError:
            return
        self.params["final_url"] = validated

    def _fetch(self, *, max_bytes: int | None = None) -> dict[str, Any]:
        url = self._url()
        _validate_url_for_ssrf(url)
        kwargs: dict[str, Any] = {"headers": self._request_headers()}
        if max_bytes is not None:
            kwargs["max_bytes"] = max_bytes
        fetched = fetch_url_bytes(url, **kwargs)
        self._record_safe_final_url(fetched.get("final_url"))
        return fetched

    def _render_requested(self) -> bool:
        return bool(self.params.get("render"))

    def _rendered_html(self) -> str:
        if not playwright_available():
            raise RuntimeError(
                "render=true requested but Playwright is not installed"
            )
        url = self._url()
        _validate_url_for_ssrf(url)
        return render_url_with_playwright(url)

    def _load_payload(self) -> tuple[str | None, bytes]:
        declared = self._declared_format()
        if self._render_requested() and declared in {"auto", "html"}:
            html = self._rendered_html()
            return "html", html.encode("utf-8")
        fetched = self._fetch()
        fmt = self._resolve_format(fetched.get("content_type"))
        return fmt, fetched["content"]

    @staticmethod
    def _decode_html(content: bytes) -> str:
        return content.decode("utf-8-sig", errors="replace")

    def _html_tables(self, content: bytes) -> list[pd.DataFrame]:
        return extract_tables_from_html(
            self._decode_html(content), max_tables=_HTML_TABLE_CAP,
        )

    @staticmethod
    def _html_table_index(name: str) -> int | None:
        match = _HTML_TABLE_NAME_RE.fullmatch(name)
        if match is None:
            return None
        return int(match.group(1))

    def _html_table_node(self, index: int, df: pd.DataFrame) -> dict[str, Any]:
        name = assert_source_table_identifier(f"table_{index}", allow_spaces=True)
        sample = df.head(10)
        columns = [{"name": str(col), "type": str(sample[col].dtype)} for col in sample.columns]
        return {
            "name": name,
            "table_key": name,
            "path": [name],
            "metadata": {
                "columns": columns,
                "sample_rows": df_to_safe_records(sample),
                "row_count": None,
                "_source_name": name,
                "_format": "html",
            },
        }

    def _list_html_table_nodes(
        self, content: bytes, table_filter: str | None,
    ) -> list[dict[str, Any]]:
        needle = (table_filter or "").strip().lower()
        nodes: list[dict[str, Any]] = []
        for index, df in enumerate(self._html_tables(content)):
            node = self._html_table_node(index, df)
            if needle and needle not in node["name"].lower():
                continue
            nodes.append(node)
        return nodes

    def _arrow_from_dataframe(
        self,
        df: pd.DataFrame,
        import_options: dict[str, Any] | None,
    ) -> pa.Table:
        df = sanitize_dataframe_for_arrow(df)
        opts = import_options or {}
        size = opts.get("size", MAX_IMPORT_ROWS)
        if isinstance(size, int) and size > 0:
            size = min(size, MAX_IMPORT_ROWS)
            if len(df) > size:
                df = df.head(size)
        table = pa.Table.from_pandas(df, preserve_index=False)
        return apply_import_projection(table, opts)

    def _parse_dataframe(self, content: bytes, fmt: str) -> pd.DataFrame:
        if fmt == "csv":
            text = content.decode("utf-8-sig", errors="replace")
            return pd.read_csv(io.StringIO(text))
        if fmt == "tsv":
            text = content.decode("utf-8-sig", errors="replace")
            return pd.read_csv(io.StringIO(text), sep="\t")
        if fmt in {"json", "jsonl"}:
            text = content.decode("utf-8-sig", errors="replace")
            return self._dataframe_from_json_text(text, fmt)
        if fmt == "xlsx":
            return pd.read_excel(io.BytesIO(content))
        if fmt == "parquet":
            return pd.read_parquet(io.BytesIO(content))
        raise ValueError(f"Unsupported web format: {fmt}")

    @staticmethod
    def _dataframe_from_json_text(text: str, fmt: str) -> pd.DataFrame:
        if fmt == "jsonl":
            rows: list[Any] = []
            for line in text.splitlines():
                line = line.strip()
                if not line:
                    continue
                rows.append(json.loads(line))
            return pd.DataFrame(rows)
        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            rows = []
            for line in text.splitlines():
                line = line.strip()
                if not line:
                    continue
                rows.append(json.loads(line))
            if not rows:
                raise
            payload = rows
        return pd.DataFrame(_unwrap_json_payload(payload))

    def test_connection(self) -> bool:
        try:
            self._fetch(max_bytes=_TEST_CONNECTION_MAX_BYTES)
            return True
        except Exception:
            logger.debug("web test_connection failed", exc_info=True)
            return False

    def list_tables(self, table_filter: str | None = None) -> list[dict[str, Any]]:
        fmt, content = self._load_payload()
        if fmt in _HTML_FORMATS:
            return self._list_html_table_nodes(content, table_filter)
        if fmt is None or fmt not in _DATA_FILE_FORMATS:
            return []

        source_table = self._source_table_id()
        needle = (table_filter or "").strip().lower()
        if needle and needle not in source_table.lower():
            return []

        columns: list[dict[str, str]] = []
        sample_rows: list[dict[str, Any]] = []
        try:
            df = self._parse_dataframe(content, fmt)
            sample = df.head(10)
            columns = [{"name": str(col), "type": str(sample[col].dtype)} for col in sample.columns]
            sample_rows = df_to_safe_records(sample)
        except Exception:
            logger.debug("web catalog sample parse failed", exc_info=True)

        return [{
            "name": source_table,
            "table_key": source_table,
            "path": [source_table],
            "metadata": {
                "columns": columns,
                "sample_rows": sample_rows,
                "row_count": None,
                "_source_name": source_table,
                "_format": fmt,
            },
        }]

    def fetch_data_as_arrow(
        self,
        source_table: str,
        import_options: dict[str, Any] | None = None,
    ) -> pa.Table:
        requested = assert_source_table_identifier(source_table, allow_spaces=True)
        fmt, content = self._load_payload()
        if fmt in _HTML_FORMATS:
            index = self._html_table_index(requested)
            tables = self._html_tables(content)
            if index is None or index < 0 or index >= len(tables):
                raise ValueError(f"Unknown web table: {source_table!r}")
            return self._arrow_from_dataframe(tables[index], import_options)

        expected = self._source_table_id()
        if requested != expected:
            raise ValueError(f"Unknown web table: {source_table!r}")
        if fmt is None or fmt not in _DATA_FILE_FORMATS:
            raise ValueError(
                "This URL is not a CSV, JSON, Excel, or Parquet data file"
            )

        return self._arrow_from_dataframe(
            self._parse_dataframe(content, fmt), import_options,
        )

    def probe(self, path: list[str], query: dict[str, Any]) -> dict[str, Any]:
        source_table = path[-1] if path else self._source_table_id()
        return probe_utils.run_probe_on_duckdb(
            self, path, query, source_table=source_table, scan_size=MAX_IMPORT_ROWS,
        )
