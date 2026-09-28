"""Allowlist SQL: one SELECT, or WITH that ends in SELECT."""

from __future__ import annotations

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError, SqlglotError, TokenError

_DENIED_KEYS = frozenset(
    {
        "INSERT",
        "UPDATE",
        "DELETE",
        "MERGE",
        "CREATE",
        "DROP",
        "ALTER",
        "ATTACH",
        "DETACH",
        "COPY",
        "EXPORT",
        "IMPORT",
        "INSTALL",
        "LOAD",
        "PRAGMA",
        "CALL",
        "SET",
        "VACUUM",
        "CHECKPOINT",
    }
)

_DENIED_TYPE_NAMES = (
    "Insert",
    "Update",
    "Delete",
    "Merge",
    "Create",
    "Drop",
    "Alter",
    "Attach",
    "Detach",
    "Copy",
    "Export",
    "Import",
    "Install",
    "Load",
    "Pragma",
    "Set",
    "Command",
    "Vacuum",
    "Checkpoint",
    "Undrop",
    "Refresh",
)

_DENIED_TYPES = tuple(
    cls
    for name in _DENIED_TYPE_NAMES
    if (cls := getattr(exp, name, None)) is not None
)


def _reason(kind: str) -> str:
    if kind == "DROP":
        return "Only SELECT statements are allowed"
    return f"{kind} statements are not allowed"


def _kind_of(node: exp.Expression) -> str | None:
    if isinstance(node, exp.Command):
        raw = str(node.this or "").strip().upper()
        verb = raw.split(None, 1)[0] if raw else "COMMAND"
        return verb if verb in _DENIED_KEYS else verb
    key = (getattr(node, "key", None) or node.__class__.__name__).upper()
    if key in _DENIED_KEYS:
        return key
    if isinstance(node, _DENIED_TYPES):
        return key
    return None


def _is_select_like(node: exp.Expression) -> bool:
    if isinstance(node, exp.Select):
        return True
    if isinstance(node, (exp.Union, exp.Except, exp.Intersect)):
        left, right = node.this, node.expression
        return bool(left and right and _is_select_like(left) and _is_select_like(right))
    if isinstance(node, exp.With):
        return node.this is not None and _is_select_like(node.this)
    if isinstance(node, (exp.Subquery, exp.Paren)):
        return node.this is not None and _is_select_like(node.this)
    return False


def _has_into(node: exp.Expression) -> bool:
    return isinstance(node, exp.Select) and bool(node.args.get("into"))


def guard_sql(sql: str) -> tuple[bool, str]:
    """Return (True, "") if sql is a single allowlisted SELECT; else (False, reason)."""
    if not isinstance(sql, str) or not sql.strip():
        return False, "Only SELECT statements are allowed"

    text = sql.strip()
    try:
        try:
            statements = sqlglot.parse(text, read="duckdb")
        except (ParseError, TokenError, SqlglotError):
            statements = sqlglot.parse(text)
    except (ParseError, TokenError, SqlglotError) as exc:
        return False, f"Unable to parse SQL: {exc}"

    parsed = [stmt for stmt in statements if stmt is not None]
    if len(parsed) != 1:
        if len(parsed) > 1:
            return False, "Multiple statements are not allowed"
        return False, "Only SELECT statements are allowed"

    root = parsed[0]
    for node in root.walk():
        kind = _kind_of(node)
        if kind:
            return False, _reason(kind)
        if _has_into(node):
            return False, "SELECT INTO is not allowed"

    if not _is_select_like(root):
        return False, "Only SELECT statements are allowed"

    return True, ""
