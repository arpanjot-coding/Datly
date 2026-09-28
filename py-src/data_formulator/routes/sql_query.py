"""Read-only SQL against workspace parquet views."""

from __future__ import annotations

import logging

from flask import Blueprint, request

from data_formulator.agents.agent_utils_sql import create_duckdb_conn_with_parquet_views
from data_formulator.auth.identity import get_identity_id
from data_formulator.error_handler import json_ok
from data_formulator.errors import AppError, ErrorCode
from data_formulator.sql_guard import guard_sql
from data_formulator.workspace_factory import get_workspace

logger = logging.getLogger(__name__)

sql_bp = Blueprint("sql_query", __name__, url_prefix="/api/sql")

_DEFAULT_LIMIT = 1000
_MAX_LIMIT = 5000


@sql_bp.route("/query", methods=["POST"])
def run_query():
    identity_id = get_identity_id()
    if not identity_id:
        raise AppError(ErrorCode.AUTH_REQUIRED, "Identity ID required")
    if not request.is_json:
        raise AppError(ErrorCode.INVALID_REQUEST, "JSON body required.")
    body = request.get_json(silent=True) or {}
    sql = body.get("sql")
    ok, reason = guard_sql(sql if isinstance(sql, str) else "")
    if not ok:
        raise AppError(ErrorCode.INVALID_REQUEST, reason)

    limit = body.get("limit", _DEFAULT_LIMIT)
    try:
        limit = int(limit)
    except (TypeError, ValueError) as exc:
        raise AppError(ErrorCode.INVALID_REQUEST, "limit must be an integer.") from exc
    limit = max(1, min(limit, _MAX_LIMIT))

    workspace = get_workspace(identity_id)
    names = workspace.list_tables()
    input_tables = [{"name": name} for name in names]
    conn = create_duckdb_conn_with_parquet_views(workspace, input_tables)
    wrapped = f"SELECT * FROM ({sql.strip().rstrip(';')}) AS _df_q LIMIT {limit + 1}"
    try:
        result = conn.execute(wrapped)
        columns = [d[0] for d in result.description] if result.description else []
        rows = result.fetchall()
    except Exception as exc:
        logger.info("sql query failed: %s", type(exc).__name__)
        raise AppError(ErrorCode.INVALID_REQUEST, "Query failed.") from exc
    finally:
        conn.close()

    truncated = len(rows) > limit
    if truncated:
        rows = rows[:limit]
    safe_rows = []
    for row in rows:
        safe_rows.append([_json_cell(cell) for cell in row])
    return json_ok({"columns": columns, "rows": safe_rows, "truncated": truncated})


def _json_cell(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)
