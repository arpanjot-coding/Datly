"""Pipeline API — run orchestration, profiles, schedules, refresh cascade."""

from __future__ import annotations

import logging
import uuid

from flask import Blueprint, request

from data_formulator.auth.identity import get_identity_id
from data_formulator.data_quality.profiler import build_table_profile
from data_formulator.data_quality.suggestions import suggest_clean_steps
from data_formulator.error_handler import json_ok
from data_formulator.errors import AppError, ErrorCode
from data_formulator.pipeline.executor import PipelineExecutor
from data_formulator.pipeline.models import (
    PipelineRun,
    PipelineStep,
    PipelineStepType,
    PipelineTrigger,
)
from data_formulator.pipeline.repository import PipelineRepository
from data_formulator.routes.tables import analyze_table_statistics
from data_formulator.workspace_factory import get_workspace

logger = logging.getLogger(__name__)

pipeline_bp = Blueprint("pipeline", __name__, url_prefix="/api/pipeline")


def _workspace():
    return get_workspace(get_identity_id())


def _parse_steps(raw_steps: list | None) -> list[PipelineStep]:
    steps: list[PipelineStep] = []
    for item in raw_steps or []:
        if not isinstance(item, dict):
            continue
        step_type = item.get("step_type") or item.get("type")
        if not step_type:
            continue
        steps.append(PipelineStep(
            id=str(item.get("id") or uuid.uuid4()),
            step_type=PipelineStepType(str(step_type)),
            params=dict(item.get("params") or {}),
        ))
    return steps


def _default_load_pipeline(table_name: str) -> list[PipelineStep]:
    return [
        PipelineStep(
            id=str(uuid.uuid4()),
            step_type=PipelineStepType.PROFILE,
            params={"table_name": table_name},
        ),
        PipelineStep(
            id=str(uuid.uuid4()),
            step_type=PipelineStepType.CLEAN,
            params={"source_table": table_name, "auto_safe_only": True},
        ),
    ]


@pipeline_bp.route("/run", methods=["POST"])
def run_pipeline():
    data = request.get_json(silent=True) or {}
    workspace_id = str(data.get("workspace_id") or "default")
    trigger_raw = str(data.get("trigger") or PipelineTrigger.MANUAL)
    try:
        trigger = PipelineTrigger(trigger_raw)
    except ValueError:
        raise AppError(ErrorCode.INVALID_REQUEST, f"Unknown trigger: {trigger_raw}") from None

    steps = _parse_steps(data.get("steps"))
    context = dict(data.get("context") or {})
    table_name = data.get("table_name")
    if not steps and table_name:
        steps = _default_load_pipeline(str(table_name))
        context.setdefault("table_name", table_name)
    if not steps:
        raise AppError(ErrorCode.INVALID_REQUEST, "steps or table_name is required")

    workspace = _workspace()
    run = PipelineRun.create(
        workspace_id=workspace_id,
        trigger=trigger,
        steps=steps,
        context=context,
    )
    repo = PipelineRepository.for_workspace(workspace)
    repo.save_run(run)
    run = PipelineExecutor(workspace).run(run)
    return json_ok({"run": run.to_dict()})


@pipeline_bp.route("/runs", methods=["GET"])
def list_runs():
    limit = int(request.args.get("limit", 50))
    runs = PipelineRepository.for_workspace(_workspace()).list_runs(limit=limit)
    return json_ok({"runs": [r.to_dict() for r in runs]})


@pipeline_bp.route("/runs/<run_id>", methods=["GET"])
def get_run(run_id: str):
    run = PipelineRepository.for_workspace(_workspace()).get_run(run_id)
    if run is None:
        raise AppError(ErrorCode.INVALID_REQUEST, "Unknown pipeline run")
    return json_ok({"run": run.to_dict()})


@pipeline_bp.route("/profile", methods=["POST"])
def profile_table():
    data = request.get_json(silent=True) or {}
    table_name = data.get("table_name")
    if not table_name:
        raise AppError(ErrorCode.INVALID_REQUEST, "table_name is required")

    workspace = _workspace()
    repo = PipelineRepository.for_workspace(workspace)
    stats = analyze_table_statistics(workspace, str(table_name))
    previous = repo.get_profile(str(table_name))
    profile = build_table_profile(str(table_name), stats, previous=previous)
    profile["suggestions"] = suggest_clean_steps(profile)
    repo.save_profile(str(table_name), profile)
    return json_ok({"profile": profile})


@pipeline_bp.route("/profile/<path:table_name>", methods=["GET"])
def get_profile(table_name: str):
    profile = PipelineRepository.for_workspace(_workspace()).get_profile(table_name)
    if profile is None:
        raise AppError(ErrorCode.INVALID_REQUEST, "No profile for table")
    return json_ok({"profile": profile})


@pipeline_bp.route("/suggestions", methods=["POST"])
def get_suggestions():
    data = request.get_json(silent=True) or {}
    table_name = data.get("table_name")
    if not table_name:
        raise AppError(ErrorCode.INVALID_REQUEST, "table_name is required")
    repo = PipelineRepository.for_workspace(_workspace())
    profile = repo.get_profile(str(table_name))
    if profile is None:
        workspace = _workspace()
        stats = analyze_table_statistics(workspace, str(table_name))
        profile = build_table_profile(str(table_name), stats)
    suggestions = suggest_clean_steps(profile)
    return json_ok({"suggestions": suggestions})


@pipeline_bp.route("/table-bindings", methods=["POST"])
def set_table_bindings():
    data = request.get_json(silent=True) or {}
    table_name = data.get("table_name")
    workflow_ids = data.get("workflow_ids")
    if not table_name or not isinstance(workflow_ids, list):
        raise AppError(ErrorCode.INVALID_REQUEST, "table_name and workflow_ids are required")
    PipelineRepository.for_workspace(_workspace()).set_table_bindings(
        str(table_name),
        [str(w) for w in workflow_ids],
    )
    return json_ok({"ok": True})


@pipeline_bp.route("/trigger-refresh", methods=["POST"])
def trigger_refresh_cascade():
    """After a source refresh, re-profile and optionally queue workflow replay."""
    data = request.get_json(silent=True) or {}
    table_name = data.get("table_name")
    data_changed = bool(data.get("data_changed", True))
    workspace_id = str(data.get("workspace_id") or "default")
    if not table_name:
        raise AppError(ErrorCode.INVALID_REQUEST, "table_name is required")

    workspace = _workspace()
    repo = PipelineRepository.for_workspace(workspace)
    steps = [
        PipelineStep(
            id=str(uuid.uuid4()),
            step_type=PipelineStepType.REFRESH,
            params={"data_changed": data_changed},
        ),
        PipelineStep(
            id=str(uuid.uuid4()),
            step_type=PipelineStepType.PROFILE,
            params={"table_name": table_name},
        ),
    ]
    if data_changed:
        steps.append(PipelineStep(
            id=str(uuid.uuid4()),
            step_type=PipelineStepType.CLEAN,
            params={"source_table": table_name, "auto_safe_only": True},
        ))
        bindings = repo.get_table_bindings().get(str(table_name), [])
        for workflow_path in bindings:
            steps.append(PipelineStep(
                id=str(uuid.uuid4()),
                step_type=PipelineStepType.WORKFLOW,
                params={"workflow_path": workflow_path},
            ))

    run = PipelineRun.create(
        workspace_id=workspace_id,
        trigger=PipelineTrigger.REFRESH,
        steps=steps,
        context={"table_name": table_name, "data_changed": data_changed},
    )
    repo.save_run(run)
    run = PipelineExecutor(workspace).run(run)
    return json_ok({"run": run.to_dict()})
