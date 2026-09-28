"""Dashboard and schedule models for full-auto outputs."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class DashboardTile:
    id: str
    chart_id: str
    x: int = 0
    y: int = 0
    w: int = 6
    h: int = 4

    def to_dict(self) -> dict[str, Any]:
        return {"id": self.id, "chart_id": self.chart_id, "x": self.x, "y": self.y, "w": self.w, "h": self.h}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DashboardTile:
        return cls(
            id=str(data["id"]),
            chart_id=str(data["chart_id"]),
            x=int(data.get("x", 0)),
            y=int(data.get("y", 0)),
            w=int(data.get("w", 6)),
            h=int(data.get("h", 4)),
        )


@dataclass
class Dashboard:
    id: str
    name: str
    tiles: list[DashboardTile] = field(default_factory=list)
    filters: dict[str, Any] = field(default_factory=dict)
    updated_at: str = field(default_factory=_utc_now)

    @classmethod
    def create(cls, name: str, tiles: list[DashboardTile] | None = None) -> Dashboard:
        return cls(id=str(uuid.uuid4()), name=name, tiles=tiles or [])

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "tiles": [t.to_dict() for t in self.tiles],
            "filters": self.filters,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Dashboard:
        return cls(
            id=str(data["id"]),
            name=str(data.get("name") or "Dashboard"),
            tiles=[DashboardTile.from_dict(t) for t in (data.get("tiles") or [])],
            filters=dict(data.get("filters") or {}),
            updated_at=str(data.get("updated_at") or _utc_now()),
        )


@dataclass
class PipelineSchedule:
    id: str
    name: str
    cron: str
    workspace_id: str
    table_name: str | None = None
    workflow_path: str | None = None
    enabled: bool = True
    created_at: str = field(default_factory=_utc_now)

    @classmethod
    def create(
        cls,
        *,
        name: str,
        cron: str,
        workspace_id: str,
        table_name: str | None = None,
        workflow_path: str | None = None,
    ) -> PipelineSchedule:
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            cron=cron,
            workspace_id=workspace_id,
            table_name=table_name,
            workflow_path=workflow_path,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "cron": self.cron,
            "workspace_id": self.workspace_id,
            "table_name": self.table_name,
            "workflow_path": self.workflow_path,
            "enabled": self.enabled,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> PipelineSchedule:
        return cls(
            id=str(data["id"]),
            name=str(data.get("name") or "Schedule"),
            cron=str(data.get("cron") or "0 8 * * *"),
            workspace_id=str(data.get("workspace_id") or "default"),
            table_name=data.get("table_name"),
            workflow_path=data.get("workflow_path"),
            enabled=bool(data.get("enabled", True)),
            created_at=str(data.get("created_at") or _utc_now()),
        )
