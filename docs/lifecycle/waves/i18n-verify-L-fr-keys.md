# Independent verify: L-fr-keys

Slice: `L-fr-keys`  
Verifier did not write these keys. Static read of `src/i18n/locales/fr/common.json` against English meaning SSOT `src/i18n/locales/en/common.json`. English was not edited. Tests not executed.

Scope is only `sidebar.connected` and `sidebar.offline`. Gate: present, accents, formal vous, native badge phrasing, no leftover English.

Both keys sit on `StatusPill` in `src/views/DataSourceSidebar.tsx` (connector row Active/Offline, and the open session row also mounts `sidebar.connected`).

| Key | Verdict | vs en | Evidence | Fix if fail |
|-----|---------|-------|----------|-------------|
| `sidebar.connected` | Pass | EN `Active` (live/active connector badge; also the open-session pill). Writer used Actif. | Present under `sidebar` in `fr/common.json`. Short masculine adjective chip (connecteur is masculine). No tu/toi/tes, no vous sentence. Accents not required on this stem. Matches the English job Active, not the key name connected (not Connecté). Same stem as `model.active` Actif. Fits a pill. Not leftover English. | n/a |
| `sidebar.offline` | Pass | EN `Offline`. Writer used Hors ligne. | Present under `sidebar` in `fr/common.json`. Native French UI for this status (not Latin Offline). Short badge. Pairs with Actif as Active/Offline. No informal address. No missing accents. | n/a |

No rewrite. First-pass wording already meets the gate.

## Slice outcome

Pass. Both keys are present, vous-safe, accent-correct, and native enough for a badge. No leftover English.

Not a fail here: one `sidebar.connected` string serves the connector pill and the open-session pill.

Not exercised: live `changeLanguage('fr')` or pill clip at 960x640.
