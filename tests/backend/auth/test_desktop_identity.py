"""Desktop identity: the OS account is the only identity.

Background
----------
DT-10 deletes the hosted anonymous path. On a single-user desktop the OS
user is the identity. Client-supplied ``X-Identity-Id`` headers must not
create a ``browser:`` workspace.
"""

from __future__ import annotations

import getpass

import flask
import pytest

import data_formulator.auth.identity as auth_module
from data_formulator.auth.identity import get_identity_id, init_auth

pytestmark = [pytest.mark.backend]


@pytest.fixture
def app():
    application = flask.Flask(__name__)
    application.config["TESTING"] = True
    application.config["CLI_ARGS"] = {"host": "127.0.0.1"}
    return application


@pytest.fixture
def desktop_auth(app, monkeypatch):
    monkeypatch.delenv("AUTH_PROVIDER", raising=False)
    monkeypatch.delenv("ALLOW_ANONYMOUS", raising=False)
    init_auth(app)
    return app


class TestDesktopIdentity:
    def test_identity_is_local_os_user(self, desktop_auth):
        expected = f"local:{getpass.getuser()}"
        with desktop_auth.test_request_context():
            assert get_identity_id() == expected

    def test_x_identity_header_is_ignored(self, desktop_auth):
        expected = f"local:{getpass.getuser()}"
        with desktop_auth.test_request_context(
            headers={"X-Identity-Id": "browser:spoofed-uuid"}
        ):
            assert get_identity_id() == expected

    def test_client_cannot_spoof_user_prefix(self, desktop_auth):
        with desktop_auth.test_request_context(
            headers={"X-Identity-Id": "user:alice@example.com"}
        ):
            identity = get_identity_id()
            assert identity.startswith("local:")
            assert "alice@example.com" not in identity

    def test_never_returns_browser_prefix(self, desktop_auth):
        with desktop_auth.test_request_context(
            headers={"X-Identity-Id": "550e8400-e29b-41d4-a716-446655440000"}
        ):
            assert not get_identity_id().startswith("browser:")

    def test_non_loopback_host_still_uses_os_user(self, app, monkeypatch):
        monkeypatch.delenv("AUTH_PROVIDER", raising=False)
        app.config["CLI_ARGS"] = {"host": "0.0.0.0"}
        init_auth(app)
        with app.test_request_context():
            assert get_identity_id() == f"local:{getpass.getuser()}"
