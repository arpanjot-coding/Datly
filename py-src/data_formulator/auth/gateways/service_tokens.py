"""Data-source token routes.

These endpoints manage credentials for *external systems* (Superset,
Kusto, and other connectors), not for signing in to Datly. The desktop
app has no application login; identity is the OS account.
"""

from __future__ import annotations

import logging

from flask import Blueprint, request

from data_formulator.auth.token_store import TokenStore
from data_formulator.error_handler import json_ok
from data_formulator.errors import AppError, ErrorCode

logger = logging.getLogger(__name__)

auth_tokens_bp = Blueprint("auth_tokens", __name__, url_prefix="/api/auth")


@auth_tokens_bp.route("/tokens/save", methods=["POST"])
def save_delegated_token():
    """Receive a token from the connector popup and cache it.

    Called after the popup postMessage flow completes.
    """
    data = request.get_json(force=True)
    system_id = data.get("system_id")
    access_token = data.get("access_token")
    if not system_id or not access_token:
        raise AppError(ErrorCode.INVALID_REQUEST, "system_id and access_token required")

    token_store = TokenStore()
    token_store.store_service_token(
        system_id=system_id,
        access_token=access_token,
        refresh_token=data.get("refresh_token"),
        expires_in=data.get("expires_in", 3600),
        user=data.get("user"),
    )

    if data.get("remember"):
        token_store._vault_store(system_id, {
            "access_token": access_token,
            "refresh_token": data.get("refresh_token"),
        })

    return json_ok({"saved": True})


@auth_tokens_bp.route("/tokens/<system_id>", methods=["DELETE"])
def clear_service_token(system_id: str):
    """Disconnect from a specific service (clear its cached token)."""
    token_store = TokenStore()
    token_store.clear_service_token(system_id)
    return json_ok({"cleared": True})


@auth_tokens_bp.route("/service-status", methods=["GET"])
def auth_service_status():
    """Return authorization status for all configured systems.

    Agent calls this before starting analysis.
    Frontend calls this to show connection indicators.
    """
    token_store = TokenStore()
    return json_ok(token_store.get_auth_status())
