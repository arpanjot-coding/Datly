"""DT-7: managed policy overrides user settings and fails closed."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from data_formulator.config.policy import (
    PolicyError,
    apply_managed_policy,
    assert_network_allowed,
    current_force_offline,
    load_managed_policy,
    parse_policy,
    set_active_policy,
)

pytestmark = [pytest.mark.backend]


def test_parse_policy_defaults() -> None:
    policy = parse_policy({})
    assert policy.force_offline is False
    assert policy.allowed_llm_endpoints == ()


def test_malformed_document_fails_closed() -> None:
    with pytest.raises(PolicyError, match="JSON object"):
        parse_policy(["not", "an", "object"])


def test_wrong_types_fail_closed() -> None:
    with pytest.raises(PolicyError, match="force_offline"):
        parse_policy({"force_offline": "yes"})


def test_missing_optional_file_returns_none(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATA_FORMULATOR_POLICY", raising=False)
    monkeypatch.setattr(
        "data_formulator.config.policy.default_policy_path",
        lambda: tmp_path / "missing.json",
    )
    assert load_managed_policy() is None


def test_explicit_missing_file_fails(tmp_path: Path) -> None:
    with pytest.raises(PolicyError, match="not found"):
        load_managed_policy(tmp_path / "nope.json")


def test_malformed_file_fails_closed(tmp_path: Path) -> None:
    path = tmp_path / "policy.json"
    path.write_text("{not json", encoding="utf-8")
    with pytest.raises(PolicyError, match="malformed"):
        load_managed_policy(path)


def test_apply_policy_overrides_cli(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    path = tmp_path / "policy.json"
    path.write_text(json.dumps({
        "force_offline": True,
        "disable_custom_models": True,
        "disable_data_connectors": False,
    }), encoding="utf-8")
    monkeypatch.setenv("DATA_FORMULATOR_POLICY", str(path))
    cli = apply_managed_policy({
        "disable_custom_models": False,
        "disable_data_connectors": False,
    })
    assert cli["disable_custom_models"] is True
    assert cli["force_offline"] is True
    assert cli["managed_policy"]["force_offline"] is True
    assert current_force_offline() is True
    with pytest.raises(PolicyError, match="force-offline"):
        assert_network_allowed("LLM")
    set_active_policy(None)
