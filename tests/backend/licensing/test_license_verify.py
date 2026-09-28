"""DT-9: offline licence verification."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from data_formulator.licensing.verify import LicenseError, verify_license

pytestmark = [pytest.mark.backend]


def _issue(payload: dict, key: Ed25519PrivateKey | None = None):
    private = key or Ed25519PrivateKey.generate()
    raw = json.dumps(payload, sort_keys=True).encode("utf-8")
    public = private.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    return raw, private.sign(raw), public


def test_valid_licence_verifies_offline() -> None:
    expiry = datetime.now(timezone.utc) + timedelta(days=30)
    payload, signature, public = _issue({
        "seats": 5,
        "expiry": expiry.isoformat(),
        "features": ["pipeline"],
    })
    status = verify_license(payload, signature, public)
    assert status.valid is True
    assert status.seats == 5
    assert "pipeline" in status.features


def test_tampered_licence_is_rejected() -> None:
    expiry = datetime.now(timezone.utc) + timedelta(days=30)
    payload, signature, public = _issue({
        "seats": 1,
        "expiry": expiry.isoformat(),
        "features": [],
    })
    tampered = payload.replace(b'"seats": 1', b'"seats": 99')
    with pytest.raises(LicenseError, match="signature"):
        verify_license(tampered, signature, public)


def test_expired_licence_uses_grace_then_fails() -> None:
    now = datetime(2026, 8, 22, tzinfo=timezone.utc)
    expiry = now - timedelta(days=3)
    payload, signature, public = _issue({
        "seats": 1,
        "expiry": expiry.isoformat(),
        "features": [],
    })
    status = verify_license(payload, signature, public, now=now, grace_days=7)
    assert status.valid is False
    assert status.grace_until is not None

    with pytest.raises(LicenseError, match="expired"):
        verify_license(
            payload, signature, public,
            now=now + timedelta(days=10),
            grace_days=7,
        )
