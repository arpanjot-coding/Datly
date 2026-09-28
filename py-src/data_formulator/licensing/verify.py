"""Offline-verifiable signed licence."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey


class LicenseError(Exception):
    pass


@dataclass(frozen=True)
class LicenseStatus:
    valid: bool
    seats: int
    expiry: datetime
    features: tuple[str, ...]
    grace_until: datetime | None = None


def _parse_payload(raw: bytes) -> dict[str, Any]:
    try:
        data = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise LicenseError("Licence payload is not valid JSON") from exc
    if not isinstance(data, dict):
        raise LicenseError("Licence payload must be an object")
    return data


def verify_license(
    payload: bytes,
    signature: bytes,
    public_key: bytes,
    *,
    now: datetime | None = None,
    grace_days: int = 7,
) -> LicenseStatus:
    """Verify an Ed25519-signed licence with no network access."""
    try:
        key = Ed25519PublicKey.from_public_bytes(public_key)
        key.verify(signature, payload)
    except (ValueError, InvalidSignature) as exc:
        raise LicenseError("Licence signature is invalid") from exc

    data = _parse_payload(payload)
    try:
        seats = int(data["seats"])
        expiry = datetime.fromisoformat(data["expiry"])
        features = tuple(data.get("features") or [])
    except (KeyError, TypeError, ValueError) as exc:
        raise LicenseError("Licence fields are incomplete") from exc

    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    clock = now or datetime.now(timezone.utc)
    if clock.tzinfo is None:
        clock = clock.replace(tzinfo=timezone.utc)

    grace_until = expiry + timedelta(days=grace_days)
    if clock > grace_until:
        raise LicenseError("Licence has expired")
    return LicenseStatus(
        valid=clock <= expiry,
        seats=seats,
        expiry=expiry,
        features=features,
        grace_until=grace_until if clock > expiry else None,
    )
