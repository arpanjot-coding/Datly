"""Session cookie policy for the desktop app.

The Flask session carries connector tokens only; Datly has no
application login, so there is no password session to expire.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from flask import Flask, current_app

logger = logging.getLogger(__name__)

LOCAL_SESSION_SECONDS = 60 * 60 * 24 * 365
SESSION_COOKIE_NAME = "df_session"

_TRUE = ("true", "1", "yes")
_LOOPBACK = ("127.0.0.1", "localhost", "::1")


def _flag(name: str, default: str = "false") -> bool:
    return os.environ.get(name, default).strip().lower() in _TRUE


def _host(app: Optional[Flask] = None) -> str:
    host = os.environ.get("HOST", "127.0.0.1")
    target = app
    if target is None:
        try:
            target = current_app._get_current_object()  # type: ignore[attr-defined]
        except RuntimeError:
            target = None
    if target is not None:
        host = (target.config.get("CLI_ARGS") or {}).get("host") or host
    return str(host).strip().lower()


def _is_debug(app: Optional[Flask] = None) -> bool:
    if _flag("DEV_MODE") or _flag("FLASK_DEBUG"):
        return True
    target = app
    if target is None:
        try:
            target = current_app._get_current_object()  # type: ignore[attr-defined]
        except RuntimeError:
            target = None
    if target is None:
        return False
    if target.debug or target.config.get("DEBUG"):
        return True
    return bool((target.config.get("CLI_ARGS") or {}).get("dev"))


def session_cookie_secure(app: Optional[Flask] = None) -> bool:
    """Secure cookies unless this is debug or a loopback bind."""
    if _is_debug(app):
        return False
    return _host(app) not in _LOOPBACK


def apply_session_cookie_config(app: Flask) -> None:
    """HttpOnly + SameSite=Lax session cookie scoped to the local app."""
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = session_cookie_secure(app)
    app.config["SESSION_COOKIE_NAME"] = SESSION_COOKIE_NAME
    app.config["PERMANENT_SESSION_LIFETIME"] = LOCAL_SESSION_SECONDS
