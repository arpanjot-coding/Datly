"""Desktop identity ignores every hosted auth environment variable.

Datly has no application login. ``init_auth`` always binds the OS
account, whatever AUTH_PROVIDER / OIDC_* / ALLOW_ANONYMOUS say.
"""
from __future__ import annotations

import flask
import pytest

import data_formulator.auth.identity as auth_module
from data_formulator.auth.identity import (
    get_identity_id,
    init_auth,
    _validate_identity_value,
)

pytestmark = [pytest.mark.backend, pytest.mark.auth]


@pytest.fixture
def app():
    _app = flask.Flask(__name__)
    _app.config["TESTING"] = True
    return _app


@pytest.fixture(autouse=True)
def _reset_auth_state(monkeypatch):
    monkeypatch.setattr(auth_module, "_localhost_identity", None)


class TestInitAuth:

    def test_no_env_var_uses_desktop_identity(self, app, monkeypatch):
        monkeypatch.delenv("AUTH_PROVIDER", raising=False)
        init_auth(app)
        assert auth_module._localhost_identity is not None
        assert auth_module._localhost_identity.startswith("local:")

    def test_auth_provider_env_is_ignored(self, app, monkeypatch):
        monkeypatch.setenv("AUTH_PROVIDER", "azure_easyauth")
        init_auth(app)
        assert auth_module._localhost_identity.startswith("local:")

    def test_oidc_env_is_ignored(self, app, monkeypatch):
        monkeypatch.setenv("AUTH_PROVIDER", "oidc")
        monkeypatch.setenv("OIDC_ISSUER_URL", "https://idp.example.com")
        monkeypatch.setenv("OIDC_CLIENT_ID", "test-client")
        init_auth(app)
        assert auth_module._localhost_identity.startswith("local:")

    def test_allow_anonymous_env_is_ignored(self, app, monkeypatch):
        monkeypatch.setenv("ALLOW_ANONYMOUS", "false")
        monkeypatch.delenv("AUTH_PROVIDER", raising=False)
        init_auth(app)
        assert auth_module._localhost_identity.startswith("local:")


class TestDesktopFallback:

    def test_uninitialised_identity_raises(self, app):
        with app.test_request_context():
            with pytest.raises(ValueError, match="Desktop identity"):
                get_identity_id()

    def test_init_auth_enables_os_identity(self, app, monkeypatch):
        monkeypatch.delenv("AUTH_PROVIDER", raising=False)
        init_auth(app)
        with app.test_request_context(
            headers={"X-Identity-Id": "user:alice@corp.com"}
        ):
            identity = get_identity_id()
            assert identity.startswith("local:")
            assert "alice@corp.com" not in identity


class TestNoApplicationAuthSurface:

    def test_identity_module_exposes_no_provider_hooks(self):
        for removed in ("get_active_provider", "get_auth_result", "get_sso_token"):
            assert not hasattr(auth_module, removed)

    @pytest.mark.parametrize("module", [
        "data_formulator.auth.providers.base",
        "data_formulator.auth.providers.oidc",
        "data_formulator.auth.providers.github_oauth",
        "data_formulator.auth.providers.azure_easyauth",
        "data_formulator.auth.gateways.oidc_gateway",
        "data_formulator.auth.gateways.github_gateway",
    ])
    def test_application_login_modules_are_gone(self, module):
        import importlib
        with pytest.raises(ImportError):
            importlib.import_module(module)


class TestIdentityRegexExpansion:

    @pytest.mark.parametrize("value", [
        "auth0|5f1234abc",
        "github:12345",
        "user+tag@example.com",
    ])
    def test_oidc_style_sub_claims_accepted(self, value):
        assert _validate_identity_value(value, "test") == value

    def test_path_separator_still_rejected(self):
        with pytest.raises(ValueError, match="disallowed"):
            _validate_identity_value("../../etc/passwd", "test")

    def test_space_still_rejected(self):
        with pytest.raises(ValueError, match="disallowed"):
            _validate_identity_value("user name", "test")
