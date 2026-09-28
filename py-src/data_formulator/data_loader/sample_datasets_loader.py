"""Sample datasets data loader.

Exposes the built-in ``EXAMPLE_DATASETS`` catalog as a virtual data
connector. No auth and no external account — each table is a CSV shipped
with the app (``path``) or, if a table only declares a URL, fetched from
that public address.

The connector is registered at startup so users have a zero-config way to
load a few real example tables and explore Datly.
"""

from __future__ import annotations

import io
import json
import logging
import threading
from pathlib import Path
from typing import Any

import pandas as pd
import pyarrow as pa

from data_formulator.data_loader.external_data_loader import ExternalDataLoader
from data_formulator.data_loader import probe_utils
from data_formulator.datalake.parquet_utils import (
    df_to_safe_records,
    sanitize_dataframe_for_arrow,
)

logger = logging.getLogger(__name__)


def _whole_number_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Keep blank-aware ids and counts as integers instead of 14453.0."""
    for column in df.columns:
        series = df[column]
        if not pd.api.types.is_float_dtype(series):
            continue
        present = series.dropna()
        if present.empty or not present.mod(1).eq(0).all():
            continue
        df[column] = series.astype("Int64")
    return df

# CSVs live next to the package so a packaged app can load them offline.
_SAMPLE_DATA_DIR = (Path(__file__).resolve().parent.parent / "sample_data").resolve()

# In-process cache for sample dataset DataFrames keyed by (locator, format).
# The shipped files and the public URLs are static, so caching is safe and
# speeds up repeat previews. Bounded by a soft cap; eviction is FIFO.
_SAMPLE_CACHE: dict[tuple[str, str], pd.DataFrame] = {}
_SAMPLE_CACHE_ORDER: list[tuple[str, str]] = []
_SAMPLE_CACHE_LOCK = threading.Lock()
_SAMPLE_CACHE_MAX = 64


class SampleDatasetsLoader(ExternalDataLoader):
    """Browse and import the built-in sample datasets."""

    # ------------------------------------------------------------------
    # Metadata
    # ------------------------------------------------------------------

    @staticmethod
    def list_params() -> list[dict[str, Any]]:
        return []

    AUTH_GUIDE = "sample_datasets.md"

    @staticmethod
    def auth_mode() -> str:
        # ``"none"`` declares that this loader needs no authentication and no
        # connection setup. The connector framework treats such loaders as
        # always-on: they cannot be connected/disconnected, expose no
        # credentials UI, and are always reported as ``connected: true``.
        return "none"

    @staticmethod
    def auth_config() -> dict:
        # Mirror :meth:`auth_mode` for the modern auth interface. The base
        # class defaults ``auth_config`` to ``{"mode": "credentials"}``
        # independently of ``auth_mode``, and ``_loader_auth_mode`` prefers
        # ``auth_config``. Without this override the no-auth loader would be
        # mis-classified as credential-based, breaking catalog/preview/import
        # (which require a connection) whenever no loader was eagerly cached
        # — e.g. in ephemeral / ``--disable-data-connectors`` deployments.
        return {"mode": "none"}

    @staticmethod
    def catalog_hierarchy() -> list[dict[str, str]]:
        return [
            {"key": "dataset", "label": "Dataset"},
            {"key": "table", "label": "Table"},
        ]

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def __init__(self, params: dict[str, Any] | None = None):
        self.params = params or {}

    def test_connection(self) -> bool:
        return True

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _datasets(self) -> list[dict[str, Any]]:
        from data_formulator.example_datasets_config import EXAMPLE_DATASETS
        return EXAMPLE_DATASETS

    @staticmethod
    def _table_stem(table_entry: dict[str, Any], idx: int) -> str:
        locator = table_entry.get("path") or table_entry.get("url") or ""
        last = str(locator).split("/")[-1].split("?")[0]
        stem = last.rsplit(".", 1)[0] if "." in last else last
        return stem or f"table_{idx}"

    @staticmethod
    def _local_file(table_entry: dict[str, Any]) -> Path | None:
        """Resolve a shipped CSV, rejecting paths that leave the sample folder."""
        raw = str(table_entry.get("path") or "").strip()
        if not raw:
            return None
        candidate = (_SAMPLE_DATA_DIR / raw).resolve()
        if _SAMPLE_DATA_DIR not in candidate.parents and candidate != _SAMPLE_DATA_DIR:
            raise ValueError(f"Sample data path escapes the sample folder: {raw!r}")
        if not candidate.is_file():
            raise FileNotFoundError(f"Sample data file is missing: {raw}")
        return candidate

    def _columns_from_sample(self, sample: Any, fmt: str) -> tuple[list[dict], list[dict]]:
        """Infer ``(columns, sample_rows)`` from an embedded preview payload."""
        columns: list[dict] = []
        sample_rows: list[dict] = []
        if isinstance(sample, list) and sample:
            first = sample[0] if isinstance(sample[0], dict) else {}
            for name, value in first.items():
                ctype = type(value).__name__ if value is not None else "string"
                columns.append({"name": str(name), "type": ctype})
            sample_rows = [r for r in sample[:10] if isinstance(r, dict)]
        elif isinstance(sample, str) and sample.strip():
            sep = "," if (fmt or "csv").lower() == "csv" else "\t"
            try:
                df = pd.read_csv(io.StringIO(sample.strip()), sep=sep)
                columns = [
                    {"name": str(c), "type": str(df[c].dtype)}
                    for c in df.columns
                ]
                sample_rows = df_to_safe_records(df.head(10))
            except Exception:
                logger.debug("Failed to parse sample CSV preview", exc_info=True)
        return columns, sample_rows

    def _resolve(self, source_table: str) -> tuple[dict, dict, int] | None:
        """Look up ``(dataset, table_entry, table_idx)`` by ``"Dataset/stem"``.

        Also accepts the bare dataset name when the dataset has a single
        table, for convenience.
        """
        if not source_table:
            return None
        parts = source_table.split("/", 1)
        ds_name = parts[0]
        wanted_stem = parts[1] if len(parts) == 2 else None
        for ds in self._datasets():
            if ds.get("name") != ds_name:
                continue
            tables = ds.get("tables", []) or []
            if wanted_stem is None and len(tables) == 1:
                return ds, tables[0], 0
            for idx, t in enumerate(tables):
                if self._table_stem(t, idx) == wanted_stem:
                    return ds, t, idx
        return None

    # ------------------------------------------------------------------
    # Catalog
    # ------------------------------------------------------------------

    def list_tables(self, table_filter: str | None = None) -> list[dict[str, Any]]:
        needle = (table_filter or "").strip().lower()
        results: list[dict[str, Any]] = []
        for ds in self._datasets():
            ds_name = ds["name"]
            desc = ds.get("description", "") or ""
            tables = ds.get("tables", []) or []
            # Collapse single-table datasets to a single top-level entry so the
            # sidebar doesn't render dozens of folders containing one child.
            # Multi-table datasets keep the 2-level (dataset / table) hierarchy.
            collapse = len(tables) == 1
            for idx, t in enumerate(tables):
                stem = self._table_stem(t, idx)
                if collapse:
                    source_id = ds_name
                    path = [ds_name]
                else:
                    source_id = f"{ds_name}/{stem}"
                    path = [ds_name, stem]
                if needle and needle not in source_id.lower() and needle not in desc.lower():
                    continue
                fmt = (t.get("format") or "json").lower()
                columns, sample_rows = self._columns_from_sample(t.get("sample"), fmt)
                results.append({
                    "name": source_id,
                    "table_key": source_id,
                    "path": path,
                    "metadata": {
                        "description": desc,
                        "columns": columns,
                        "sample_rows": sample_rows,
                        "row_count": None,
                        "_source_name": source_id,
                        "_format": fmt,
                        "_url": t.get("url", ""),
                        "_path": t.get("path", ""),
                        "_live": bool(ds.get("live", False)),
                        "_refresh_interval_seconds": ds.get("refreshIntervalSeconds"),
                    },
                })
        return results

    def get_column_types(self, source_table: str) -> dict[str, Any]:
        resolved = self._resolve(source_table)
        if not resolved:
            return {}
        ds, t, _ = resolved
        fmt = (t.get("format") or "json").lower()
        columns, _rows = self._columns_from_sample(t.get("sample"), fmt)
        return {
            "columns": columns,
            "description": ds.get("description", ""),
        }

    # ------------------------------------------------------------------
    # Data fetch
    # ------------------------------------------------------------------

    def fetch_data_as_arrow(
        self,
        source_table: str,
        import_options: dict[str, Any] | None = None,
    ) -> pa.Table:
        resolved = self._resolve(source_table)
        if not resolved:
            raise ValueError(f"Unknown sample table: {source_table!r}")
        _ds, t, _idx = resolved
        url = t.get("url", "")
        fmt = (t.get("format") or "json").lower()
        local_file = self._local_file(t)
        if local_file is None and not url:
            raise ValueError(f"Sample table {source_table!r} has no file or URL configured")

        df = self._load_full_dataframe(t, fmt, source_table, local_file)

        # Capture the true total BEFORE any slicing so callers can report
        # the real row count even when ``size`` truncates the preview.
        self._last_total_rows = len(df)

        opts = import_options or {}
        size = opts.get("size")
        if isinstance(size, int) and size > 0 and len(df) > size:
            df = df.head(size)

        logger.info("Returning %d / %d rows from sample dataset: %s",
                    len(df), self._last_total_rows, source_table)
        # Public sample JSON/CSV files frequently contain mixed-type object
        # columns (e.g. movies.json's ``Title`` holds both strings and
        # numeric values), which makes ``pa.Table.from_pandas`` raise
        # ArrowTypeError. Coerce such columns to a consistent type first.
        return pa.Table.from_pandas(
            sanitize_dataframe_for_arrow(df), preserve_index=False
        )

    def probe(self, path: list[str], query: dict[str, Any]) -> dict[str, Any]:
        """Read the sample file into DuckDB and compute the SPJQ there."""
        # Sample tables are addressed as ``"Dataset/stem"`` (slash-joined),
        # not dotted, so build the identifier ``_resolve`` expects.
        source_table = "/".join(str(p) for p in path if p not in (None, ""))
        return probe_utils.run_probe_on_duckdb(
            self, path, query, source_table=source_table,
        )

    # ------------------------------------------------------------------
    # Internal: cached full-dataset fetch
    # ------------------------------------------------------------------

    def _load_full_dataframe(
        self,
        table_entry: dict[str, Any],
        fmt: str,
        source_table: str,
        local_file: Path | None,
    ) -> pd.DataFrame:
        """Return the full parsed DataFrame for a shipped file or public URL.

        Results are cached in-process. The shipped CSVs and the public URLs
        are static, and previews otherwise re-read the file on every click.
        """
        url = table_entry.get("url", "") or ""
        locator = str(local_file) if local_file is not None else url
        key = (locator, fmt)
        with _SAMPLE_CACHE_LOCK:
            cached = _SAMPLE_CACHE.get(key)
        if cached is not None:
            # Return a shallow copy so downstream slicing (``.head(size)``)
            # doesn't mutate views the cache might re-emit later.
            return cached.copy(deep=False)

        if local_file is not None:
            logger.info("Reading shipped sample dataset: %s (%s)", source_table, local_file.name)
            if fmt == "tsv":
                df = pd.read_csv(local_file, sep="\t")
            elif fmt == "json":
                df = pd.read_json(local_file)
            else:
                df = pd.read_csv(local_file)
            df = _whole_number_columns(df)
        else:
            import requests
            logger.info("Fetching sample dataset over network: %s (%s)", source_table, url)
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            text = resp.text

            if fmt == "csv":
                df = pd.read_csv(io.StringIO(text))
            elif fmt == "tsv":
                df = pd.read_csv(io.StringIO(text), sep="\t")
            else:
                payload = json.loads(text)
                if isinstance(payload, dict):
                    # Common JSON shapes: {data: [...]}, {rows: [...]}, or a single record
                    for k in ("data", "rows", "records", "items"):
                        if isinstance(payload.get(k), list):
                            payload = payload[k]
                            break
                    else:
                        payload = [payload]
                df = pd.DataFrame(payload)

        with _SAMPLE_CACHE_LOCK:
            if key not in _SAMPLE_CACHE:
                _SAMPLE_CACHE[key] = df
                _SAMPLE_CACHE_ORDER.append(key)
                # FIFO eviction once we exceed the cap.
                while len(_SAMPLE_CACHE_ORDER) > _SAMPLE_CACHE_MAX:
                    evict = _SAMPLE_CACHE_ORDER.pop(0)
                    _SAMPLE_CACHE.pop(evict, None)
        return df.copy(deep=False)
