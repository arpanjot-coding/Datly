# Independent verify: L-vi

Slice: `L-vi` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write the original `vi` tree. Static read of `src/i18n/locales/vi/*.json` against English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

Ten keys failed the first pass (leftover English `Data Thread` / path stub, DATABASE shout as `CƠ SỞ DỮ LIỆU`, parse rendered as phân tích). Those keys were rewritten in `vi` only, then re-checked. English was not edited.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | Pass | String-leaf key set equals `en` for each of the 10 filenames. Vega locale arrays are not counted as string leaves. | Same 10 JSON names. File line counts match file-for-file: `common` 1036, `chart` 233, `encoding` 83, `messages` 90, `upload` 180, `model` 83, `dataLoading` 113, `loader` 116, `navigation` 17, `errors` 37. Parent keys sit on the same lines (`onboarding` at 1031 in both `common.json`). `chart.vegaLocale` `periods` / `days` / `shortDays` / `months` / `shortMonths` are arrays in both (not string leaves). Format strings `dateTime` / `date` / `time` are present. Vietnamese day and month names are filled (Chủ Nhật, Tháng Một; shortDays CN/T2–T7; periods SA/CH). | n/a |
| A2 | Pass | Register bạn throughout UI copy. Vietnamese diacritics (ă â ê ô ơ ư, tones) present where the word needs them. Meaning matches the English job, not English word order. | Addressed copy uses bạn / hãy / của bạn: `onboarding.languageIntro` Bạn có thể đổi lại, `chartRec.couldYouClarify` Bạn giải thích rõ hơn được không?, `chatDialog.you` Bạn, `messages.confirmDelete` Bạn chắc chắn muốn xóa?, `encoding.whatDoYouWantToVisualize` bạn muốn xem gì?. No anh / chị / quý khách as address. Diacritics on dữ liệu, ngôn ngữ, Cài đặt, đang, không, tiếp tục. First pass used phân tích (analyze) for parse; rewritten to đọc to match `errors.fileParseError` and `refresh.errorParsePaste`. | n/a |
| A3 | Pass | Placeholders `{{name}}` / `{{count}}` / i18next plural suffixes / HTML tags such as `<refreshAction>` and `<strong>` match `en`. | Sampled tokens match by name: `{{count}}`, `{{name}}`, `{{table}}`, `{{message}}`, `{{count, number}}`, `{{sampleSize}}` / `{{totalSize}}`, `{{live}}`, `{{connector}}` / `{{tables}}` / `{{large}}`. Plural suffixes present on both: `textTurnEarlier_other`, `tablesAvailableToAgent_other`, `earlierTurns_other`, `columnCount_one` / `_other`, `dataLoading` `loadedCount_plural`, `previewColumns_plural`, `previewShowingRows_plural`, `failedSteps_plural`, `partialFailure_plural`. `appBar.errorOccurred` keeps `<refreshAction>…</refreshAction>`. `workspace.deleteConfirm` keeps `<strong>{{name}}</strong>` and `{{id}}`. Loader CLI spans keep `<user>` `<host>` `<port>` `<database>` `<name>` `<server>`. Rewritten `upload.contentExceedsSizeLimit` keeps `{{limit}}` / `{{size}}`. | n/a |
| A4 | Pass | No leftover English stubs shipped as the translation. Allow Datly, GitHub, Chartifact, Python, Azure, Vega-Lite, BETWEEN, CONTAINS, Spec, Discord, DuckDB, ECharts, Chart.js, LiteLLM. | P0 strings are Vietnamese, not pasted English. Connector tokens `BETWEEN` / `CONTAINS` kept. `chart.gallery.spec` Spec kept. Brands Datly, GitHub, Chartifact, Python, Azure, Vega-Lite, Discord, DuckDB, ECharts, Chart.js, LiteLLM stay. `loader.mssql.encrypt` / `trust_server_certificate` keep `(yes/no)` because `mssql_data_loader.py` writes those literals into the ODBC string. `dataLoading.examples.extractFromTextPrompt` keeps the English source excerpt (same as `en`; it is sample extract text, not chrome). First pass shipped `Data Thread`, `/path/to/your/data/folder`, and `CƠ SỞ DỮ LIỆU`; rewritten. | n/a |
| A5 | Pass | P0 chrome is native: navigation, onboarding.languageTitle, onboarding.languageIntro, onboarding.continue, primary CTAs, errors, empty states. | `navigation.*`: Trang chủ, Dữ liệu, Trực quan, Báo cáo, Chat, Giới thiệu. `onboarding.languageTitle` Chọn ngôn ngữ. `languageIntro` Datly sẽ dùng ngôn ngữ này trên mọi màn hình. Bạn có thể đổi lại trong Cài đặt. `continue` Tiếp tục. CTAs: Lưu, Hủy, Đóng, Xóa, Tiếp tục, Tải, Kết nối, Đăng nhập. `errors.*` native (Cần đăng nhập, Session đã hết hạn. Hãy đăng nhập lại, Không có quyền truy cập, `fileParseError` Không đọc được tệp vừa tải lên). Empty: `dataThread.emptySessionTitle` Chưa có dữ liệu, `emptySession` Nhờ agent bên dưới tải giúp…, `chart.emptyStateTitle` / `emptyStateSubtitle`, `session.noSavedSessions`, `sidebar.noSessions` / `emptyTree` / `emptyWorkspace`, `logs.empty`, `preview.noTablesToPreview`, `messages.noMessages` / `noData`. | n/a |
| A6 | Pass | Product name stays Datly. Glossary-stable product nouns: session, workspace, chart, encoding, model, agent. | Datly appears in the same nine leaves as `en` (`app.name`, `app.loadingProduct`, `landing.modelTip`, `refresh.installLocallyForUpload`, `db.confirmDeleteTableLoaded`, `auth.loginTitle`, `onboarding.languageIntro`, `upload.installLocallyTooltip`, `loader.mssql.authInstructions`). session stays session. chart stays chart (biểu đồ on gallery type names). encoding stays encoding. model stays model. agent stays agent. workspace stays workspace on the main tree (`loadPlan.loadInNewWorkspace` Tải vào workspace mới, `featureWorkspaces` Workspace lưu lâu…). `loader.databricks.authInstructions` workspace Databricks is the Databricks product workspace, not Datly workspace. First pass leftover `Data Thread` rewritten to Luồng dữ liệu (matches `luồng` for thread). | n/a |
| A7 | Pass | No em dashes. Watch length on toolbar and buttons. | No `—` in `src/i18n/locales/vi/*.json`. EN em dashes were recast as periods or dropped (`chart.emptyStateSubtitle`, `errors.authExpired`, `dataLoading.stopped` is `(đã dừng)`). Short controls stay short: `session.resetButton` Đặt lại, `db.asc` / `desc` Tăng / Giảm, `encoding.ascShort` ↑ tăng, `chart.addChart` Thêm chart, `onboarding.continue` Tiếp tục, `navigation.visualization` Trực quan. | n/a |

## Rewritten keys (first pass Fail, then re-check Pass)

| Key | First-pass problem | After rewrite |
|-----|--------------------|---------------|
| `dataThread.title` | Leftover English `Data Thread` (EN is Data Threads). | Luồng dữ liệu |
| `about.feature3Description` | Same leftover product name in body copy. | …rồi dùng Luồng dữ liệu để lùi bước hoặc rẽ nhánh. |
| `upload.folderPathPlaceholder` | Leftover English path stub. | /đường/dẫn/tới/thư-mục/dữ-liệu |
| `upload.contentExceedsSizeLimit` | Leftover EN DATABASE shout as CƠ SỞ DỮ LIỆU. `{{limit}}` `{{size}}` kept. | … thẻ Cơ sở dữ liệu … |
| `refresh.errorParseContent` | Parse rendered as phân tích (analyze). Pair of `errorParsePaste` already used đọc. | Không đọc được nội dung dán vào. |
| `refresh.errorParseExcel` | Same parse-as-analyze. | Không đọc được tệp Excel. |
| `report.couldNotParseSvg` | Same parse-as-analyze. | Không đọc được SVG |
| `upload.errors.failedToParse` | Same parse-as-analyze. `{{name}}` kept. | Không đọc được {{name}}. |
| `upload.errors.failedToParseExcel` | Same. `{{name}}` kept. | Không đọc được tệp Excel {{name}}. |
| `upload.errors.unableToParseUrl` | Same. | Không đọc được dữ liệu từ URL. … |

## Slice outcome

All seven listed checks Pass after the ten key rewrites. L-vi goal (native Vietnamese P0 chrome, bạn, diacritics, placeholders intact, Datly kept) is met in source.

Not a fail here: `navigation.chat` / `chart.chat` Chat is a consistent loanword (like session). `app.info` Thông tin, `landing.demos` Demo, `sidebar.offline` Ngoại tuyến. `messages.agent.parseActionFailed` keeps phân tích for parse-the-action. `config.language` exists in both trees.

Not exercised in this verify: live `changeLanguage('vi')`, CTA clip at 960×640, or i18next interpolation at runtime.
