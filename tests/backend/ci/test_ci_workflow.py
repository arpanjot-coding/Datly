"""Assert the DT-0 quality gate and release provenance files stay in place.

Background
----------
CI used to build artifacts without running tests. The desktop enterprise
plan requires a three-job gate (backend, frontend, supply-chain), a
typecheck script, Dependabot on main, and checksum + SBOM on every
desktop release artifact.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
import yaml

pytestmark = [pytest.mark.backend]

REPO_ROOT = Path(__file__).resolve().parents[3]


def _load_yaml(relative: str) -> dict:
    path = REPO_ROOT / relative
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def test_ci_workflow_has_backend_frontend_and_supply_chain_jobs() -> None:
    workflow = _load_yaml(".github/workflows/ci.yml")
    jobs = workflow["jobs"]
    assert set(jobs) >= {"backend", "frontend", "supply-chain"}

    backend_script = "\n".join(
        step.get("run", "") for step in jobs["backend"]["steps"] if isinstance(step, dict)
    )
    assert "known_failing" in backend_script
    assert "pytest" in backend_script

    frontend_script = "\n".join(
        f"{step.get('name', '')} {step.get('run', '')}"
        for step in jobs["frontend"]["steps"]
        if isinstance(step, dict)
    )
    assert "typecheck" in frontend_script
    assert "eslint" in frontend_script or "lint:check" in frontend_script
    assert "vitest" in frontend_script or "yarn test" in frontend_script

    supply = "\n".join(
        str(step) for step in jobs["supply-chain"]["steps"] if isinstance(step, dict)
    ).lower()
    assert "pip-audit" in supply
    assert "audit" in supply
    assert "trivy" in supply
    assert "syft" in supply or "sbom" in supply


def test_package_json_has_typecheck_script() -> None:
    package = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
    assert "typecheck" in package["scripts"]
    assert "tsc --noEmit" in package["scripts"]["typecheck"]


def test_dependabot_targets_main() -> None:
    config = _load_yaml(".github/dependabot.yml")
    branches = {update.get("target-branch") for update in config["updates"]}
    assert branches == {"main"}


def test_desktop_release_publishes_checksum_and_sbom() -> None:
    workflow = _load_yaml(".github/workflows/desktop-build.yml")
    rendered = yaml.dump(workflow).lower()
    assert "sha256" in rendered or "checksum" in rendered
    assert "sbom" in rendered or "syft" in rendered
