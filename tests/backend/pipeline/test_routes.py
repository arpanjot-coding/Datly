"""Tests for pipeline API routes."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import flask
import pandas as pd
import pytest

from data_formulator.error_handler import register_error_handlers
from data_formulator.routes.pipeline import pipeline_bp

pytestmark = [pytest.mark.backend]


@pytest.fixture
def app():
    _app = flask.Flask(__name__)
    _app.config["TESTING"] = True
    _app.config["SECRET_KEY"] = "test-secret"
    _app.config["CLI_ARGS"] = {"sandbox": "local"}
    _app.register_blueprint(pipeline_bp)
    register_error_handlers(_app)
    return _app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def workspace(tmp_path: Path):
    from data_formulator.security.path_safety import ConfinedDir

    ws = MagicMock()
    root = tmp_path / "ws"
    root.mkdir()
    ws.confined_root = ConfinedDir(root)
    df = pd.DataFrame({"a": [1, 2, None], "b": ["x", "x", "y"]})
    ws.read_data_as_df.return_value = df
    ws.get_relative_data_file_path.return_value = "data/test.parquet"
    ws.write_parquet.return_value = type("Written", (), {"name": "test_clean"})()
    return ws


class TestPipelineRoutes:
    def test_profile_table(self, client, workspace):
        with (
            patch("data_formulator.routes.pipeline._workspace", return_value=workspace),
            patch("data_formulator.routes.pipeline.analyze_table_statistics") as analyze,
        ):
            analyze.return_value = [
                {"column": "a", "type": "int64", "statistics": {"count": 2, "unique_count": 2, "null_count": 1}},
            ]
            resp = client.post("/api/pipeline/profile", json={"table_name": "sales"})
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["status"] == "success"
        assert body["data"]["profile"]["table_name"] == "sales"
        assert "quality_score" in body["data"]["profile"]

    def test_run_default_load_pipeline(self, client, workspace):
        with (
            patch("data_formulator.routes.pipeline._workspace", return_value=workspace),
            patch("data_formulator.routes.pipeline.analyze_table_statistics") as analyze,
            patch("data_formulator.sandbox.create_sandbox") as sandbox_factory,
        ):
            analyze.return_value = [
                {"column": "name", "type": "object", "statistics": {"count": 3, "unique_count": 2, "null_count": 0}},
            ]
            sandbox = MagicMock()
            sandbox.run_python_code.return_value = {"status": "ok", "content": pd.DataFrame({"name": ["a", "b"]})}
            sandbox_factory.return_value = sandbox
            resp = client.post("/api/pipeline/run", json={"table_name": "sales", "trigger": "load"})
        assert resp.status_code == 200
        run = resp.get_json()["data"]["run"]
        assert run["status"] == "completed"
        assert len(run["steps"]) >= 2
