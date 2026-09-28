"""CORS helper that never pairs Access-Control-Allow-Origin=* with credentials."""

from __future__ import annotations

import os

from flask import request


def cors_origin_parts() -> list[str]:
    cfg = (os.environ.get("CORS_ORIGIN") or "").strip()
    return [p.strip() for p in cfg.split(",") if p.strip()]


def cors_has_wildcard(parts: list[str] | None = None) -> bool:
    return any(p == "*" for p in (parts if parts is not None else cors_origin_parts()))


def apply_cors(
    response,
    *,
    credentials: bool = False,
    allow_headers: str = "Content-Type",
):
    """Set CORS headers from CORS_ORIGIN.

    ``*`` is never combined with ``Access-Control-Allow-Credentials``.
    Credentialed responses echo a matching explicit origin only.
    """
    parts = cors_origin_parts()
    if not parts:
        return response
    wildcard = cors_has_wildcard(parts)
    if wildcard:
        if credentials:
            return response
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = allow_headers
        response.headers.pop("Access-Control-Allow-Credentials", None)
        return response

    req_origin = (request.headers.get("Origin") or "").strip()
    if req_origin:
        if req_origin not in parts:
            return response
        allow = req_origin
    elif len(parts) == 1:
        allow = parts[0]
    else:
        return response

    response.headers["Access-Control-Allow-Origin"] = allow
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = allow_headers
    response.headers["Vary"] = "Origin"
    if credentials:
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
