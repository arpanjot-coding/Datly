"""Persist pipeline runs and table profiles under the workspace."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from data_formulator.datalake.workspace import Workspace
from data_formulator.pipeline.models import PipelineRun

logger = logging.getLogger(__name__)


class PipelineRepository:
    """Filesystem-backed store for pipeline runs and profile snapshots."""

    RUNS_DIR = "pipeline/runs"
    PROFILES_DIR = "pipeline/profiles"
    BINDINGS_FILE = "pipeline/table_bindings.json"
    SCHEDULES_DIR = "pipeline/schedules"

    def __init__(self, workspace: Workspace) -> None:
        self._workspace = workspace
        self._root = workspace.confined_root

    def _runs_path(self) -> Path:
        return self._root.resolve(self.RUNS_DIR)

    def _profiles_path(self) -> Path:
        return self._root.resolve(self.PROFILES_DIR)

    def save_run(self, run: PipelineRun) -> None:
        runs_dir = self._runs_path()
        runs_dir.mkdir(parents=True, exist_ok=True)
        path = runs_dir / f"{run.id}.json"
        path.write_text(json.dumps(run.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")

    def get_run(self, run_id: str) -> PipelineRun | None:
        path = self._runs_path() / f"{run_id}.json"
        if not path.exists():
            return None
        return PipelineRun.from_dict(json.loads(path.read_text(encoding="utf-8")))

    def list_runs(self, *, limit: int = 50) -> list[PipelineRun]:
        runs_dir = self._runs_path()
        if not runs_dir.exists():
            return []
        files = sorted(runs_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
        out: list[PipelineRun] = []
        for path in files[:limit]:
            try:
                out.append(PipelineRun.from_dict(json.loads(path.read_text(encoding="utf-8"))))
            except Exception:
                logger.warning("Skipping corrupt pipeline run file %s", path, exc_info=True)
        return out

    def save_profile(self, table_name: str, profile: dict[str, Any]) -> None:
        profiles_dir = self._profiles_path()
        profiles_dir.mkdir(parents=True, exist_ok=True)
        safe = table_name.replace("/", "_").replace("\\", "_")
        path = profiles_dir / f"{safe}.json"
        path.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")

    def get_profile(self, table_name: str) -> dict[str, Any] | None:
        safe = table_name.replace("/", "_").replace("\\", "_")
        path = self._profiles_path() / f"{safe}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text(encoding="utf-8"))

    def get_table_bindings(self) -> dict[str, list[str]]:
        path = self._root.resolve(self.BINDINGS_FILE)
        if not path.exists():
            return {}
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return {str(k): [str(v) for v in vals] for k, vals in data.items() if isinstance(vals, list)}
        except Exception:
            logger.warning("Failed to read table bindings", exc_info=True)
        return {}

    def set_table_bindings(self, table_name: str, workflow_ids: list[str]) -> None:
        bindings = self.get_table_bindings()
        bindings[table_name] = workflow_ids
        path = self._root.resolve(self.BINDINGS_FILE)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(bindings, ensure_ascii=False, indent=2), encoding="utf-8")

    @classmethod
    def for_workspace(cls, workspace: Workspace) -> PipelineRepository:
        return cls(workspace)
