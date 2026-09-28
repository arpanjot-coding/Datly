"""Execute pipeline steps sequentially."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Callable

from data_formulator.datalake.workspace import Workspace
from data_formulator.data_quality.profiler import build_table_profile
from data_formulator.data_quality.suggestions import SAFE_AUTO_VERBS, suggest_clean_steps
from data_formulator.pipeline.models import (
    PipelineRun,
    PipelineRunStatus,
    PipelineStep,
    PipelineStepStatus,
    PipelineStepType,
)
from data_formulator.pipeline.repository import PipelineRepository

logger = logging.getLogger(__name__)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _written_table_name(written: Any, fallback: str) -> str:
    name = getattr(written, "name", None)
    return name if isinstance(name, str) and name else fallback


class PipelineExecutor:
    """Run a pipeline synchronously, persisting state after each step."""

    def __init__(self, workspace: Workspace) -> None:
        self._workspace = workspace
        self._repo = PipelineRepository.for_workspace(workspace)

    def run(self, run: PipelineRun) -> PipelineRun:
        run.status = PipelineRunStatus.RUNNING
        run.started_at = run.started_at or _utc_now()
        self._repo.save_run(run)

        for step in run.steps:
            if step.status in (PipelineStepStatus.COMPLETED, PipelineStepStatus.SKIPPED):
                continue
            step.status = PipelineStepStatus.RUNNING
            step.started_at = _utc_now()
            self._repo.save_run(run)
            try:
                handler = self._handlers().get(step.step_type)
                if handler is None:
                    raise ValueError(f"Unsupported step type: {step.step_type}")
                step.result = handler(step, run) or {}
                step.status = PipelineStepStatus.COMPLETED
                step.error = None
            except Exception as exc:
                logger.warning("Pipeline step %s failed", step.id, exc_info=True)
                step.status = PipelineStepStatus.FAILED
                step.error = str(exc)
                run.status = PipelineRunStatus.FAILED
                run.error = step.error
                step.finished_at = _utc_now()
                run.finished_at = _utc_now()
                self._repo.save_run(run)
                return run
            step.finished_at = _utc_now()
            self._repo.save_run(run)

        run.status = PipelineRunStatus.COMPLETED
        run.finished_at = _utc_now()
        self._repo.save_run(run)
        return run

    def _handlers(self) -> dict[PipelineStepType, Callable[[PipelineStep, PipelineRun], dict[str, Any]]]:
        return {
            PipelineStepType.PROFILE: self._step_profile,
            PipelineStepType.CLEAN: self._step_clean,
            PipelineStepType.REFRESH: self._step_refresh,
            PipelineStepType.WORKFLOW: self._step_workflow,
        }

    def _step_profile(self, step: PipelineStep, run: PipelineRun) -> dict[str, Any]:
        from data_formulator.routes.tables import analyze_table_statistics

        table_name = step.params.get("table_name") or run.context.get("table_name")
        if not table_name:
            raise ValueError("profile step requires table_name")

        stats = analyze_table_statistics(self._workspace, str(table_name))
        previous = self._repo.get_profile(str(table_name))
        profile = build_table_profile(str(table_name), stats, previous=previous)
        profile["suggestions"] = suggest_clean_steps(profile)
        self._repo.save_profile(str(table_name), profile)
        run.context["last_profile"] = profile
        run.context["table_name"] = table_name
        return {"profile": profile}

    def _step_clean(self, step: PipelineStep, run: PipelineRun) -> dict[str, Any]:
        from data_formulator.clean_steps.compiler import compile_and_sign
        from data_formulator.sandbox import create_sandbox

        source_table = step.params.get("source_table") or run.context.get("table_name")
        if not source_table:
            raise ValueError("clean step requires source_table")

        verbs = step.params.get("verbs")
        if not verbs:
            profile = run.context.get("last_profile") or self._repo.get_profile(str(source_table))
            if not profile:
                raise ValueError("No profile available for auto clean suggestions")
            suggestions = suggest_clean_steps(profile)
            auto_only = bool(step.params.get("auto_safe_only", True))
            verbs = [
                {
                    "verb": s["verb"],
                    "params": s["params"],
                    "output_table_name": f"{source_table}_{s['verb']}_{uuid.uuid4().hex[:6]}",
                }
                for s in suggestions
                if (not auto_only) or s.get("auto_safe")
            ]
            if not verbs:
                return {"skipped": True, "reason": "no_applicable_clean_verbs"}

        cli_args = {}
        try:
            from flask import current_app
            cli_args = current_app.config.get("CLI_ARGS", {})
        except RuntimeError:
            pass
        sandbox = create_sandbox(cli_args.get("sandbox", "local"))
        current_table = str(source_table)
        applied: list[dict[str, Any]] = []

        for spec in verbs:
            verb = spec.get("verb")
            params = spec.get("params") or {}
            output_name = spec.get("output_table_name") or f"{current_table}_{verb}"
            if not verb:
                continue
            if step.params.get("auto_safe_only", True) and verb not in SAFE_AUTO_VERBS and not spec.get("force"):
                continue
            source_file = self._workspace.get_relative_data_file_path(current_table)
            signed = compile_and_sign(str(verb), params, source_file)
            result = sandbox.run_python_code(
                code=signed["code"],
                workspace=self._workspace,
                output_variable=signed["output_variable"],
            )
            if result["status"] != "ok":
                raise RuntimeError(result.get("content", "clean step failed"))
            written = self._workspace.write_parquet(result["content"], str(output_name))
            current_table = _written_table_name(written, str(output_name))
            applied.append({"verb": verb, "output_table": current_table})

        run.context["table_name"] = current_table
        return {"applied": applied, "output_table": current_table}

    def _step_refresh(self, step: PipelineStep, run: PipelineRun) -> dict[str, Any]:
        data_changed = bool(step.params.get("data_changed", True))
        run.context["data_changed"] = data_changed
        if not data_changed:
            return {"skipped": True, "reason": "data_unchanged"}
        return {"data_changed": True}

    def _step_workflow(self, step: PipelineStep, run: PipelineRun) -> dict[str, Any]:
        workflow_path = step.params.get("workflow_path")
        if not workflow_path:
            raise ValueError("workflow step requires workflow_path")
        run.context["workflow_path"] = workflow_path
        run.context["workflow_replay"] = {
            "workflow_path": workflow_path,
            "parameters": step.params.get("parameters") or {},
        }
        return {"workflow_path": workflow_path, "ready_for_replay": True}
