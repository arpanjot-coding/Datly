"""DT-6: hash-chained append-only audit log."""

from __future__ import annotations

from pathlib import Path

import pytest
import sqlite3

from data_formulator.audit.store import (
    AuditStore,
    audit_db_path,
    get_audit_store,
    reset_audit_stores,
)

pytestmark = [pytest.mark.backend]


@pytest.fixture
def store(tmp_path: Path) -> AuditStore:
    return AuditStore(tmp_path / "audit.db")


def test_chain_verifies_clean(store: AuditStore) -> None:
    store.emit("workspace.export", "local:alice", {"workspace": "ws1"})
    store.emit("table.load", "local:alice", {"table": "sales"})
    assert store.verify_chain() is None
    assert len(store.recent()) == 2


def test_hand_edited_row_is_detected(store: AuditStore) -> None:
    store.emit("workspace.create", "local:alice", {"id": "a"})
    store.emit("workspace.delete", "local:alice", {"id": "b"})
    store._conn.execute("DROP TRIGGER IF EXISTS audit_no_update")
    store._conn.execute("UPDATE audit_events SET hash=? WHERE seq=2", ("0" * 64,))
    store._conn.commit()
    assert store.verify_chain() == 2


def test_update_and_delete_raise(store: AuditStore) -> None:
    store.emit("auth.login", "local:alice", {})
    with pytest.raises(sqlite3.Error, match="append-only"):
        store._conn.execute("UPDATE audit_events SET actor='x'")
    with pytest.raises(sqlite3.Error, match="append-only"):
        store._conn.execute("DELETE FROM audit_events")


class TestStoreFollowsHome:
    """The audit DB must never escape the configured home (see conftest)."""

    def test_path_tracks_data_formulator_home(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        monkeypatch.setenv("DATA_FORMULATOR_HOME", str(tmp_path))
        assert audit_db_path() == tmp_path / "audit" / "audit.db"

    def test_store_reopens_when_home_changes(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        first = tmp_path / "one"
        second = tmp_path / "two"
        reset_audit_stores()
        try:
            monkeypatch.setenv("DATA_FORMULATOR_HOME", str(first))
            get_audit_store().emit("workspace.export", "local:alice", {})
            monkeypatch.setenv("DATA_FORMULATOR_HOME", str(second))
            store = get_audit_store()
            assert store.db_path == (second / "audit" / "audit.db").resolve()
            assert store.recent() == []
        finally:
            reset_audit_stores()

    def test_session_home_is_not_the_real_user_home(self) -> None:
        real = Path.home() / ".data_formulator"
        assert real not in audit_db_path().parents


def test_secrets_are_redacted(store: AuditStore) -> None:
    store.emit("connector.save", "local:alice", {
        "source": "pg",
        "password": "s3cret",
        "api_key": "sk-live-123",
    })
    payload = store.recent(1)[0]["payload"]
    assert payload["password"] == "***"
    assert payload["api_key"] == "***"
    assert payload["source"] == "pg"
