"""One-time fold of legacy browser:/user: workspace homes onto local:."""

from __future__ import annotations

from pathlib import Path

import pytest

from data_formulator.auth.identity_migration import migrate_legacy_identity_homes
from data_formulator.datalake.workspace import sanitize_identity_dirname

pytestmark = [pytest.mark.backend]


def test_migrates_browser_home_when_local_is_empty(tmp_path: Path) -> None:
    users = tmp_path / "users"
    legacy = users / sanitize_identity_dirname("browser:old-uuid")
    (legacy / "workspaces" / "ws1").mkdir(parents=True)
    (legacy / "workspaces" / "ws1" / "state.json").write_text("{}", encoding="utf-8")

    moved = migrate_legacy_identity_homes("local:alice", home=tmp_path)

    dest = users / sanitize_identity_dirname("local:alice")
    assert sanitize_identity_dirname("browser:old-uuid") in moved
    assert not legacy.exists()
    assert (dest / "workspaces" / "ws1" / "state.json").is_file()


def test_does_not_overwrite_existing_local_home(tmp_path: Path) -> None:
    users = tmp_path / "users"
    dest = users / sanitize_identity_dirname("local:alice")
    (dest / "workspaces" / "keep").mkdir(parents=True)
    (dest / "workspaces" / "keep" / "state.json").write_text("keep", encoding="utf-8")
    legacy = users / sanitize_identity_dirname("browser:old-uuid")
    (legacy / "workspaces" / "extra").mkdir(parents=True)
    (legacy / "workspaces" / "extra" / "state.json").write_text("extra", encoding="utf-8")

    migrate_legacy_identity_homes("local:alice", home=tmp_path)

    assert (dest / "workspaces" / "keep" / "state.json").read_text(encoding="utf-8") == "keep"
    assert (dest / "workspaces" / "extra" / "state.json").is_file()
    assert not legacy.exists()


def test_leaves_unrelated_homes_alone(tmp_path: Path) -> None:
    users = tmp_path / "users"
    other = users / sanitize_identity_dirname("local:bob")
    (other / "workspaces" / "keep").mkdir(parents=True)
    (other / "workspaces" / "keep" / "state.json").write_text("bob", encoding="utf-8")

    moved = migrate_legacy_identity_homes("local:alice", home=tmp_path)

    assert moved == []
    assert (other / "workspaces" / "keep" / "state.json").read_text(encoding="utf-8") == "bob"
