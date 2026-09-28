"""Dashboard and schedule API."""

from __future__ import annotations

import uuid

from flask import Blueprint, request

from data_formulator.auth.identity import get_identity_id
from data_formulator.dashboard.models import Dashboard, DashboardTile, PipelineSchedule
from data_formulator.dashboard.repository import DashboardRepository
from data_formulator.error_handler import json_ok
from data_formulator.errors import AppError, ErrorCode
from data_formulator.workspace_factory import get_workspace

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


def _repo() -> DashboardRepository:
    return DashboardRepository.for_workspace(get_workspace(get_identity_id()))


@dashboard_bp.route("/list", methods=["GET"])
def list_dashboards():
    return json_ok({"dashboards": [d.to_dict() for d in _repo().list_dashboards()]})


@dashboard_bp.route("/save", methods=["POST"])
def save_dashboard():
    data = request.get_json(silent=True) or {}
    dashboard_id = data.get("id")
    name = data.get("name") or "Dashboard"
    tiles_raw = data.get("tiles") or []
    tiles = [DashboardTile.from_dict(t) for t in tiles_raw if isinstance(t, dict)]
    dashboard = Dashboard(
        id=str(dashboard_id or uuid.uuid4()),
        name=str(name),
        tiles=tiles,
        filters=dict(data.get("filters") or {}),
    )
    _repo().save_dashboard(dashboard)
    return json_ok({"dashboard": dashboard.to_dict()})


@dashboard_bp.route("/<dashboard_id>", methods=["GET"])
def get_dashboard(dashboard_id: str):
    dashboard = _repo().get_dashboard(dashboard_id)
    if dashboard is None:
        raise AppError(ErrorCode.INVALID_REQUEST, "Unknown dashboard")
    return json_ok({"dashboard": dashboard.to_dict()})


@dashboard_bp.route("/<dashboard_id>", methods=["DELETE"])
def delete_dashboard(dashboard_id: str):
    if not _repo().delete_dashboard(dashboard_id):
        raise AppError(ErrorCode.INVALID_REQUEST, "Unknown dashboard")
    return json_ok({"ok": True})


@dashboard_bp.route("/schedules", methods=["GET"])
def list_schedules():
    return json_ok({"schedules": [s.to_dict() for s in _repo().list_schedules()]})


@dashboard_bp.route("/schedules", methods=["POST"])
def save_schedule():
    data = request.get_json(silent=True) or {}
    schedule_id = data.get("id")
    if schedule_id:
        existing = next((s for s in _repo().list_schedules() if s.id == schedule_id), None)
        if existing is None:
            raise AppError(ErrorCode.INVALID_REQUEST, "Unknown schedule")
        schedule = PipelineSchedule.from_dict({**existing.to_dict(), **data})
    else:
        schedule = PipelineSchedule.create(
            name=str(data.get("name") or "Daily refresh"),
            cron=str(data.get("cron") or "0 8 * * *"),
            workspace_id=str(data.get("workspace_id") or "default"),
            table_name=data.get("table_name"),
            workflow_path=data.get("workflow_path"),
        )
    _repo().save_schedule(schedule)
    return json_ok({"schedule": schedule.to_dict()})
