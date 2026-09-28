"""Compile a clean verb to signed Python.

Signing uses the same HMAC as agent-generated derive code so
``POST /api/agent/refresh-derived-data`` will accept the result.
"""

from __future__ import annotations

from typing import Any

from data_formulator.clean_steps.templates import compile_clean_step
from data_formulator.security.code_signing import sign_code


def compile_and_sign(
    verb: str,
    params: dict[str, Any],
    source_file: str,
) -> dict[str, str]:
    """Compile a template and HMAC-sign the source.

    Returns ``code``, ``code_signature``, ``output_variable``.
    """
    code, output_variable = compile_clean_step(verb, params, source_file)
    return {
        "code": code,
        "code_signature": sign_code(code),
        "output_variable": output_variable,
    }
