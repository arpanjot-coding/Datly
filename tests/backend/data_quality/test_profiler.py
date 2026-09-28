"""Tests for data quality profiling."""

from __future__ import annotations

import pytest

from data_formulator.data_quality.profiler import build_table_profile
from data_formulator.data_quality.suggestions import suggest_clean_steps

pytestmark = [pytest.mark.backend]


class TestBuildTableProfile:
    def test_healthy_table_scores_high(self):
        stats = [
            {
                "column": "id",
                "type": "INTEGER",
                "statistics": {"count": 100, "unique_count": 100, "null_count": 0},
            },
            {
                "column": "name",
                "type": "VARCHAR",
                "statistics": {"count": 100, "unique_count": 95, "null_count": 0},
            },
        ]
        profile = build_table_profile("orders", stats, row_count=100)
        assert profile["quality_score"] >= 85
        assert profile["status"] == "healthy"
        assert profile["table_name"] == "orders"

    def test_high_null_rate_lowers_score(self):
        stats = [
            {
                "column": "email",
                "type": "VARCHAR",
                "statistics": {"count": 50, "unique_count": 40, "null_count": 50},
            },
        ]
        profile = build_table_profile("users", stats, row_count=100)
        assert profile["quality_score"] < 85
        assert any(i["code"] == "high_null_rate" for i in profile["issues"])

    def test_schema_drift_detected(self):
        stats = [{"column": "a", "type": "INT", "statistics": {"count": 1, "unique_count": 1, "null_count": 0}}]
        previous = build_table_profile("t", stats)
        new_stats = [
            {"column": "a", "type": "INT", "statistics": {"count": 1, "unique_count": 1, "null_count": 0}},
            {"column": "b", "type": "INT", "statistics": {"count": 1, "unique_count": 1, "null_count": 0}},
        ]
        profile = build_table_profile("t", new_stats, previous=previous)
        assert profile.get("drift", {}).get("schema_changed") is True


class TestSuggestCleanSteps:
    def test_suggests_fill_for_nulls(self):
        profile = build_table_profile(
            "users",
            [{
                "column": "email",
                "type": "VARCHAR",
                "statistics": {"count": 40, "unique_count": 30, "null_count": 60},
            }],
            row_count=100,
        )
        suggestions = suggest_clean_steps(profile)
        verbs = {s["verb"] for s in suggestions}
        assert "fill" in verbs
        assert "trim" in verbs
