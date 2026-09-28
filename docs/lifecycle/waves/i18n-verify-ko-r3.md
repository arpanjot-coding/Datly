# Independent verify r3: L-ko

Slice: `L-ko` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `src/i18n/locales/ko/`. Static re-read vs r2 fail list, English meaning SSOT, onboarding, and nav. Tests not executed.

Gate: every `ko/*.json` parses (implied by reading), 해 주세요 gone from P0 errors / empty / CTAs, onboarding and nav still hold.

## JSON

r2 comma sites now have trailing commas where a sibling key follows: `errors.authExpired`, `errors.catalogSyncTimeout`, `chart.createChart`, `chart.notAnymore`, `model.pleaseSelectModel`, `about.feature3Title`, `report.pleaseSelectChart`, `report.noChartsAvailable`, `chartRec.getSomeIdeas`, `db.desc`, `knowledge.dataMemory`, `auth.ssoErrorAccessDenied`, `encoding.channelStrokeDash`, `encoding.descShort`, `upload.agentChatQuickAction.connect`, `upload.agentChatSuggestion.findCPI`. Last-in-object strings (storageFull, formulationFailed, agentRules, and similar) correctly omit a comma. No truncated-object pattern remains in the ten JSON files.

## P0 register and meaning

Zero `해 주세요` in `src/i18n/locales/ko/`. Recast P0 copy is 하십시오 / 해 주십시오 / 합니다 and still matches English.

Onboarding holds: `languageTitle` 언어 선택, `languageIntro` 합니다, `continue` 계속. Nav nouns hold: 탐색 시작, 문의하기, 이용 약관. Model wall CTA `pleaseSelectModel` 모델을 선택하십시오. Empty: `emptySession`, chart empty/msg*, `report.noChartsAvailable`. Errors: `errors.json`, `appBar.errorOccurred`, `auth.sessionExpired`, SSO family, refresh/report/upload errors. Placeholders on those keys still intact. Datly kept.

## Fail table

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|

None.

Not a fail: leftover 주세요 that is not 해 주세요, and not P0 chrome (`auth.idpRedirecting` 기다려 주세요, chat prompts `도와 주세요` / `보여 주세요`, `messages.agent.formulationTimedOut` 늘려 주세요).

## Slice outcome

Pass. JSON reads as valid. 해 주세요 is gone from P0 errors, empty, and CTAs. Onboarding and nav still hold.
