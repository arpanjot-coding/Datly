"""Freeze the known_failing quarantine so it cannot grow silently.

Background
----------
DT-0 gates pull requests on the backend suite. A handful of pre-existing
failures are excluded with the ``known_failing`` marker. This test is the
lock on that list: adding or removing a mark without updating the inventory
fails CI.

The inventory is the platform-independent failures that also go red on
Ubuntu CI: spinner TTY/TERM handling, and SQL-readonly tests that break
after ``data_loader`` module reloads in ``test_plugin_scanner``.
Windows-only setup issues (symlink privilege, cp1252 plugin source
files) are not quarantined.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

pytestmark = [pytest.mark.backend]

REPO_ROOT = Path(__file__).resolve().parents[3]

# Frozen list. Do not grow this. Shrink it only by deleting the mark after
# the underlying bug is fixed (or the hosted-auth code is removed in DT-10).
KNOWN_FAILING_NODEIDS = [
    "tests/backend/data_loader/test_sql_readonly.py::TestMssqlApplicationIntent::test_connection_string_sets_application_intent",
    "tests/backend/data_loader/test_sql_readonly.py::TestMysqlReadOnlySession::test_connect_kwargs_include_read_only_session",
    "tests/backend/test_startup_spinner.py::test_spinner_output_is_cp1252_safe[False]",
    "tests/backend/test_startup_spinner.py::test_spinner_output_is_cp1252_safe[True]",
]


def _collect(marker: str) -> list[str]:
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            "tests/backend",
            "--collect-only",
            "-q",
            "-m",
            marker,
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    nodeids = []
    for line in result.stdout.splitlines():
        stripped = line.strip().replace("\\", "/")
        if "::" in stripped:
            nodeids.append(stripped)
    return sorted(nodeids)


def test_pytest_ini_registers_known_failing_marker() -> None:
    ini = (REPO_ROOT / "pytest.ini").read_text(encoding="utf-8")
    assert "known_failing:" in ini


def test_known_failing_inventory_is_frozen() -> None:
    collected = _collect("known_failing")
    assert collected == KNOWN_FAILING_NODEIDS, (
        "known_failing quarantine changed.\n"
        f"expected {len(KNOWN_FAILING_NODEIDS)} tests, found {len(collected)}.\n"
        f"added: {sorted(set(collected) - set(KNOWN_FAILING_NODEIDS))}\n"
        f"removed: {sorted(set(KNOWN_FAILING_NODEIDS) - set(collected))}"
    )


def test_known_failing_does_not_include_the_inventory_test_itself() -> None:
    collected = _collect("known_failing")
    assert not any("test_known_failing_quarantine" in nodeid for nodeid in collected)
