# Independent verify r2: L-ko

Slice: `L-ko` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `src/i18n/locales/ko/`. Static re-read vs `src/i18n/locales/en/*.json` and vs highs in `docs/lifecycle/waves/i18n-verify-ko.md`. Tests not executed.

Gate: 해 주세요 gone from P0 errors / empty / CTAs, and meaning holds. Also re-check onboarding and nav.

## Highs from r1 (wording)

All listed High strings were recast to 하십시오 / 해 주십시오 / 합니다. Meaning still matches English.

| Key | Now |
|-----|-----|
| chart.emptyStateSubtitle | 질문하십시오 / 도와 드립니다 |
| chart.msgTable | 알려 주십시오 |
| chart.msgAuto | 입력하십시오 |
| chart.msgEncodingEmpty | 설명하십시오 |
| chart.msgUnavailable | 가공하십시오 |
| chart.msgWarning | 확인하십시오 |
| dataThread.emptySession | 요청하십시오 |
| errors.authExpired through storageFull | 해 주십시오 |
| appBar.errorOccurred | 해 주십시오 |
| model.pleaseSelectModel | 선택하십시오 |

r1 Medium wording rows also recast (demoBannerSuffix, refresh errors, report empty/CTA, feature3Title 직접 편집, tagline, emptyStateTitle, createChart, notAnymore, getSomeIdeas, dataLoading.subtitle, upload urlInvalid).

Onboarding still holds: 언어 선택 / 합니다 intro / 계속. Nav nouns unchanged (탐색 시작, 문의하기, 이용 약관). Placeholders on recast keys still intact. Datly kept.

## Fail table

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| errors.authExpired | High | Recast dropped the trailing comma. `errors.json` does not parse, so Korean P0 errors never load. | 세션이 만료되었습니다. 다시 로그인해 주십시오 |
| errors.catalogSyncTimeout | High | Same missing comma in `errors.json`. | 카탈로그 동기화 시간이 초과되었습니다. 다시 시도해 주십시오 |
| chart.createChart | High | Missing comma in `chart.json` after recast. File does not parse. | 시작하려면 차트를 만듭니다 |
| chart.notAnymore | High | Missing comma in `chart.json` after recast. | 더 이상 사용하지 않음 |
| model.pleaseSelectModel | High | Missing comma in `model.json` after recast. Model-wall CTA file does not parse. | 모델을 선택하십시오 |
| about.feature3Title | High | Missing comma in `common.json` after recast. Breaks onboarding-adjacent common tree. | 직접 편집 |
| report.pleaseSelectChart | High | Missing comma in `common.json` after recast. | 차트를 하나 이상 선택하십시오 |
| report.noChartsAvailable | High | Missing comma in `common.json` after recast. | 사용할 차트가 없습니다. 먼저 시각화를 만드십시오. |
| chartRec.getSomeIdeas | High | Missing comma in `common.json` after recast. | 아이디어 받기 |
| db.desc | High | Missing comma after 내림차순. | 내림차순 |
| knowledge.dataMemory | High | Missing comma after 데이터 메모리. | 데이터 메모리 |
| auth.ssoErrorAccessDenied | High | Missing comma after recast. | 인증이 취소되었습니다. SSO를 쓰려면 다시 로그인해 주십시오. |
| encoding.channelStrokeDash | High | Missing comma in `encoding.json` after recast. | 점선 |
| encoding.descShort | High | Missing comma after ↓ 내림차순. | ↓ 내림차순 |
| upload.agentChatQuickAction.connect | High | Missing comma in `upload.json` after recast. | 데이터 원본 연결을 도와 주십시오 |
| upload.agentChatSuggestion.findCPI | High | Missing comma in `upload.json` after recast. | 소비자 물가 지수 데이터를 불러와 주십시오 |
| auth.sessionExpired | High | P0 login error still 해 주세요. Sibling of recast errors.authExpired. | 세션이 만료되었습니다. 다시 로그인해 주십시오. |
| auth.ssoErrorInvalidState | Medium | First-run SSO error still 해 주세요. | SSO 세션이 만료되었거나 중단되었습니다. 다시 로그인해 주십시오. |
| auth.ssoErrorGeneric | Medium | First-run SSO error still 해 주세요. Same family: InvalidClient, TokenExchange, MissingEndpoint, ssoPopupBlocked. | SSO 로그인에 실패했습니다. 다시 시도하거나 관리자에게 문의해 주십시오. |
| report.failedToGenerateReportImage | Medium | Report error still 해 주세요. Same family: clipboardNotSupported, clipboardRequiresSecureContext, failedToDownloadPng, failedToExportPdf. | 보고서 이미지를 만들지 못했습니다. 다시 시도해 주십시오. |
| upload.errors.unableToParseUrl | Medium | Upload error still 해 주세요. Same family: failedToFetch, contentExceedsSizeLimit. | 제공한 URL에서 데이터를 해석하지 못했습니다. URL이 CSV, JSON, JSONL 데이터를 가리키는지 확인해 주십시오. |

Same wording is fine on the comma rows. Restore `,` after each recast value so the JSON object is valid. Do not leave 해 주세요 on login/report/upload errors.

## Slice outcome

Fail. High copy recasts are the right 합니다 forms, but trailing commas were stripped so `errors.json`, `chart.json`, `model.json`, `common.json`, `encoding.json`, and `upload.json` are invalid JSON. Korean will not load until commas are restored. After that, recast leftover P0 해 주세요 on `auth.sessionExpired` and the SSO/report/upload error family, then re-verify.
