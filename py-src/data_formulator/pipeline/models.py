"""Pipeline run and step models."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class PipelineTrigger(StrEnum):
    MANUAL = "manual"
    SCHEDULE = "schedule"
    REFRESH = "refresh"
    LOAD = "load"


class PipelineRunStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PipelineStepType(StrEnum):
    LOAD = "load"
    PROFILE = "profile"
    CLEAN = "clean"
    DERIVE = "derive"
    VISUALIZE = "visualize"
    REPORT = "report"
    WORKFLOW = "workflow"
    REFRESH = "refresh"


class PipelineStepStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class PipelineStep:
    id: str
    step_type: PipelineStepType
    status: PipelineStepStatus = PipelineStepStatus.PENDING
    params: dict[str, Any] = field(default_factory=dict)
    result: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    started_at: str | None = None
    finished_at: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "step_type": self.step_type.value,
            "status": self.status.value,
            "params": self.params,
            "result": self.result,
            "error": self.error,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> PipelineStep:
        return cls(
            id=str(data["id"]),
            step_type=PipelineStepType(str(data["step_type"])),
            status=PipelineStepStatus(str(data.get("status", PipelineStepStatus.PENDING))),
            params=dict(data.get("params") or {}),
            result=dict(data.get("result") or {}),
            error=data.get("error"),
            started_at=data.get("started_at"),
            finished_at=data.get("finished_at"),
        )


@dataclass
class PipelineRun:
    id: str
    workspace_id: str
    trigger: PipelineTrigger
    status: PipelineRunStatus = PipelineRunStatus.PENDING
    steps: list[PipelineStep] = field(default_factory=list)
    context: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    created_at: str = field(default_factory=_utc_now)
    started_at: str | None = None
    finished_at: str | None = None

    @classmethod
    def create(
        cls,
        *,
        workspace_id: str,
        trigger: PipelineTrigger,
        steps: list[PipelineStep],
        context: dict[str, Any] | None = None,
    ) -> PipelineRun:
        return cls(
            id=_new_id(),
            workspace_id=workspace_id,
            trigger=trigger,
            steps=steps,
            context=dict(context or {}),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "workspace_id": self.workspace_id,
            "trigger": self.trigger.value,
            "status": self.status.value,
            "steps": [s.to_dict() for s in self.steps],
            "context": self.context,
            "error": self.error,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> PipelineRun:
        return cls(
            id=str(data["id"]),
            workspace_id=str(data["workspace_id"]),
            trigger=PipelineTrigger(str(data["trigger"])),
            status=PipelineRunStatus(str(data.get("status", PipelineRunStatus.PENDING))),
            steps=[PipelineStep.from_dict(s) for s in (data.get("steps") or [])],
            context=dict(data.get("context") or {}),
            error=data.get("error"),
            created_at=str(data.get("created_at") or _utc_now()),
            started_at=data.get("started_at"),
            finished_at=data.get("finished_at"),
        )
