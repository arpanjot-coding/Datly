from __future__ import annotations

from pathlib import Path

import pytest

from data_formulator.audit.forwarder import AuditForwarder

pytestmark = [pytest.mark.backend]


def test_spools_while_offline_and_drains_without_duplicates(tmp_path: Path) -> None:
    delivered: list[str] = []

    def sender(event: dict) -> bool:
        if event.get("offline"):
            return False
        delivered.append(event["id"])
        return True

    forwarder = AuditForwarder(tmp_path / "spool.json", sender)
    forwarder.enqueue({"id": "a", "offline": True})
    forwarder.enqueue({"id": "b"})
    assert forwarder.drain() == 1
    assert delivered == ["b"]

    # Reconnect: first event can now send, and must not resend b.
    def sender_online(event: dict) -> bool:
        delivered.append(event["id"])
        return True

    forwarder.sender = sender_online
    assert forwarder.drain() == 1
    assert delivered == ["b", "a"]
    assert forwarder.drain() == 0
