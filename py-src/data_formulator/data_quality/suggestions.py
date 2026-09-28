"""Map profile issues to deterministic clean-verb suggestions."""

from __future__ import annotations

from typing import Any


SAFE_AUTO_VERBS = frozenset({"trim", "dedupe"})


def suggest_clean_steps(profile: dict[str, Any]) -> list[dict[str, Any]]:
    """Return ordered clean-step suggestions derived from a table profile."""
    suggestions: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()

    def add(verb: str, column: str | None, reason: str, *, auto_safe: bool, params: dict[str, Any]) -> None:
        key = (verb, column or "")
        if key in seen:
            return
        seen.add(key)
        suggestions.append({
            "verb": verb,
            "column": column,
            "reason": reason,
            "auto_safe": auto_safe,
            "params": params,
        })

    for col in profile.get("columns") or []:
        col_name = col.get("column")
        if not col_name:
            continue
        for issue in col.get("issues") or []:
            code = issue.get("code")
            if code in ("has_nulls", "elevated_null_rate", "high_null_rate"):
                add(
                    "fill",
                    col_name,
                    issue.get("message", "Fill null values"),
                    auto_safe=False,
                    params={"column": col_name, "value": ""},
                )
            if code == "high_duplicate_rate":
                add(
                    "dedupe",
                    col_name,
                    "Remove duplicate rows",
                    auto_safe=True,
                    params={"column": col_name},
                )

        col_type = str(col.get("type") or "").lower()
        if "object" in col_type or "string" in col_type or "varchar" in col_type:
            add(
                "trim",
                col_name,
                "Trim whitespace in text column",
                auto_safe=True,
                params={"column": col_name},
            )

    return suggestions
