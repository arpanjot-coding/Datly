"""Unit tests for the export / import session routes.

Verifies that the endpoints correctly route to the specified workspace_id
instead of relying on the X-Workspace-Id header.
"""

from __future__ import annotations

import io
import json
import zipfile
from unittest.mock import MagicMock, patch

import flask
import pytest

from data_formulator.routes.sessions import session_bp

pytestmark = [pytest.mark.backend]


@pytest.fixture
def app():
    from data_formulator.error_handler import register_error_handlers

    _app = flask.Flask(__name__)
    _app.config["TESTING"] = True
    _app.register_blueprint(session_bp)
    register_error_handlers(_app)
    return _app


@pytest.fixture
def client(app):
    return app.test_client()


def _make_zip_bytes(state: dict | None = None) -> bytes:
    """Build a minimal session zip with a state.json entry."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("state.json", json.dumps(state or {"tables": []}))
    buf.seek(0)
    return buf.read()


# ── Export ────────────────────────────────────────────────────────────────


class TestExportSession:
    def test_export_uses_workspace_id_from_body(self, client):
        ws = MagicMock()
        zip_buf = io.BytesIO(_make_zip_bytes())
        ws.export_session_zip.return_value = zip_buf

        mgr = MagicMock()
        mgr.workspace_exists.return_value = True
        mgr.open_workspace.return_value = ws

        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:alice"),
            patch("data_formulator.routes.sessions.get_workspace_manager", return_value=mgr),
            patch("data_formulator.datalake.workspace_manager._strip_sensitive", side_effect=lambda s: s),
        ):
            resp = client.post(
                "/api/sessions/export",
                json={"state": {"tables": []}, "workspace_id": "ws-123"},
            )

        assert resp.status_code == 200
        assert resp.content_type.startswith("application/zip")
        mgr.open_workspace.assert_called_once_with("ws-123", "user:alice")

    def test_export_rejects_missing_workspace_id(self, client):
        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:alice"),
        ):
            resp = client.post(
                "/api/sessions/export",
                json={"state": {"tables": []}},
            )

        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "error"
        assert body["error"]["code"] == "INVALID_REQUEST"
        assert "workspace_id" in body["error"]["message"]

    def test_export_rejects_missing_state(self, client):
        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:alice"),
        ):
            resp = client.post(
                "/api/sessions/export",
                json={"workspace_id": "ws-123"},
            )

        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "error"
        assert body["error"]["code"] == "INVALID_REQUEST"

    def test_export_returns_error_for_unknown_workspace(self, client):
        mgr = MagicMock()
        mgr.workspace_exists.return_value = False

        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:alice"),
            patch("data_formulator.routes.sessions.get_workspace_manager", return_value=mgr),
        ):
            resp = client.post(
                "/api/sessions/export",
                json={"state": {"tables": []}, "workspace_id": "nonexistent"},
            )

        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "error"
        assert body["error"]["code"] == "TABLE_NOT_FOUND"

# ── Import ────────────────────────────────────────────────────────────────


class TestImportSession:
    def test_import_creates_workspace_when_not_existing(self, client):
        ws = MagicMock()
        ws.import_session_zip.return_value = {
            "tables": [],
            "activeWorkspace": {"id": "ws-new", "displayName": "MySession"},
        }

        mgr = MagicMock()
        mgr.workspace_exists.return_value = False
        mgr.create_and_open_workspace.return_value = ws

        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:bob"),
            patch("data_formulator.routes.sessions.get_workspace_manager", return_value=mgr),
        ):
            data = {"file": (io.BytesIO(_make_zip_bytes()), "session.zip")}
            resp = client.post(
                "/api/sessions/import",
                data={**data, "workspace_id": "ws-new"},
                content_type="multipart/form-data",
            )

        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "success"
        mgr.create_and_open_workspace.assert_called_once_with("ws-new", "user:bob")

    def test_import_opens_existing_workspace(self, client):
        ws = MagicMock()
        ws.import_session_zip.return_value = {"tables": []}

        mgr = MagicMock()
        mgr.workspace_exists.return_value = True
        mgr.open_workspace.return_value = ws

        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:bob"),
            patch("data_formulator.routes.sessions.get_workspace_manager", return_value=mgr),
        ):
            data = {"file": (io.BytesIO(_make_zip_bytes()), "session.zip")}
            resp = client.post(
                "/api/sessions/import",
                data={**data, "workspace_id": "ws-existing"},
                content_type="multipart/form-data",
            )

        assert resp.status_code == 200
        mgr.open_workspace.assert_called_once_with("ws-existing", "user:bob")

    def test_import_falls_back_to_active_workspace(self, client):
        ws = MagicMock()
        ws.import_session_zip.return_value = {"tables": []}

        with (
            patch("data_formulator.routes.sessions.get_identity_id", return_value="user:bob"),
            patch("data_formulator.routes.sessions.get_workspace", return_value=ws),
        ):
            data = {"file": (io.BytesIO(_make_zip_bytes()), "session.zip")}
            resp = client.post(
                "/api/sessions/import",
                data=data,
                content_type="multipart/form-data",
            )

        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "success"

    def test_import_rejects_missing_file(self, client):
        resp = client.post(
            "/api/sessions/import",
            data={"workspace_id": "ws-1"},
            content_type="multipart/form-data",
        )

        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "error"
        assert body["error"]["code"] == "INVALID_REQUEST"


# ── Zip contents (parquet + yaml, no vault) ───────────────────────────────


class TestExportSessionZipContents:
    def test_zip_has_parquet_and_yaml_not_vault(self, tmp_path):
        """Workspace snapshot includes parquet + yaml. Vault stays outside the zip."""
        import pandas as pd

        from data_formulator.datalake.workspace import Workspace
        from data_formulator.datalake.workspace_metadata import METADATA_FILENAME

        data_home = tmp_path
        (data_home / ".vault_key").write_text("fake-fernet-key-not-used")
        (data_home / "credentials.db").write_bytes(b"sqlite-vault-blob")

        ws = Workspace("user:alice", root_dir=data_home / "workspaces")
        ws.write_parquet(pd.DataFrame({"a": [1, 2]}), "web_sales")

        buf = ws.export_session_zip({
            "inputTables": [{
                "id": "web_sales",
                "source": {"kind": "connector", "connectorId": "web:example-com"},
                "sourceConfig": {"type": "database", "connectorId": "web:example-com"},
            }],
        })

        with zipfile.ZipFile(buf) as zf:
            raw_names = zf.namelist()
            names = [name.replace("\\", "/") for name in raw_names]
            joined = "\n".join(names).lower()

            assert "state.json" in names
            assert f"workspace/{METADATA_FILENAME}" in names
            assert any(
                name.startswith("workspace/data/") and name.endswith(".parquet")
                for name in names
            )
            assert ".vault_key" not in joined
            assert "credentials.db" not in joined
            assert "vault" not in joined

            yaml_name = next(
                raw for raw, norm in zip(raw_names, names)
                if norm == f"workspace/{METADATA_FILENAME}"
            )
            yaml_text = zf.read(yaml_name).decode("utf-8")
            assert "connectorId" not in yaml_text
            assert "connector_id" not in yaml_text

            for name in raw_names:
                payload = zf.read(name)
                assert b"sqlite-vault-blob" not in payload
                assert b"fake-fernet-key-not-used" not in payload
