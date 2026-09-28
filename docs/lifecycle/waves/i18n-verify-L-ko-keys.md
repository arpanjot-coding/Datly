# Independent verify: L-ko-keys

Slice: `L-ko-keys`  
Verifier did not write these keys. Static read of `src/i18n/locales/ko/common.json` against English meaning SSOT `src/i18n/locales/en/common.json`. English was not edited. Tests not executed.

Scope is only `sidebar.connected` and `sidebar.offline`. Gate: present, formal Korean UI, native badge phrasing, hangul.

Both keys sit on `StatusPill` in `src/views/DataSourceSidebar.tsx` (connector row Active/Offline, and the open session row also mounts `sidebar.connected`).

| Key | Verdict | vs en | Evidence | Fix if fail |
|-----|---------|-------|----------|-------------|
| `sidebar.connected` | Pass | EN `Active` (live/active connector badge; also the open-session pill). Writer used 사용 중. | Present under `sidebar` in `ko/common.json`. Status-noun chip, not 해요 (사용하고 있어요), not 합니다 sentence. Four hangul syllables plus space, fits a pill. Meaning is live/in play, which matches Active on both the connector and the current-session pill. Same stem as `workspace.active` and `model.active`. Not leftover English. Not 연결됨 (that is Connected on `db.connectedSection`). | n/a |
| `sidebar.offline` | Pass | EN `Offline`. Writer used 오프라인. | Present under `sidebar` in `ko/common.json`. Standard Korean UI hangul loanword for this status, not Latin Offline. Short badge. Pairs with 사용 중 as Active/Offline. | n/a |

No rewrite. First-pass wording already meets the gate.

## Slice outcome

Pass. Both keys are present, formal Korean UI, hangul, and short enough for a badge.

Not a fail here: 사용 중 is also the ko wording on `workspace.active` and `model.active`. One `sidebar.connected` string serves the connector pill and the open-session pill.

Not exercised: live `changeLanguage('ko')` or pill clip at 960×640.
