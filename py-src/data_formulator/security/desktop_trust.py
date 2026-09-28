"""Loopback trust boundary for the Electron sidecar.

A launch token is generated in the Electron main process and passed to
the backend through the environment. Requests must present that token.
The Host header must be loopback, and a foreign Origin is refused.
"""

from __future__ import annotations

import hmac
import logging
import os
import secrets
from typing import Iterable

from flask import Flask, g, request

from data_formulator.errors import AppError, ErrorCode

logger = logging.getLogger(__name__)

TOKEN_ENV = "DATA_FORMULATOR_LAUNCH_TOKEN"
TOKEN_HEADER = "X-Datly-Launch-Token"
PACKAGED_ENV = "DATA_FORMULATOR_PACKAGED"
DESKTOP_ENV = "DATA_FORMULATOR_DESKTOP"
DEV_TRUST_ENV = "DATA_FORMULATOR_DEV_TRUST"
PORT_ENV = "DATA_FORMULATOR_PORT"

TOKEN_MISSING = ErrorCode.AUTH_REQUIRED
HOST_REJECTED = ErrorCode.ACCESS_DENIED
ORIGIN_REJECTED = ErrorCode.ACCESS_DENIED

HEALTH_PATHS = frozenset({"/api/auth/info"})
LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})


def generate_launch_token() -> str:
    return secrets.token_hex(32)


def _packaged() -> bool:
    return os.environ.get(PACKAGED_ENV, "").lower() in ("1", "true", "yes")


def _desktop() -> bool:
    return os.environ.get(DESKTOP_ENV, "").lower() in ("1", "true", "yes")


def _dev_trust() -> bool:
    if _packaged():
        return False
    return os.environ.get(DEV_TRUST_ENV, "").lower() in ("1", "true", "yes")


def token_required() -> bool:
    """True when the launch token is the authentication mechanism."""
    if _dev_trust():
        return False
    if os.environ.get(TOKEN_ENV):
        return True
    return _desktop() or _packaged()


def expected_token() -> str:
    return os.environ.get(TOKEN_ENV, "")


def _expected_port() -> str:
    return os.environ.get(PORT_ENV, "") or str(request.environ.get("SERVER_PORT") or "")


def _host_allowed() -> bool:
    host_header = (request.host or "").split("%")[0]
    hostname, _, port = host_header.partition(":")
    hostname = hostname.strip("[]").lower()
    if hostname not in LOOPBACK_HOSTS:
        return False
    expected = _expected_port()
    if expected and port and port != expected:
        return False
    if hostname != "127.0.0.1" and hostname != "localhost":
        return False
    return True


def _origin_allowed() -> bool:
    origin = request.headers.get("Origin")
    if not origin:
        return True
    try:
        from urllib.parse import urlparse
        parsed = urlparse(origin)
    except ValueError:
        return False
    host = (parsed.hostname or "").lower()
    if host not in LOOPBACK_HOSTS:
        return False
    if _dev_trust() and parsed.port in {5173, 4173}:
        return True
    expected = _expected_port()
    if expected and parsed.port and str(parsed.port) != expected:
        return False
    return True


def _token_matches(provided: str) -> bool:
    expected = expected_token()
    if not expected or not provided:
        return False
    if len(expected) != len(provided):
        # compare_digest requires equal length; still do a dummy compare
        dummy = expected
        hmac.compare_digest(dummy, dummy)
        return False
    return hmac.compare_digest(expected, provided)


def apply_desktop_trust(app: Flask, extra_health: Iterable[str] = ()) -> None:
    allow = HEALTH_PATHS | frozenset(extra_health)

    @app.before_request
    def _enforce_desktop_trust():
        if request.path in allow:
            return None
        if not request.path.startswith("/api/"):
            return None
        if not token_required():
            return None
        if not _host_allowed():
            logger.warning("Rejected request with Host=%s", request.host)
            raise AppError(ErrorCode.ACCESS_DENIED, "Invalid Host header.")
        if not _origin_allowed():
            logger.warning("Rejected cross-origin request Origin=%s", request.headers.get("Origin"))
            raise AppError(ErrorCode.ACCESS_DENIED, "Cross-origin request refused.")
        provided = request.headers.get(TOKEN_HEADER, "")
        if not _token_matches(provided):
            raise AppError(ErrorCode.AUTH_REQUIRED, "Launch token required.")
        g.desktop_trusted = True
        return None


def apply_security_headers(app: Flask) -> None:
    @app.after_request
    def _security_headers(response):
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data: blob:; "
            "style-src 'self' 'unsafe-inline'; script-src 'self'; "
            "connect-src 'self' http://127.0.0.1:* http://localhost:*; "
            "frame-ancestors 'none'",
        )
        return response
