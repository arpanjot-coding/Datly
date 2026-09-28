"""Tests for pipeline models and repository."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from data_formulator.pipeline.models import (
    PipelineRun,
    PipelineStep,
    PipelineStepType,
    PipelineTrigger,
)
from data_formulator.pipeline.repository import PipelineRepository

pytestmark = [pytest.mark.backend]


@pytest.fixture
def workspace(tmp_path: Path):
    ws = MagicMock()
    root = tmp_path / "ws"
    root.mkdir()
    from data_formulator.security.path_safety import ConfinedDir

    ws.confined_root = ConfinedDir(root)
    return ws


class TestPipelineRepository:
    def test_save_and_load_run(self, workspace):
        repo = PipelineRepository.for_workspace(workspace)
        run = PipelineRun.create(
            workspace_id="ws-1",
            trigger=PipelineTrigger.LOAD,
            steps=[
                PipelineStep(id="s1", step_type=PipelineStepType.PROFILE, params={"table_name": "sales"}),
            ],
        )
        repo.save_run(run)
        loaded = repo.get_run(run.id)
        assert loaded is not None
        assert loaded.id == run.id
        assert loaded.steps[0].step_type == PipelineStepType.PROFILE

    def test_save_profile_roundtrip(self, workspace):
        repo = PipelineRepository.for_workspace(workspace)
        profile = {"table_name": "sales", "quality_score": 90}
        repo.save_profile("sales", profile)
        assert repo.get_profile("sales") == profile

    def test_table_bindings(self, workspace):
        repo = PipelineRepository.for_workspace(workspace)
        repo.set_table_bindings("orders", ["wf/a.md", "wf/b.md"])
        bindings = repo.get_table_bindings()
        assert bindings["orders"] == ["wf/a.md", "wf/b.md"]
