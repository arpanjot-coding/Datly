"""The desktop packaging chain must stay ordered and complete.

A packaged app refuses to fall back to ``uv``, so if the SPA build or the
PyInstaller sidecar is skipped the installer ships an app that cannot
start. These assertions freeze the ordering.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

pytestmark = [pytest.mark.backend]

REPO_ROOT = Path(__file__).resolve().parents[3]


@pytest.fixture(scope="module")
def package_json() -> dict:
    return json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))


def test_electron_build_runs_spa_then_sidecar_then_builder(package_json: dict) -> None:
    script = package_json["scripts"]["electron:build"]
    spa = script.index("yarn build")
    sidecar = script.index("build:sidecar")
    builder = script.index("electron-builder")
    assert spa < sidecar < builder, script


def test_sidecar_script_exists(package_json: dict) -> None:
    assert package_json["scripts"]["build:sidecar"] == "node scripts/build-sidecar.cjs"
    assert (REPO_ROOT / "scripts" / "build-sidecar.cjs").is_file()


def test_sidecar_is_copied_into_resources(package_json: dict) -> None:
    resources = package_json["build"]["extraResources"]
    staged = [entry for entry in resources if entry.get("to") == "sidecar"]
    assert staged, resources
    assert staged[0]["from"] == "packaging/sidecar"


def test_fuses_hook_is_configured(package_json: dict) -> None:
    assert package_json["build"]["afterPack"] == "./electron/afterPack.cjs"
    assert (REPO_ROOT / "electron" / "afterPack.cjs").is_file()


def test_sidecar_build_requires_the_spa_bundle() -> None:
    """The script must fail closed when the SPA has not been built."""
    source = (REPO_ROOT / "scripts" / "build-sidecar.cjs").read_text(encoding="utf-8")
    assert "index.html" in source
    assert "yarn build" in source
