"""DT-10: hosted application-auth and demo surfaces are gone.

Background
----------
Desktop-only Datly uses the OS account. Password login, anonymous
migration routes, and the demo-stream blueprint must not ship.
"""

from __future__ import annotations

from pathlib import Path

import pytest

pytestmark = [pytest.mark.backend]

REPO_ROOT = Path(__file__).resolve().parents[3]
REMOVED_MODULES = [
    "py-src/data_formulator/routes/password_auth.py",
    "py-src/data_formulator/routes/password_reset.py",
    "py-src/data_formulator/routes/demo_stream.py",
    "py-src/data_formulator/auth/user_store.py",
    "py-src/data_formulator/auth/reset_tokens.py",
    "py-src/data_formulator/auth/csrf.py",
    "py-src/data_formulator/datalake/ephemeral_workspace.py",
    "src/views/auth/LoginScreen.tsx",
    "src/views/auth/SignupScreen.tsx",
    "src/app/AuthButton.tsx",
    "src/app/OidcCallback.tsx",
    "src/app/IdentityMigrationDialog.tsx",
    "src/app/passwordAuth.ts",
    "src/app/oidcConfig.ts",
    "src/views/ShareSheet.tsx",
    "py-src/data_formulator/auth/providers/base.py",
    "py-src/data_formulator/auth/providers/oidc.py",
    "py-src/data_formulator/auth/providers/github_oauth.py",
    "py-src/data_formulator/auth/providers/azure_easyauth.py",
    "py-src/data_formulator/auth/gateways/oidc_gateway.py",
    "py-src/data_formulator/auth/gateways/github_gateway.py",
]


def test_hosted_modules_are_deleted() -> None:
    missing = [rel for rel in REMOVED_MODULES if (REPO_ROOT / rel).exists()]
    assert missing == []


def test_app_does_not_register_hosted_routes() -> None:
    from data_formulator.app import app

    rules = {rule.rule for rule in app.url_map.iter_rules()}
    assert not any(path.startswith("/api/auth/password") for path in rules)
    assert not any(path.startswith("/api/auth/oidc") for path in rules)
    assert not any(path.startswith("/api/auth/github") for path in rules)
    assert "/auth/callback" not in rules
    assert not any(path.startswith("/api/demo-stream") for path in rules)
    assert "/api/sessions/migrate" not in rules
    assert "/api/sessions/cleanup-anonymous" not in rules


def test_connector_token_routes_stay_registered() -> None:
    """Data-source token endpoints are not application login."""
    from data_formulator.app import app

    rules = {rule.rule for rule in app.url_map.iter_rules()}
    assert "/api/auth/tokens/save" in rules
    assert "/api/auth/service-status" in rules
    assert any(path.startswith("/api/auth/kusto") for path in rules)


def test_app_config_has_no_anonymous_flag() -> None:
    from data_formulator.app import app

    with app.test_request_context():
        resp, status = app.view_functions["get_app_config"]()
        assert status == 200
        payload = resp.get_json()
        data = payload.get("data", payload)
        assert "ALLOW_ANONYMOUS" not in data
        assert data.get("IDENTITY", {}).get("type") == "local"
