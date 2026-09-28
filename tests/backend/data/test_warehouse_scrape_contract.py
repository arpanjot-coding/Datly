"""Warehouse scrape contract: ingest provenance vs gzip leftover.

Proves ``ingest_to_workspace`` writes ``source_info``, gzip
``create-table`` ``raw_data`` does not, and ``refresh-data`` fails closed
when workspace metadata has no ``source_table``. Web refresh updates
parquet and keeps ``source_info`` (loader class, source_table, url, no
authorization). Also locks safe ``loader_params`` (url / final_url, no
secrets, no connectorId) on yaml and list-tables. File-upload
``source_type=upload`` stays untouched. No ``/api/warehouse``.

New scrape Load is URL-tab + agent bind (database + connectorId) then
IMPORT_DATA. Leftover gzip extract / old url / stream is not that path
and must not receive fake ``source_info``. Old url/stream sessions stay
until reload.
"""
from __future__ import annotations

import gzip
import io
import json
from dataclasses import fields
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
import yaml
from flask import Flask

from data_formulator.data_loader.probe_utils import assert_source_table_identifier
from data_formulator.datalake.workspace import Workspace
from data_formulator.datalake.workspace_metadata import (
    METADATA_FILENAME,
    TableMetadata,
)
from data_formulator.errors import ErrorCode
from data_formulator.routes.tables import (
    _table_metadata_to_source_metadata,
    tables_bp,
)

pytestmark = [pytest.mark.backend]

PUBLIC_CSV_URL = "https://example.com/sales.csv"
REDIRECT_CSV_URL = "https://example.com/cdn/sales.csv"
CSV_BYTES = b"a,b\n1,2\n3,4\n"
REFRESHED_CSV_BYTES = b"a,b\n10,20\n30,40\n50,60\n"
WEB_AUTH_HEADER = "Bearer secret-token"
_CONNECTOR_ID_KEYS = ("connectorId", "connector_id")
_REPO_ROOT = Path(__file__).resolve().parents[3]
_URL_TAB_BIND = _REPO_ROOT / "src" / "app" / "urlTabWebBind.ts"
_AGENT_BIND = _REPO_ROOT / "src" / "app" / "agentWebBind.ts"
_CREATE_TABLE_ROUTE = (
    _REPO_ROOT / "py-src" / "data_formulator" / "routes" / "tables.py"
)


def _csv_fetch(url: str = PUBLIC_CSV_URL, content: bytes = CSV_BYTES) -> dict:
    """Same mocked fetch shape as ``test_web_loader`` CSV fixtures."""
    return {
        "content": content,
        "content_type": "text/csv",
        "final_url": url,
        "truncated": False,
    }


def _gzip_json_bytes(rows: list[dict]) -> bytes:
    return gzip.compress(json.dumps(rows).encode("utf-8"))


class _ConnectedSource:
    """Test-only stub so refresh-data reaches the workspace metadata check."""

    def _require_loader(self):
        return MagicMock()


class _WebRefreshSource:
    """Stub connector whose loader still uses WebDataLoader.fetch_data_as_arrow."""

    def __init__(self, loader):
        self._loader = loader

    def _require_loader(self):
        return self._loader


def _parquet_rows(workspace: Workspace, table_name: str) -> list[dict]:
    import pyarrow.parquet as pq

    meta = workspace.get_table_metadata(table_name)
    assert meta is not None
    return pq.read_table(workspace.get_file_path(meta.filename)).to_pylist()


def _workspace_yaml_text(workspace: Workspace) -> str:
    return (workspace.confined_root.root / METADATA_FILENAME).read_text(
        encoding="utf-8",
    )


def _workspace_yaml_table(workspace: Workspace, table_name: str) -> dict:
    dumped = yaml.safe_load(_workspace_yaml_text(workspace))
    tables = dumped["tables"]
    assert table_name in tables
    return tables[table_name]


def _assert_no_secrets_or_connector_id(blob) -> None:
    text = blob if isinstance(blob, str) else json.dumps(blob)
    assert "authorization" not in text
    assert "secret-token" not in text
    assert "Bearer " not in text
    for key in _CONNECTOR_ID_KEYS:
        assert key not in text


def _assert_table_metadata_has_no_connector_id(meta: TableMetadata) -> None:
    names = {f.name for f in fields(meta)}
    for key in _CONNECTOR_ID_KEYS:
        assert key not in names
        assert key not in meta.to_dict()


def _ingest_web_csv(
    tmp_workspace,
    *,
    table_name: str = "web_sales",
    url: str = PUBLIC_CSV_URL,
    final_url: str | None = None,
    authorization: str = WEB_AUTH_HEADER,
):
    from data_formulator.data_loader.web_data_loader import WebDataLoader

    loader = WebDataLoader({
        "url": url,
        "format": "csv",
        "authorization": authorization,
    })
    with patch(
        "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
        return_value=_csv_fetch(url=final_url or url),
    ):
        catalog = loader.list_tables()
        assert len(catalog) == 1
        source_table = catalog[0]["name"]
        meta = loader.ingest_to_workspace(
            tmp_workspace, table_name, source_table,
        )
    return loader, meta


def _tables_test_app():
    from data_formulator.error_handler import register_error_handlers

    app = Flask(__name__)
    app.config["TESTING"] = True
    app.register_blueprint(tables_bp)
    register_error_handlers(app)
    return app


def _post_gzip_create_table(
    tmp_workspace,
    *,
    table_name: str = "gzip_leftover",
    rows: list[dict] | None = None,
):
    """Leftover paste/extract/old-url path: gzip JSON, no source_info."""
    payload = _gzip_json_bytes(
        rows if rows is not None else [{"a": 1, "b": "x"}, {"a": 2, "b": "y"}],
    )
    app = _tables_test_app()
    with patch(
        "data_formulator.routes.tables._get_workspace",
        return_value=tmp_workspace,
    ):
        client = app.test_client()
        create_resp = client.post(
            "/api/tables/create-table",
            data={
                "table_name": table_name,
                "raw_data": (io.BytesIO(payload), "raw.json.gz"),
            },
            content_type="multipart/form-data",
        )
        list_resp = client.get("/api/tables/list-tables")
    return create_resp, list_resp


@pytest.fixture()
def tmp_workspace(tmp_path):
    return Workspace(str(tmp_path))


class TestWebIngestWritesSourceInfo:
    def test_ingest_to_workspace_stamps_web_source_info(self, tmp_workspace):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        loader = WebDataLoader({
            "url": PUBLIC_CSV_URL,
            "format": "csv",
            "authorization": "Bearer secret-token",
        })
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_csv_fetch(),
        ):
            catalog = loader.list_tables()
            assert len(catalog) == 1
            source_table = catalog[0]["name"]
            meta = loader.ingest_to_workspace(
                tmp_workspace, "web_sales", source_table,
            )

        parquet_path = tmp_workspace.get_file_path(meta.filename)
        assert parquet_path.exists()
        assert parquet_path.suffix == ".parquet"

        stored = tmp_workspace.get_table_metadata(meta.name)
        assert stored is not None
        assert stored.loader_type == "WebDataLoader"
        assert stored.loader_type == WebDataLoader.__name__
        assert stored.source_table
        assert stored.source_table == assert_source_table_identifier(
            stored.source_table, allow_spaces=True,
        )
        assert stored.loader_params is not None
        assert stored.loader_params.get("url") == PUBLIC_CSV_URL
        assert "authorization" not in stored.loader_params
        assert "secret-token" not in json.dumps(stored.loader_params)


class TestGzipCreateTableHasNoRefreshProvenance:
    def test_gzip_raw_data_does_not_stamp_source_info(self, tmp_workspace):
        resp, list_resp = _post_gzip_create_table(tmp_workspace)

        body = resp.get_json()
        assert resp.status_code == 200
        assert body["status"] == "success"

        table_name = body["data"]["table_name"]
        meta = tmp_workspace.get_table_metadata(table_name)
        assert meta is not None
        assert not meta.source_table
        assert meta.loader_type is None
        assert meta.loader_params is None
        assert meta.import_options is None
        assert _table_metadata_to_source_metadata(meta) is None
        dumped = json.dumps(meta.to_dict())
        assert "source_info" not in dumped
        assert "WebDataLoader" not in dumped
        _assert_table_metadata_has_no_connector_id(meta)

        list_body = list_resp.get_json()
        assert list_resp.status_code == 200
        assert list_body["status"] == "success"
        entry = next(
            t for t in list_body["data"]["tables"] if t["name"] == table_name
        )
        assert entry["source_metadata"] is None

        yaml_table = _workspace_yaml_table(tmp_workspace, table_name)
        assert "loader_type" not in yaml_table
        assert "loader_params" not in yaml_table
        assert "source_table" not in yaml_table
        assert "source_info" not in yaml_table
        assert "WebDataLoader" not in json.dumps(yaml_table)
        _assert_no_secrets_or_connector_id(yaml_table)


class TestLeftoverGzipIsNotScrapeWarehousePath:
    """URL-tab + agent bind + ingest are the scrape warehouse path.

    Gzip create-table stays leftover for paste / extract / old url or
    stream. Do not fake provenance on that JSON. Bind helpers must keep
    stamping database + connectorId + canRefresh.
    """

    def test_url_tab_and_agent_bind_helpers_exist_and_stamp_connector(self):
        assert _URL_TAB_BIND.is_file()
        assert _AGENT_BIND.is_file()
        url_tab = _URL_TAB_BIND.read_text(encoding="utf-8")
        agent = _AGENT_BIND.read_text(encoding="utf-8")

        assert "export function buildWebUrlTableSource" in url_tab
        assert "type: 'database'" in url_tab
        assert "connectorId: args.connectorId" in url_tab
        assert "canRefresh: true" in url_tab
        assert "type: 'url'" not in url_tab
        assert "type: 'stream'" not in url_tab
        assert "type: 'extract'" not in url_tab

        assert "export function resolvePendingTableLoadBind" in agent
        assert "export function buildPendingWebTableBind" in agent
        assert "buildWebUrlTableSource" in agent
        assert "mode: 'web'" in agent
        assert "mode: 'extract'" in agent
        assert "type: 'url'" not in agent
        assert "type: 'stream'" not in agent

    def test_create_table_raw_data_does_not_assign_source_info(self):
        src = _CREATE_TABLE_ROUTE.read_text(encoding="utf-8")
        start = src.index("def create_table")
        end = src.index("def parse_file")
        create = src[start:end]
        assert "workspace.write_parquet(df, sanitized_table_name)" in create
        assert "source_info" not in create
        assert "loader_type" not in create
        assert "WebDataLoader" not in create


class TestRefreshFailsClosedWithoutSourceTable:
    def test_refresh_data_without_source_table_uses_error_envelope(
        self, tmp_workspace,
    ):
        from data_formulator.data_connector import connectors_bp
        from data_formulator.error_handler import register_error_handlers

        import pandas as pd

        tmp_workspace.write_parquet(
            pd.DataFrame([{"a": 1}]), "no_source",
        )
        meta = tmp_workspace.get_table_metadata("no_source")
        assert meta is not None
        assert not meta.source_table

        app = Flask(__name__)
        app.config["TESTING"] = True
        app.register_blueprint(connectors_bp)
        register_error_handlers(app)

        with patch(
            "data_formulator.data_connector._resolve_connector",
            return_value=_ConnectedSource(),
        ), patch(
            "data_formulator.auth.identity.get_identity_id",
            return_value="test-user",
        ), patch(
            "data_formulator.workspace_factory.get_workspace",
            return_value=tmp_workspace,
        ):
            resp = app.test_client().post(
                "/api/connectors/refresh-data",
                json={
                    "connector_id": "web:sales",
                    "table_name": "no_source",
                },
            )

        body = resp.get_json()
        assert resp.status_code == 200
        assert body["status"] == "error"
        assert body["error"]["code"] == ErrorCode.INVALID_REQUEST
        assert "No refreshable source" in body["error"]["message"]
        assert "request_id" in body["error"]


class TestWebIngestYamlSafeParams:
    def test_yaml_and_metadata_have_safe_url_no_secrets_or_connector_id(
        self, tmp_workspace,
    ):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        _loader, meta = _ingest_web_csv(tmp_workspace, table_name="web_sales")
        stored = tmp_workspace.get_table_metadata(meta.name)
        assert stored is not None
        assert stored.source_table
        assert stored.loader_type == "WebDataLoader"
        assert stored.loader_type == WebDataLoader.__name__
        assert stored.loader_params is not None
        assert stored.loader_params.get("url") == PUBLIC_CSV_URL
        assert "authorization" not in stored.loader_params
        _assert_table_metadata_has_no_connector_id(stored)
        _assert_no_secrets_or_connector_id(stored.to_dict())
        _assert_no_secrets_or_connector_id(stored.loader_params)

        yaml_text = _workspace_yaml_text(tmp_workspace)
        yaml_table = _workspace_yaml_table(tmp_workspace, stored.name)
        assert yaml_table.get("source_table") == stored.source_table
        assert yaml_table.get("loader_type") == "WebDataLoader"
        assert (yaml_table.get("loader_params") or {}).get("url") == PUBLIC_CSV_URL
        assert "authorization" not in (yaml_table.get("loader_params") or {})
        for key in _CONNECTOR_ID_KEYS:
            assert key not in yaml_table
        _assert_no_secrets_or_connector_id(yaml_text)
        _assert_no_secrets_or_connector_id(yaml_table)

    def test_redirect_final_url_stamped_on_loader_params(self, tmp_workspace):
        _loader, meta = _ingest_web_csv(
            tmp_workspace,
            table_name="web_redirect",
            url=PUBLIC_CSV_URL,
            final_url=REDIRECT_CSV_URL,
        )
        stored = tmp_workspace.get_table_metadata(meta.name)
        assert stored is not None
        assert stored.loader_params is not None
        assert stored.loader_params.get("url") == PUBLIC_CSV_URL
        assert stored.loader_params.get("final_url") == REDIRECT_CSV_URL
        assert "authorization" not in stored.loader_params
        assert "secret-token" not in json.dumps(stored.loader_params)

        yaml_table = _workspace_yaml_table(tmp_workspace, stored.name)
        params = yaml_table.get("loader_params") or {}
        assert params.get("url") == PUBLIC_CSV_URL
        assert params.get("final_url") == REDIRECT_CSV_URL
        _assert_no_secrets_or_connector_id(yaml_table)

    def test_private_final_url_is_not_stamped(self, tmp_workspace):
        _loader, meta = _ingest_web_csv(
            tmp_workspace,
            table_name="web_private_redirect",
            url=PUBLIC_CSV_URL,
            final_url="http://127.0.0.1/secret.csv",
        )
        stored = tmp_workspace.get_table_metadata(meta.name)
        assert stored is not None
        assert stored.loader_params is not None
        assert stored.loader_params.get("url") == PUBLIC_CSV_URL
        assert "final_url" not in stored.loader_params
        _assert_no_secrets_or_connector_id(stored.loader_params)


class TestListTablesOmitsWebSecrets:
    def test_list_tables_data_loader_params_have_no_authorization(
        self, tmp_workspace,
    ):
        _loader, meta = _ingest_web_csv(tmp_workspace, table_name="web_listed")
        app = _tables_test_app()
        with patch(
            "data_formulator.routes.tables._get_workspace",
            return_value=tmp_workspace,
        ):
            resp = app.test_client().get("/api/tables/list-tables")

        body = resp.get_json()
        assert resp.status_code == 200
        assert body["status"] == "success"
        entry = next(
            t for t in body["data"]["tables"] if t["name"] == meta.name
        )
        source_metadata = entry["source_metadata"]
        assert source_metadata is not None
        params = source_metadata["data_loader_params"]
        assert params.get("url") == PUBLIC_CSV_URL
        assert "authorization" not in params
        assert "secret-token" not in json.dumps(params)
        _assert_no_secrets_or_connector_id(params)
        _assert_no_secrets_or_connector_id(source_metadata)
        for key in _CONNECTOR_ID_KEYS:
            assert key not in entry
            assert key not in source_metadata


class TestFileUploadSourceTypeUntouched:
    def test_file_create_table_stays_upload_not_web(self, tmp_workspace):
        app = _tables_test_app()
        with patch(
            "data_formulator.routes.tables._get_workspace",
            return_value=tmp_workspace,
        ):
            resp = app.test_client().post(
                "/api/tables/create-table",
                data={
                    "table_name": "uploaded_sales",
                    "file": (io.BytesIO(CSV_BYTES), "sales.csv"),
                },
                content_type="multipart/form-data",
            )

        body = resp.get_json()
        assert resp.status_code == 200
        assert body["status"] == "success"
        table_name = body["data"]["table_name"]
        stored = tmp_workspace.get_table_metadata(table_name)
        assert stored is not None
        assert stored.source_type == "upload"
        assert stored.loader_type is None
        assert stored.loader_params is None
        assert not stored.source_table
        assert stored.source_file
        dumped = stored.to_dict()
        assert dumped.get("source_type") == "upload"
        assert "WebDataLoader" not in json.dumps(dumped)
        assert PUBLIC_CSV_URL not in json.dumps(dumped)
        _assert_table_metadata_has_no_connector_id(stored)

        yaml_table = _workspace_yaml_table(tmp_workspace, stored.name)
        assert yaml_table.get("source_type") == "upload"
        assert "loader_type" not in yaml_table
        assert "loader_params" not in yaml_table
        assert "source_table" not in yaml_table
        _assert_no_secrets_or_connector_id(yaml_table)


class TestWebRefreshKeepsSourceInfo:
    def test_refresh_data_updates_parquet_and_keeps_web_source_info(
        self, tmp_workspace,
    ):
        from data_formulator.data_connector import connectors_bp
        from data_formulator.data_loader.web_data_loader import WebDataLoader
        from data_formulator.error_handler import register_error_handlers

        loader, meta = _ingest_web_csv(tmp_workspace, table_name="web_sales")
        before = tmp_workspace.get_table_metadata(meta.name)
        assert before is not None
        before_hash = before.content_hash
        before_source_table = before.source_table
        before_rows = _parquet_rows(tmp_workspace, meta.name)
        assert len(before_rows) == 2

        app = Flask(__name__)
        app.config["TESTING"] = True
        app.register_blueprint(connectors_bp)
        register_error_handlers(app)

        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_csv_fetch(content=REFRESHED_CSV_BYTES),
        ) as fetch_mock, patch(
            "data_formulator.data_connector._resolve_connector",
            return_value=_WebRefreshSource(loader),
        ), patch(
            "data_formulator.auth.identity.get_identity_id",
            return_value="test-user",
        ), patch(
            "data_formulator.workspace_factory.get_workspace",
            return_value=tmp_workspace,
        ):
            resp = app.test_client().post(
                "/api/connectors/refresh-data",
                json={
                    "connector_id": "web:sales",
                    "table_name": meta.name,
                },
            )

        fetch_mock.assert_called()
        body = resp.get_json()
        assert resp.status_code == 200
        assert body["status"] == "success"
        assert body["data"]["data_changed"] is True
        assert body["data"]["row_count"] == 3

        stored = tmp_workspace.get_table_metadata(meta.name)
        assert stored is not None
        assert stored.loader_type == "WebDataLoader"
        assert stored.loader_type == WebDataLoader.__name__
        assert stored.source_table
        assert stored.source_table == before_source_table
        assert stored.source_table == assert_source_table_identifier(
            stored.source_table, allow_spaces=True,
        )
        assert stored.loader_params is not None
        assert stored.loader_params.get("url") == PUBLIC_CSV_URL
        assert "authorization" not in stored.loader_params
        assert "secret-token" not in json.dumps(stored.loader_params)
        _assert_table_metadata_has_no_connector_id(stored)
        _assert_no_secrets_or_connector_id(stored.to_dict())
        _assert_no_secrets_or_connector_id(stored.loader_params)

        yaml_table = _workspace_yaml_table(tmp_workspace, stored.name)
        assert yaml_table.get("loader_type") == "WebDataLoader"
        assert yaml_table.get("source_table") == stored.source_table
        assert (yaml_table.get("loader_params") or {}).get("url") == PUBLIC_CSV_URL
        assert "authorization" not in (yaml_table.get("loader_params") or {})
        _assert_no_secrets_or_connector_id(yaml_table)

        after_rows = _parquet_rows(tmp_workspace, stored.name)
        assert after_rows != before_rows
        assert len(after_rows) == 3
        assert stored.content_hash != before_hash
        assert stored.row_count == 3
