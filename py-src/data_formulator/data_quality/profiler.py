"""Build a data-quality profile from column statistics."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _schema_hash(columns: list[dict[str, Any]]) -> str:
    payload = [{"column": c.get("column"), "type": c.get("type")} for c in columns]
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()[:16]


def _score_from_issues(issues: list[dict[str, Any]]) -> int:
    score = 100
    for issue in issues:
        severity = issue.get("severity", "info")
        if severity == "critical":
            score -= 25
        elif severity == "warning":
            score -= 10
        else:
            score -= 3
    return max(0, min(100, score))


def build_table_profile(
    table_name: str,
    statistics: list[dict[str, Any]],
    *,
    row_count: int | None = None,
    previous: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Turn raw column stats into a quality profile with score and issues."""
    issues: list[dict[str, Any]] = []
    columns_out: list[dict[str, Any]] = []
    total_rows = row_count or 0

    for col in statistics:
        col_name = str(col.get("column", ""))
        stats = dict(col.get("statistics") or {})
        count = int(stats.get("count") or 0)
        null_count = int(stats.get("null_count") or 0)
        unique_count = int(stats.get("unique_count") or 0)
        if total_rows == 0 and count > 0:
            total_rows = count + null_count
        denom = total_rows or count + null_count or 1
        null_pct = round(100.0 * null_count / denom, 2) if denom else 0.0
        duplicate_pct = 0.0
        if count > 0 and unique_count < count:
            duplicate_pct = round(100.0 * (count - unique_count) / count, 2)

        col_issues: list[dict[str, Any]] = []
        if null_pct >= 50:
            col_issues.append({
                "code": "high_null_rate",
                "severity": "critical",
                "message": f"{null_pct}% null values",
            })
        elif null_pct >= 10:
            col_issues.append({
                "code": "elevated_null_rate",
                "severity": "warning",
                "message": f"{null_pct}% null values",
            })
        elif null_count > 0:
            col_issues.append({
                "code": "has_nulls",
                "severity": "info",
                "message": f"{null_count} null values",
            })

        if duplicate_pct >= 30 and unique_count > 1:
            col_issues.append({
                "code": "high_duplicate_rate",
                "severity": "warning",
                "message": f"{duplicate_pct}% duplicate values",
            })

        for ci in col_issues:
            issues.append({**ci, "column": col_name})

        columns_out.append({
            "column": col_name,
            "type": col.get("type"),
            "statistics": stats,
            "null_pct": null_pct,
            "duplicate_pct": duplicate_pct,
            "issues": col_issues,
        })

    schema_hash = _schema_hash(statistics)
    drift: dict[str, Any] | None = None
    if previous:
        prev_hash = previous.get("schema_hash")
        if prev_hash and prev_hash != schema_hash:
            drift = {
                "schema_changed": True,
                "previous_schema_hash": prev_hash,
                "current_schema_hash": schema_hash,
            }
            issues.append({
                "code": "schema_drift",
                "severity": "warning",
                "message": "Table schema changed since last profile",
            })
        prev_score = previous.get("quality_score")
        if isinstance(prev_score, int):
            drift = drift or {}
            drift["score_delta"] = _score_from_issues(issues) - prev_score

    quality_score = _score_from_issues(issues)
    status = "healthy"
    if quality_score < 60:
        status = "critical"
    elif quality_score < 85:
        status = "warning"

    return {
        "table_name": table_name,
        "profiled_at": _utc_now(),
        "row_count": total_rows,
        "schema_hash": schema_hash,
        "quality_score": quality_score,
        "status": status,
        "columns": columns_out,
        "issues": issues,
        "drift": drift,
    }
