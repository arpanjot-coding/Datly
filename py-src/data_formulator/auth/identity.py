"""Desktop identity: the OS account is the only application identity.

Datly has no application login. Connector credentials (vault, delegated
popup tokens, Kusto/Entra) are a separate concern handled by
``auth.token_store`` and ``auth.gateways``.
"""

from __future__ import annotations

import getpass
import logging
import re
from typing import Optional

from flask import Flask

from data_formulator.auth.identity_migration import migrate_legacy_identity_homes

logger = logging.getLogger(__name__)

_MAX_IDENTITY_LENGTH = 256
_IDENTITY_RE = re.compile(r'^[\w@.\-+:|]+$', re.ASCII)

_localhost_identity: Optional[str] = None


def is_local_mode() -> bool:
    return _localhost_identity is not None


def _validate_identity_value(value: str, source: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError(f"Empty identity value from {source}")
    if len(value) > _MAX_IDENTITY_LENGTH:
        raise ValueError(
            f"Identity value from {source} exceeds "
            f"{_MAX_IDENTITY_LENGTH} characters"
        )
    if not _IDENTITY_RE.match(value):
        raise ValueError(
            f"Identity value from {source} contains disallowed characters"
        )
    return value


def _os_local_identity() -> str:
    username = getpass.getuser()
    validated = _validate_identity_value(username, "os_username")
    return f"local:{validated}"


def init_auth(app: Flask) -> None:
    """Bind ``local:<os_username>`` and fold legacy hosted identity homes."""
    global _localhost_identity
    _localhost_identity = _os_local_identity()
    try:
        moved = migrate_legacy_identity_homes(_localhost_identity)
        if moved:
            logger.info("Migrated %d legacy identity home(s)", len(moved))
    except Exception:
        logger.warning("Legacy identity home migration failed", exc_info=True)
    logger.info("Auth mode: desktop (identity=%s)", _localhost_identity)


def get_identity_id() -> str:
    if _localhost_identity:
        return _localhost_identity
    raise ValueError("Desktop identity is not initialised. Call init_auth().")
