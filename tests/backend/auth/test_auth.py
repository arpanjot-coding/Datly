"""Desktop identity extraction and validation."""

import flask
import pytest

import data_formulator.auth.identity as auth_module
from data_formulator.auth.identity import get_identity_id, _validate_identity_value

pytestmark = [pytest.mark.backend]


@pytest.fixture
def app():
    application = flask.Flask(__name__)
    application.config["TESTING"] = True
    return application


@pytest.fixture(autouse=True)
def _reset_auth_state(monkeypatch):
    monkeypatch.setattr(auth_module, "_localhost_identity", None)


class TestValidateIdentityValue:

    def test_valid_uuid(self):
        val = _validate_identity_value("550e8400-e29b-41d4-a716-446655440000", "test")
        assert val == "550e8400-e29b-41d4-a716-446655440000"

    def test_valid_email(self):
        val = _validate_identity_value("alice@example.com", "test")
        assert val == "alice@example.com"

    def test_strips_whitespace(self):
        val = _validate_identity_value("  alice@example.com  ", "test")
        assert val == "alice@example.com"

    def test_empty_raises(self):
        with pytest.raises(ValueError, match="Empty"):
            _validate_identity_value("", "test")

    def test_whitespace_only_raises(self):
        with pytest.raises(ValueError, match="Empty"):
            _validate_identity_value("   ", "test")

    def test_too_long_raises(self):
        with pytest.raises(ValueError, match="exceeds"):
            _validate_identity_value("a" * 300, "test")

    def test_path_separator_rejected(self):
        with pytest.raises(ValueError, match="disallowed"):
            _validate_identity_value("../../etc/passwd", "test")

    def test_shell_metachar_rejected(self):
        with pytest.raises(ValueError, match="disallowed"):
            _validate_identity_value("user; rm -rf /", "test")

    def test_control_chars_rejected(self):
        with pytest.raises(ValueError, match="disallowed"):
            _validate_identity_value("user\x00name", "test")


class TestGetIdentityId:

    def test_x_identity_header_is_ignored_without_init(self, app):
        with app.test_request_context(
            headers={"X-Identity-Id": "550e8400-e29b-41d4-a716-446655440000"}
        ):
            with pytest.raises(ValueError, match="Desktop identity"):
                get_identity_id()

    def test_client_cannot_spoof_user_prefix(self, app):
        auth_module.init_auth(app)
        with app.test_request_context(
            headers={"X-Identity-Id": "user:alice@example.com"}
        ):
            identity = get_identity_id()
            assert identity.startswith("local:")
            assert "alice@example.com" not in identity

    def test_missing_init_raises(self, app):
        with app.test_request_context():
            with pytest.raises(ValueError, match="Desktop identity"):
                get_identity_id()

    def test_browser_header_never_creates_browser_identity(self, app):
        auth_module.init_auth(app)
        with app.test_request_context(
            headers={"X-Identity-Id": "browser:my-uuid-123"}
        ):
            identity = get_identity_id()
            assert identity.startswith("local:")
            assert "my-uuid-123" not in identity
