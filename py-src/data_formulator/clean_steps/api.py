"""Flask handler: compile, sign, and sandbox-run a grid clean verb."""

from __future__ import annotations

import logging

from flask import Blueprint, current_app, request

from data_formulator.auth.identity import get_identity_id
from data_formulator.clean_steps.compiler import compile_and_sign
from data_formulator.datalake.parquet_utils import df_to_safe_records
from data_formulator.error_handler import json_ok
from data_formulator.errors import AppError, ErrorCode
from data_formulator.security.sanitize import sanitize_error_message
from data_formulator.workspace_factory import get_workspace

logger = logging.getLogger(__name__)


def register_clean_step_routes(bp: Blueprint) -> None:
    bp.add_url_rule(
        "/compile-clean-step",
        view_func=compile_clean_step_view,
        methods=["POST"],
    )


def compile_clean_step_view():
    """Compile a templated clean verb, sign it, sandbox-run it, write parquet."""
    from data_formulator.sandbox import create_sandbox

    data = request.get_json(silent=True) or {}
    verb = data.get("verb")
    params = data.get("params") or {}
    source_table = data.get("source_table")
    output_table_name = data.get("output_table_name")

    if not isinstance(verb, str) or not verb:
        raise AppError(ErrorCode.VALIDATION_ERROR, "verb is required")
    if not isinstance(params, dict):
        raise AppError(ErrorCode.VALIDATION_ERROR, "params must be an object")
    if not isinstance(source_table, str) or not source_table:
        raise AppError(ErrorCode.VALIDATION_ERROR, "source_table is required")
    if not isinstance(output_table_name, str) or not output_table_name:
        raise AppError(ErrorCode.VALIDATION_ERROR, "output_table_name is required")

    identity_id = get_identity_id()
    workspace = get_workspace(identity_id)

    try:
        source_file = workspace.get_relative_data_file_path(source_table)
    except FileNotFoundError:
        raise AppError(ErrorCode.VALIDATION_ERROR, "Source table is not in the workspace") from None

    try:
        signed = compile_and_sign(verb, params, source_file)
    except ValueError as exc:
        raise AppError(ErrorCode.VALIDATION_ERROR, str(exc)) from None

    cli_args = current_app.config.get("CLI_ARGS", {})
    max_display_rows = cli_args.get("max_display_rows", 5000)
    sandbox = create_sandbox(cli_args.get("sandbox", "local"))

    result = sandbox.run_python_code(
        code=signed["code"],
        workspace=workspace,
        output_variable=signed["output_variable"],
    )

    if result["status"] != "ok":
        raise AppError(
            ErrorCode.CODE_EXECUTION_ERROR,
            sanitize_error_message(result.get("content", "Unknown error during transformation")),
        )

    result_df = result["content"]
    row_count = len(result_df)
    written = workspace.write_parquet(result_df, output_table_name)
    written_name = getattr(written, "name", None) or output_table_name

    display_df = result_df.head(max_display_rows) if row_count > max_display_rows else result_df
    display_df = display_df.loc[:, ~display_df.columns.duplicated()]
    names = [str(c) for c in display_df.columns.tolist()]

    return json_ok({
        "code": signed["code"],
        "code_signature": signed["code_signature"],
        "output_variable": signed["output_variable"],
        "names": names,
        "rows": df_to_safe_records(display_df),
        "virtual": {
            "table_name": written_name,
            "row_count": row_count,
        },
    })
