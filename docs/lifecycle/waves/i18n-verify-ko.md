# Independent verify: L-ko

Slice: `L-ko` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `src/i18n/locales/ko/`. Static read vs English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

Checks: meaning, 합니다 register, native button/title/error phrasing, placeholders, leftover English (Datly OK). P0 = nav, onboarding, CTAs, errors, empty, plus a sample of the rest.

## Held

- Onboarding keys exist and match the job: `onboarding.languageTitle` 언어 선택, `onboarding.languageIntro` 합니다, `onboarding.continue` 계속.
- Nav labels are native nouns (탐색 시작, 문의하기, 이용 약관). Brands left as GitHub / Datly / Discord / Chartifact.
- Most chrome CTAs are noun form (저장, 취소, 불러오기, 계속), which is native for 합니다 UI.
- Sampled placeholders (`{{count}}`, `{{name}}`, `{{message}}`, `<refreshAction>`, `<strong>`) match English token names.
- `dataLoading.chatHint` is `""` in both trees (not a stub dump).
- Vega `chart.vegaLocale` is Korean (오전/오후, 일요일).
- No full-string English stubs in P0 files. Datly kept.

## Fail table

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| chart.emptyStateSubtitle | High | P0 empty copy uses 해 주세요 (해요 request). Register is 합니다. | 채팅에서 에이전트에게 질문하십시오. 아이디어 제안, 데이터 설명, 변환, 차트 작성까지 도와 드립니다. |
| chart.msgTable | High | P0 empty prompt is 해 주세요, and it copies English cheer. | 시각화할 내용을 알려 주십시오. |
| chart.msgAuto | High | P0 empty prompt is 해 주세요. | 차트 추천을 받으려면 원하는 내용을 입력하십시오. |
| chart.msgEncodingEmpty | High | P0 empty prompt is 해 주세요. | 차트 작성기에 데이터 필드를 넣거나 원하는 내용을 설명하십시오. |
| chart.msgUnavailable | High | P0 empty prompt is 해 주세요. | 시각화를 만들려면 먼저 데이터를 가공하십시오. |
| chart.msgWarning | High | P0 warning is 해 주세요. | AI가 만든 결과는 정확하지 않을 수 있습니다. 결과를 확인하십시오. |
| dataThread.emptySession | High | P0 empty body is 해 주세요. | 아래 에이전트에게 불러오기를 요청하십시오. 준비되면 여기에 나타납니다. |
| errors.authExpired | High | P0 error is 해 주세요. Same leak on llm* and catalogSyncTimeout / storageFull. | 세션이 만료되었습니다. 다시 로그인해 주십시오 |
| errors.llmAuthFailed | High | P0 error is 해 주세요. | 인증에 실패했습니다. API 키를 확인해 주십시오 |
| errors.llmRateLimit | High | P0 error is 해 주세요. | 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주십시오 |
| errors.llmContextTooLong | High | P0 error is 해 주세요. | 입력이 너무 깁니다. 데이터 크기나 프롬프트 길이를 줄여 주십시오 |
| errors.llmModelNotFound | High | P0 error is 해 주세요. | 모델을 찾을 수 없습니다. 모델 이름을 확인해 주십시오 |
| errors.llmTimeout | High | P0 error is 해 주세요. | 요청 시간이 초과되었습니다. 연결 상태를 확인한 뒤 다시 시도해 주십시오 |
| errors.llmServiceError | High | P0 error is 해 주세요. | 모델 서비스에서 오류가 반환되었습니다. 잠시 후 다시 시도해 주십시오 |
| errors.catalogSyncTimeout | High | P0 error is 해 주세요. | 카탈로그 동기화 시간이 초과되었습니다. 다시 시도해 주십시오 |
| errors.storageFull | High | P0 error is 해 주세요. | 작업 공간 저장소가 가득 찼습니다. 디스크 공간을 확보한 뒤 다시 시도해 주십시오. |
| appBar.errorOccurred | High | P0 error mixes 해 주세요 with 누릅니다. | 오류가 발생했습니다. <refreshAction>세션을 새로고침</refreshAction>해 주십시오. 문제가 계속되면 세션 닫기를 누릅니다. |
| model.pleaseSelectModel | High | P0 model-wall CTA is 해 주세요. | 모델을 선택하십시오 |
| landing.demoBannerSuffix | Medium | Banner close is 해 주세요. Concat with 설치 가이드 is otherwise correct (를). | 를 확인하십시오. |
| refresh.errorPleaseAddData | Medium | P0 paste error is 해 주세요. Same family: errorPleaseEnterUrl, errorUnsupportedFormat. | 데이터를 붙여넣으십시오. |
| refresh.errorPleaseEnterUrl | Medium | P0 URL error is 해 주세요. | URL을 입력하십시오. |
| refresh.errorUnsupportedFormat | Medium | P0 format error is 해 주세요. | 지원하지 않는 파일 형식입니다. CSV, TSV, JSON, Excel 파일을 사용하십시오. |
| report.pleaseSelectChart | Medium | P0 report CTA is 해 주세요. | 차트를 하나 이상 선택하십시오 |
| report.noChartsAvailable | Medium | P0 empty report is 해 주세요. | 사용할 차트가 없습니다. 먼저 시각화를 만드십시오. |
| about.feature3Title | Medium | Interactive Edit became 대화형 편집, same stem as feature2 대화형 데이터 에이전트 (Conversational). Meaning collides. | 직접 편집 |
| landing.tagline | Medium | English is user-see. Korean is we-show (보여 드립니다). | 표 속에 숨은 이야기를 봅니다. |
| chart.emptyStateTitle | Medium | Calque of Ready to explore. Native first-run is a statement, not a quiz. | 데이터 탐색을 시작할 수 있습니다 |
| chart.createChart | Medium | English word order. | 시작하려면 차트를 만듭니다 |
| chart.notAnymore | Medium | 더 이상 아님 is not a native toggle. | 더 이상 사용하지 않음 |
| chartRec.getSomeIdeas | Medium | 아이디어를 요청합니다 is a status, not a CTA. | 아이디어 받기 |
| dataLoading.subtitle | Medium | Assistant first person (I can help / ask me) became a generic capability line. | 데이터 추출, 생성, 둘러보기를 도와 드립니다. 무엇이든 물어보십시오. |
| upload.helperText.urlInvalid | Medium | Upload error is 해 주세요. | http://, https://, / 로 시작하는 올바른 URL을 입력하십시오 |
| upload.agentChatQuickAction.connect | Low | Chat chip is 해 주세요. Prompt voice can stay a request in 합니다. | 데이터 원본 연결을 도와 주십시오 |
| upload.agentChatSuggestion.findCPI | Low | Same 해 주세요 on a suggestion chip. | 소비자 물가 지수 데이터를 불러와 주십시오 |
| db.asc | Low | Truncated. Pair with db.desc. | 오름차순 |
| db.desc | Low | Truncated. | 내림차순 |
| encoding.ascShort | Low | Same clip on the encoding shelf. | ↑ 오름차순 |
| encoding.descShort | Low | Same clip. | ↓ 내림차순 |
| encoding.channelStrokeDash | Low | 선 점선 is doubled and unclear. | 점선 |
| knowledge.dataMemory | Low | 데이터 기억 is an English calque of Memory. | 데이터 메모리 |
| auth.ssoErrorAccessDenied | Low | 권한 is permission, not authorization cancel. | 인증이 취소되었습니다. SSO를 쓰려면 다시 로그인해 주십시오. |

## Register note

합니다 holds on many statements (입니다, 합니다, 하시겠습니까, 마십시오 in `chartRec.exploreIdeasPrompt`). It does not hold on P0 requests: 해 주세요 is 해요. Recast those as 하십시오 / 해 주십시오, or as a 합니다 statement. Do not mix 주세요 into errors.json.

## Placeholders / stubs

No broken `{{...}}` names found in the P0 files or the sample. No leftover English shipped as the Korean string on nav, onboarding, or empty titles. `Pip 설치` is a product token, not a stub.

## Slice outcome

Fail. Rewrite the High and Medium rows, then re-verify. Low rows can ride the same pass. Onboarding title/intro/Continue and most nav nouns can stay.
