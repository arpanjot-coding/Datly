"""Persist dashboards and schedules in the workspace."""

from __future__ import annotations

import json
import logging
from pathlib import Path

from data_formulator.dashboard.models import Dashboard, PipelineSchedule
from data_formulator.datalake.workspace import Workspace

logger = logging.getLogger(__name__)


class DashboardRepository:
    DASHBOARDS_DIR = "dashboards"
    SCHEDULES_DIR = "pipeline/schedules"

    def __init__(self, workspace: Workspace) -> None:
        self._root = workspace.confined_root

    def list_dashboards(self) -> list[Dashboard]:
        ddir = self._root.resolve(self.DASHBOARDS_DIR)
        if not ddir.exists():
            return []
        out: list[Dashboard] = []
        for path in sorted(ddir.glob("*.json")):
            try:
                out.append(Dashboard.from_dict(json.loads(path.read_text(encoding="utf-8"))))
            except Exception:
                logger.warning("Skipping corrupt dashboard %s", path, exc_info=True)
        return out

    def save_dashboard(self, dashboard: Dashboard) -> None:
        path = self._root.resolve(f"{self.DASHBOARDS_DIR}/{dashboard.id}.json", mkdir_parents=True)
        path.write_text(json.dumps(dashboard.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")

    def get_dashboard(self, dashboard_id: str) -> Dashboard | None:
        path = self._root.resolve(f"{self.DASHBOARDS_DIR}/{dashboard_id}.json")
        if not path.exists():
            return None
        return Dashboard.from_dict(json.loads(path.read_text(encoding="utf-8")))

    def delete_dashboard(self, dashboard_id: str) -> bool:
        path = self._root.resolve(f"{self.DASHBOARDS_DIR}/{dashboard_id}.json")
        if not path.exists():
            return False
        path.unlink()
        return True

    def list_schedules(self) -> list[PipelineSchedule]:
        sdir = self._root.resolve(self.SCHEDULES_DIR)
        if not sdir.exists():
            return []
        out: list[PipelineSchedule] = []
        for path in sorted(sdir.glob("*.json")):
            try:
                out.append(PipelineSchedule.from_dict(json.loads(path.read_text(encoding="utf-8"))))
            except Exception:
                logger.warning("Skipping corrupt schedule %s", path, exc_info=True)
        return out

    def save_schedule(self, schedule: PipelineSchedule) -> None:
        path = self._root.resolve(f"{self.SCHEDULES_DIR}/{schedule.id}.json", mkdir_parents=True)
        path.write_text(json.dumps(schedule.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")

    def delete_schedule(self, schedule_id: str) -> bool:
        path = self._root.resolve(f"{self.SCHEDULES_DIR}/{schedule_id}.json")
        if not path.exists():
            return False
        path.unlink()
        return True

    @classmethod
    def for_workspace(cls, workspace: Workspace) -> DashboardRepository:
        return cls(workspace)
