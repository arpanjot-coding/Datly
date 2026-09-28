"""DT-8: force-offline blocks LLM calls before any network attempt."""

from __future__ import annotations

import pytest

from data_formulator.agents.client_utils import Client
from data_formulator.config.policy import ManagedPolicy, PolicyError, set_active_policy

pytestmark = [pytest.mark.backend]


def test_get_completion_blocked_when_force_offline(monkeypatch: pytest.MonkeyPatch) -> None:
    set_active_policy(ManagedPolicy(force_offline=True))
    client = Client.__new__(Client)
    client.params = {}

    def fail_dispatch(**kwargs):
        raise AssertionError("LLM dispatch must not run under force-offline")

    client._dispatch = fail_dispatch
    with pytest.raises(PolicyError, match="force-offline"):
        client.get_completion(messages=[{"role": "user", "content": "hi"}])
    set_active_policy(None)
