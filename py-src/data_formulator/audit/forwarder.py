"""Optional offline spool for SIEM forwarding."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable


class AuditForwarder:
    def __init__(self, spool_path: Path, sender: Callable[[dict[str, Any]], bool]):
        self.spool_path = Path(spool_path)
        self.sender = sender
        self.spool_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.spool_path.exists():
            self.spool_path.write_text("[]", encoding="utf-8")

    def enqueue(self, event: dict[str, Any]) -> None:
        items = self._load()
        items.append(event)
        self._save(items)

    def drain(self) -> int:
        items = self._load()
        remaining: list[dict[str, Any]] = []
        sent = 0
        for event in items:
            if self.sender(event):
                sent += 1
            else:
                remaining.append(event)
        self._save(remaining)
        return sent

    def _load(self) -> list[dict[str, Any]]:
        try:
            data = json.loads(self.spool_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return []
        return data if isinstance(data, list) else []

    def _save(self, items: list[dict[str, Any]]) -> None:
        self.spool_path.write_text(json.dumps(items), encoding="utf-8")
