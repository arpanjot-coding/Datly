"""Append-only, hash-chained local audit log."""

from __future__ import annotations

import hashlib
import json
import logging
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from data_formulator.security.log_sanitizer import _apply_patterns, sanitize_params

logger = logging.getLogger(__name__)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS audit_events (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    hash TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS audit_no_update
BEFORE UPDATE ON audit_events
BEGIN
    SELECT RAISE(ABORT, 'audit log is append-only');
END;
CREATE TRIGGER IF NOT EXISTS audit_no_delete
BEFORE DELETE ON audit_events
BEGIN
    SELECT RAISE(ABORT, 'audit log is append-only');
END;
"""

_GENESIS = "0" * 64
_lock = threading.Lock()

# Cached per resolved database path. Keying by path (rather than a single
# module global) means the store follows DATA_FORMULATOR_HOME instead of
# pinning itself to whichever home happened to be active on first use.
_stores: dict[Path, AuditStore] = {}
_stores_lock = threading.Lock()


def _canonical(payload: dict[str, Any]) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def _hash_row(prev_hash: str, ts: str, event_type: str, actor: str, payload_json: str) -> str:
    material = "|".join([prev_hash, ts, event_type, actor, payload_json])
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def _redact(payload: dict[str, Any]) -> dict[str, Any]:
    sanitized = sanitize_params(payload)
    text = _apply_patterns(_canonical(sanitized))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"redacted": True}


class AuditStore:
    def __init__(self, db_path: Path):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.executescript(_SCHEMA)
        self._conn.commit()

    def emit(self, event_type: str, actor: str, payload: dict[str, Any] | None = None) -> int:
        safe_payload = _redact(payload or {})
        ts = datetime.now(timezone.utc).isoformat()
        payload_json = _canonical(safe_payload)
        with _lock:
            prev = self._conn.execute(
                "SELECT hash FROM audit_events ORDER BY seq DESC LIMIT 1"
            ).fetchone()
            prev_hash = prev[0] if prev else _GENESIS
            digest = _hash_row(prev_hash, ts, event_type, actor, payload_json)
            cur = self._conn.execute(
                "INSERT INTO audit_events (ts, event_type, actor, payload_json, prev_hash, hash) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (ts, event_type, actor, payload_json, prev_hash, digest),
            )
            self._conn.commit()
            return int(cur.lastrowid)

    def verify_chain(self) -> int | None:
        """Return the first broken seq, or None if the chain is intact."""
        prev_hash = _GENESIS
        rows = self._conn.execute(
            "SELECT seq, ts, event_type, actor, payload_json, prev_hash, hash "
            "FROM audit_events ORDER BY seq"
        ).fetchall()
        for seq, ts, event_type, actor, payload_json, stored_prev, stored_hash in rows:
            if stored_prev != prev_hash:
                return int(seq)
            expected = _hash_row(prev_hash, ts, event_type, actor, payload_json)
            if expected != stored_hash:
                return int(seq)
            prev_hash = stored_hash
        return None

    def recent(self, limit: int = 50) -> list[dict[str, Any]]:
        rows = self._conn.execute(
            "SELECT seq, ts, event_type, actor, payload_json FROM audit_events "
            "ORDER BY seq DESC LIMIT ?",
            (limit,),
        ).fetchall()
        events = []
        for seq, ts, event_type, actor, payload_json in rows:
            try:
                payload = json.loads(payload_json)
            except json.JSONDecodeError:
                payload = {}
            events.append({
                "seq": seq,
                "ts": ts,
                "event_type": event_type,
                "actor": actor,
                "payload": payload,
            })
        return events

    def close(self) -> None:
        self._conn.close()


def audit_db_path() -> Path:
    from data_formulator.datalake.workspace import get_data_formulator_home
    return Path(get_data_formulator_home()) / "audit" / "audit.db"


def get_audit_store() -> AuditStore:
    """Return the audit store for the currently configured home."""
    path = audit_db_path().resolve()
    with _stores_lock:
        store = _stores.get(path)
        if store is None:
            store = AuditStore(path)
            _stores[path] = store
        return store


def reset_audit_stores() -> None:
    """Close and forget every cached store (test teardown)."""
    with _stores_lock:
        for store in _stores.values():
            try:
                store.close()
            except Exception:
                pass
        _stores.clear()
