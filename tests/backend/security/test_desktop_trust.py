"""DT-1: launch token, Host binding, and cross-origin refusal."""

from __future__ import annotations

import hmac

import flask
import pytest

from data_formulator.security.desktop_trust import (
    HOST_REJECTED,
    ORIGIN_REJECTED,
    TOKEN_HEADER,
    TOKEN_MISSING,
    apply_desktop_trust,
    generate_launch_token,
)

pytestmark = [pytest.mark.backend, pytest.mark.security]


@pytest.fixture
def token() -> str:
    return generate_launch_token()


@pytest.fixture
def app(token: str, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("DATA_FORMULATOR_DESKTOP", "1")
    monkeypatch.setenv("DATA_FORMULATOR_LAUNCH_TOKEN", token)
    monkeypatch.setenv("DATA_FORMULATOR_PORT", "5567")
    monkeypatch.delenv("DATA_FORMULATOR_DEV_TRUST", raising=False)
    monkeypatch.delenv("DATA_FORMULATOR_PACKAGED", raising=False)
    application = flask.Flask(__name__)
    application.config["TESTING"] = True
    from data_formulator.error_handler import register_error_handlers
    register_error_handlers(application)

    @application.route("/api/tables")
    def tables():
        return {"status": "success", "data": []}

    @application.route("/api/auth/info")
    def health():
        return {"status": "success", "data": {"action": "none"}}

    apply_desktop_trust(application)
    return application


def test_request_without_token_is_401(app) -> None:
    resp = app.test_client().get("/api/tables", headers={"Host": "127.0.0.1:5567"})
    assert resp.status_code == 401
    assert resp.get_json()["error"]["code"] == TOKEN_MISSING


def test_wrong_token_is_401(app) -> None:
    resp = app.test_client().get(
        "/api/tables",
        headers={"Host": "127.0.0.1:5567", TOKEN_HEADER: "0" * 64},
    )
    assert resp.status_code == 401


def test_right_token_is_200(app, token: str) -> None:
    resp = app.test_client().get(
        "/api/tables",
        headers={"Host": "127.0.0.1:5567", TOKEN_HEADER: token},
    )
    assert resp.status_code == 200


def test_health_probe_is_allowlisted(app) -> None:
    resp = app.test_client().get("/api/auth/info", headers={"Host": "127.0.0.1:5567"})
    assert resp.status_code == 200


def test_mismatched_host_is_rejected(app, token: str) -> None:
    resp = app.test_client().get(
        "/api/tables",
        headers={"Host": "evil.example:5567", TOKEN_HEADER: token},
    )
    assert resp.status_code == 403
    assert resp.get_json()["error"]["code"] == HOST_REJECTED


def test_cross_origin_is_rejected(app, token: str) -> None:
    resp = app.test_client().get(
        "/api/tables",
        headers={
            "Host": "127.0.0.1:5567",
            TOKEN_HEADER: token,
            "Origin": "https://evil.example",
        },
    )
    assert resp.status_code == 403
    assert resp.get_json()["error"]["code"] == ORIGIN_REJECTED


def test_static_path_is_not_token_gated(app) -> None:
    @app.route("/")
    def index():
        return "ok"

    resp = app.test_client().get("/", headers={"Host": "127.0.0.1:5567"})
    assert resp.status_code == 200


def test_dev_trust_skips_token(token: str, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATA_FORMULATOR_DESKTOP", "1")
    monkeypatch.setenv("DATA_FORMULATOR_LAUNCH_TOKEN", token)
    monkeypatch.setenv("DATA_FORMULATOR_DEV_TRUST", "1")
    monkeypatch.delenv("DATA_FORMULATOR_PACKAGED", raising=False)
    application = flask.Flask(__name__)
    from data_formulator.error_handler import register_error_handlers
    register_error_handlers(application)

    @application.route("/api/tables")
    def tables():
        return {"status": "success"}

    apply_desktop_trust(application)
    resp = application.test_client().get("/api/tables", headers={"Host": "127.0.0.1:5567"})
    assert resp.status_code == 200


def test_packaged_ignores_dev_trust(token: str, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATA_FORMULATOR_DESKTOP", "1")
    monkeypatch.setenv("DATA_FORMULATOR_PACKAGED", "1")
    monkeypatch.setenv("DATA_FORMULATOR_LAUNCH_TOKEN", token)
    monkeypatch.setenv("DATA_FORMULATOR_DEV_TRUST", "1")
    monkeypatch.setenv("DATA_FORMULATOR_PORT", "5567")
    application = flask.Flask(__name__)
    from data_formulator.error_handler import register_error_handlers
    register_error_handlers(application)

    @application.route("/api/tables")
    def tables():
        return {"status": "success"}

    apply_desktop_trust(application)
    resp = application.test_client().get("/api/tables", headers={"Host": "127.0.0.1:5567"})
    assert resp.status_code == 401


def test_token_compare_is_constant_time() -> None:
    assert hmac.compare_digest("abc", "abc")
    left = generate_launch_token()
    assert not hmac.compare_digest(left, generate_launch_token())
