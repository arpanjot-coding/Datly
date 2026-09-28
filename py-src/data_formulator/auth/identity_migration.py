"""Fold pre-desktop workspace homes onto the OS identity."""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

from data_formulator.datalake.workspace import (
    get_data_formulator_home,
    sanitize_identity_dirname,
)

logger = logging.getLogger(__name__)


def migrate_legacy_identity_homes(
    local_identity: str,
    home: Path | None = None,
) -> list[str]:
    """Move ``browser:*`` / ``user:*`` user homes onto ``local:<os_user>``.

    If the destination already exists, workspace directories from the
    legacy home are merged in. The legacy directory is removed after a
    successful move or merge.
    """
    users_root = Path(home or get_data_formulator_home()) / "users"
    if not users_root.is_dir():
        return []

    dest_name = sanitize_identity_dirname(local_identity)
    dest = users_root / dest_name
    moved: list[str] = []

    for child in sorted(users_root.iterdir()):
        if not child.is_dir() or child.name == dest_name:
            continue
        if not _is_legacy_home_name(child.name):
            continue
        try:
            if dest.exists():
                _merge_homes(child, dest)
                shutil.rmtree(child, ignore_errors=True)
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                child.rename(dest)
            moved.append(child.name)
            logger.info("Migrated identity home %s -> %s", child.name, dest_name)
        except OSError:
            logger.warning("Failed to migrate identity home %s", child, exc_info=True)

    return moved


def _is_legacy_home_name(name: str) -> bool:
    """True for sanitized ``browser:*`` / ``user:*`` directory names.

    ``secure_filename`` strips ``:``, so ``browser:old-uuid`` becomes
    ``browserold-uuid`` (not ``browser_...``).
    """
    lowered = name.lower()
    return lowered.startswith("browser") or lowered.startswith("user")


def _merge_homes(source: Path, dest: Path) -> None:
    for item in source.iterdir():
        target = dest / item.name
        if item.is_dir():
            if target.exists():
                _merge_homes(item, target)
            else:
                shutil.copytree(item, target)
        elif not target.exists():
            shutil.copy2(item, target)
