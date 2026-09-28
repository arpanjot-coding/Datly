"""Machine-wide managed policy. Policy always wins over CLI and UI."""

from __future__ import annotations

import json
import logging
import os
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

POLICY_ENV = "DATA_FORMULATOR_POLICY"


class PolicyError(Exception):
    """Malformed or missing required policy. Fail closed."""


@dataclass(frozen=True)
class ManagedPolicy:
    force_offline: bool = False
    disable_custom_models: bool = False
    disable_data_connectors: bool = False
    disable_updates: bool = False
    telemetry: bool = False
    update_channel: str = "stable"
    allowed_llm_endpoints: tuple[str, ...] = field(default_factory=tuple)
    disable_connectors: tuple[str, ...] = field(default_factory=tuple)

    def to_public_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["allowed_llm_endpoints"] = list(self.allowed_llm_endpoints)
        data["disable_connectors"] = list(self.disable_connectors)
        data["locked"] = [
            key for key, value in data.items()
            if key not in {"telemetry", "update_channel", "allowed_llm_endpoints", "disable_connectors"}
            and value
        ]
        return data


_active: ManagedPolicy | None = None


def default_policy_path() -> Path:
    explicit = os.environ.get(POLICY_ENV, "").strip()
    if explicit:
        return Path(explicit)
    if sys.platform == "win32":
        root = os.environ.get("PROGRAMDATA", r"C:\ProgramData")
        return Path(root) / "Datly" / "policy.json"
    if sys.platform == "darwin":
        return Path("/Library/Application Support/Datly/policy.json")
    return Path("/etc/datly/policy.json")


def _as_bool(value: Any, field_name: str) -> bool:
    if isinstance(value, bool):
        return value
    raise PolicyError(f"Policy field {field_name} must be a boolean")


def _as_str_tuple(value: Any, field_name: str) -> tuple[str, ...]:
    if value is None:
        return ()
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise PolicyError(f"Policy field {field_name} must be an array of strings")
    return tuple(value)


def parse_policy(data: Any) -> ManagedPolicy:
    if not isinstance(data, dict):
        raise PolicyError("Policy document must be a JSON object")
    channel = data.get("update_channel", "stable")
    if not isinstance(channel, str) or not channel:
        raise PolicyError("Policy field update_channel must be a non-empty string")
    return ManagedPolicy(
        force_offline=_as_bool(data.get("force_offline", False), "force_offline"),
        disable_custom_models=_as_bool(data.get("disable_custom_models", False), "disable_custom_models"),
        disable_data_connectors=_as_bool(data.get("disable_data_connectors", False), "disable_data_connectors"),
        disable_updates=_as_bool(data.get("disable_updates", False), "disable_updates"),
        telemetry=_as_bool(data.get("telemetry", False), "telemetry"),
        update_channel=channel,
        allowed_llm_endpoints=_as_str_tuple(data.get("allowed_llm_endpoints"), "allowed_llm_endpoints"),
        disable_connectors=_as_str_tuple(data.get("disable_connectors"), "disable_connectors"),
    )


def load_managed_policy(path: Path | None = None) -> ManagedPolicy | None:
    """Load policy from *path* or the platform default.

    Missing optional default file → ``None``.
    Explicit ``DATA_FORMULATOR_POLICY`` or a present file that cannot be
    parsed → ``PolicyError`` (fail closed).
    """
    target = path or default_policy_path()
    explicit = bool(os.environ.get(POLICY_ENV, "").strip()) or path is not None
    if not target.is_file():
        if explicit:
            raise PolicyError(f"Policy file not found: {target}")
        return None
    try:
        raw = json.loads(target.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PolicyError(f"Policy file is malformed: {target}") from exc
    return parse_policy(raw)


def set_active_policy(policy: ManagedPolicy | None) -> None:
    global _active
    _active = policy


def get_active_policy() -> ManagedPolicy | None:
    return _active


def current_force_offline() -> bool:
    return bool(_active and _active.force_offline)


def assert_network_allowed(action: str = "Outbound network") -> None:
    if current_force_offline():
        raise PolicyError(f"{action} is blocked by force-offline policy")


def apply_managed_policy(cli: dict) -> dict:
    """Overlay policy onto CLI args. Policy wins."""
    policy = load_managed_policy()
    set_active_policy(policy)
    if policy is None:
        return cli
    if policy.disable_custom_models:
        cli["disable_custom_models"] = True
    if policy.disable_data_connectors:
        cli["disable_data_connectors"] = True
    cli["force_offline"] = policy.force_offline
    cli["disable_updates"] = policy.disable_updates
    cli["managed_policy"] = policy.to_public_dict()
    logger.info("Applied managed policy (force_offline=%s)", policy.force_offline)
    return cli
