# Independent verify: L-de-keys

Slice: `L-de-keys`  
Verifier did not write these keys. Static read of `src/i18n/locales/de/common.json` against English meaning SSOT `src/i18n/locales/en/common.json`. English was not edited. Tests not executed.

Scope is only `sidebar.connected` and `sidebar.offline`. Gate: present, Sie register, native badge phrasing, no leftover English unless Offline is the usual German UI loan.

Both keys sit on `StatusPill` in `src/views/DataSourceSidebar.tsx` (connector row Active/Offline, and the open session row also mounts `sidebar.connected`).

| Key | Verdict | vs en | Evidence | Fix if fail |
|-----|---------|-------|----------|-------------|
| `sidebar.connected` | Pass | EN `Active` (live/active connector badge; also the open-session pill). Writer used Aktiv. | Present under `sidebar` in `de/common.json`. Short adjective chip, no du/dein, no Sie sentence. Matches the English job Active, not the key name connected (not Verbunden). Same stem as `model.active` Aktiv and `workspace.active` (aktiv). Fits a pill. Not leftover English. | n/a |
| `sidebar.offline` | Pass | EN `Offline`. Writer used Offline. | Present under `sidebar` in `de/common.json`. Usual German UI loan for this status (Outlook, Teams, Slack, Windows). Not a pasted stub that should have been Getrennt or Nicht verbunden. Short badge. Pairs with Aktiv as Active/Offline. No informal address. | n/a |

No rewrite. First-pass wording already meets the gate.

## Slice outcome

Pass. Both keys are present, Sie-safe, and native enough for a badge. Offline stays as the usual German UI loan.

Not a fail here: one `sidebar.connected` string serves the connector pill and the open-session pill.

Not exercised: live `changeLanguage('de')` or pill clip at 960x640.
