"""Read the local audit trail."""

from flask import Blueprint, request

from data_formulator.audit.store import get_audit_store
from data_formulator.error_handler import json_ok
from data_formulator.errors import AppError, ErrorCode

audit_bp = Blueprint("audit", __name__, url_prefix="/api/audit")


@audit_bp.route("/recent", methods=["GET"])
def recent_events():
    try:
        limit = int(request.args.get("limit", 50))
    except ValueError:
        raise AppError(ErrorCode.VALIDATION_ERROR, "limit must be an integer")
    limit = max(1, min(limit, 200))
    return json_ok({"events": get_audit_store().recent(limit)})
