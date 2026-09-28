# Independent verify: L-ja-keys

Slice: `L-ja-keys`  
Verifier did not write these keys. Static read of `src/i18n/locales/ja/common.json` against English meaning SSOT `src/i18n/locales/en/common.json`. English was not edited. Tests not executed.

Scope is only `sidebar.connected` and `sidebar.offline`. Gate: present, polite Japanese UI, short badge phrasing.

Both keys sit on `StatusPill` in `src/views/DataSourceSidebar.tsx` (connector row Active/Offline, and the open session row also mounts `sidebar.connected`).

| Key | Verdict | vs en | Evidence | Fix if fail |
|-----|---------|-------|----------|-------------|
| `sidebar.connected` | Pass | EN `Active` (live/active connector badge; also the open-session pill). Writer used 使用中. | Present under `sidebar` in `ja/common.json`. Noun-form chip, not です/ます, not casual 使ってる. Three characters, fits a pill. Meaning is live/in play, which matches Active on both the connector and the current-session pill. Not leftover English. | n/a |
| `sidebar.offline` | Pass | EN `Offline`. Writer used オフライン. | Present under `sidebar` in `ja/common.json`. Standard Japanese UI katakana for this status, not a pasted English stub. Short badge. Pairs with 使用中 as Active/Offline. | n/a |

No rewrite. First-pass wording already meets the gate.

## Slice outcome

Pass. Both keys are present, polite Japanese UI, and short enough for a badge.

Not a fail here: 使用中 is also the ja wording on `workspace.active`. One `sidebar.connected` string serves the connector pill and the open-session pill.

Not exercised: live `changeLanguage('ja')` or pill clip at 960×640.
