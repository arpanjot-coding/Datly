from __future__ import annotations

import os
import shutil
import sys
import tempfile
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PY_SRC = PROJECT_ROOT / "py-src"

if str(PY_SRC) not in sys.path:
    sys.path.insert(0, str(PY_SRC))

# Snapshot captured at conftest load time — before any test or load_dotenv() runs.
_PRISTINE_ENV: dict[str, str] = dict(os.environ)

# Sandbox home for the whole session. Anything that resolves
# ``get_data_formulator_home()`` — workspaces, the credential vault, the
# audit log, persistent log files — must land here and never in the
# developer's real ~/.data_formulator.
_TEST_HOME: Path | None = None


def pytest_configure(config: pytest.Config) -> None:
    global _TEST_HOME
    _TEST_HOME = Path(tempfile.mkdtemp(prefix="datly-test-home-"))
    # Seed both the live environment and the pristine snapshot so the
    # per-test reset below keeps pointing at the sandbox.
    os.environ["DATA_FORMULATOR_HOME"] = str(_TEST_HOME)
    _PRISTINE_ENV["DATA_FORMULATOR_HOME"] = str(_TEST_HOME)


def pytest_unconfigure(config: pytest.Config) -> None:
    if _TEST_HOME is not None:
        try:
            from data_formulator.audit.store import reset_audit_stores
            reset_audit_stores()
        except Exception:
            pass
        shutil.rmtree(_TEST_HOME, ignore_errors=True)


def _reset_to_pristine() -> None:
    """Replace os.environ with the pristine snapshot, keeping pytest internals."""
    pytest_vars = {k: v for k, v in os.environ.items() if k.startswith("PYTEST_")}
    os.environ.clear()
    os.environ.update(_PRISTINE_ENV)
    os.environ.update(pytest_vars)


@pytest.fixture(autouse=True)
def _isolate_env():
    """Restore os.environ to its pre-session state before every test.

    When any test imports ``data_formulator.app``, the module-level
    ``load_dotenv()`` call injects the developer's ``.env`` into
    ``os.environ``, polluting all subsequent tests in the same process.
    This fixture ensures each test starts with the pristine environment
    that existed before any test ran, including the sandboxed
    ``DATA_FORMULATOR_HOME``.
    """
    _reset_to_pristine()
    yield
    _reset_to_pristine()
