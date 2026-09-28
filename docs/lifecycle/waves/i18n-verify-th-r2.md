# Independent verify r2: L-th

Slice: `L-th` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write the original `th` tree and did not write the r1 fail. Static re-read of `src/i18n/locales/th/*.json` against English meaning SSOT `src/i18n/locales/en/*.json` and against r1 `docs/lifecycle/waves/i18n-verify-th.md`. Tests not executed. Typecheck not run.

Ten leftover keys were rewritten in `th` only after the first r2 pass, then re-checked. English was not edited. Analysis-job `วิเคราะห์` on `chart.analyzingChart`, `upload.installLocallyTooltip`, `encoding.followUpChartPlaceholder`, and knowledge distill/analysis was left as-is.

## r1 highs and mediums

| Key | Severity | Now |
|-----|----------|-----|
| `errors.fileParseError` | high | ไม่สามารถแปลงไฟล์ที่อัปโหลดได้. Parse, not วิเคราะห์. |
| `chart.emptyStateTitle` | high | เริ่มสำรวจข้อมูลได้เลย. No กันไหม. |
| `landing.demoBannerSuffix` | medium | `.` so concat with โปรดอ่าน plus คู่มือการติดตั้ง is a sentence. |
| `dataThread.emptySession` | medium | ถามเอเจนต์ด้านล่างให้โหลดข้อมูล เมื่อพร้อมจะแสดงที่นี่. |
| `chart.msgAuto` | medium | พิมพ์สิ่งที่ต้องการ เพื่อรับคำแนะนำแผนภูมิ. No สักอย่าง. |
| `workspace.errorOccurred` | medium | เกิดข้อผิดพลาด. App can append the refresh link. |
| `encoding.aggregate` | medium | รวมค่า. |
| `report.downloadAndShare` | medium | ดาวน์โหลดและแชร์. |
| `upload.errors.failedToParse` | medium | แปลง {{name}} ไม่สำเร็จ. `{{name}}` stays. |
| `refresh.errorParsePaste` | medium | แปลงเนื้อหาที่วางเป็น JSON หรือ CSV/TSV ไม่ได้. Pair Content/Url/File/Excel also แปลง. |
| `knowledge.replay` | medium | ทำซ้ำ. Tooltip/Busy/NoData/Started and replayPrompt also ทำซ้ำ. |

r1 lows that the fix already closed still hold: `auth.ssoErrorAccessDenied`, `encoding.tooltip` / `channelTooltip` คำแนะนำ, `dataThread.chartAlt` แผนภูมิ {{type}}, `model.apiBase` URL ฐาน API, `db.selectTableFromTree` รายการ, `chartRec.couldYouClarify` กรุณาชี้แจง, `chart.gallery.sectionLabels.stressTests` การทดสอบภาระ.

## A1-A7

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | Pass | String-leaf key set equals `en` for each of the 10 filenames. Vega locale arrays are not counted as string leaves. | Same 10 JSON names. All parse. String-leaf counts match file-for-file: `common` 952, `chart` 208, `encoding` 80, `messages` 79, `upload` 159, `model` 81, `dataLoading` 101, `loader` 84, `navigation` 14, `errors` 28. Structural `"key":` line counts match: `common` 993, `chart` 222, `encoding` 81, `messages` 84, `upload` 169, `model` 82, `dataLoading` 106, `loader` 99, `navigation` 15, `errors` 29. `chart.vegaLocale` `periods` / `days` / `shortDays` / `months` / `shortMonths` are arrays in both (not string leaves). Format strings `dateTime` / `date` / `time` are present. Thai day and month names are filled (วันอาทิตย์, มกราคม; shortDays อา. / ส.). | n/a |
| A2 | Pass | Polite professional Thai. กรุณา / โปรด. Thai script. Meaning matches the English job. No casual กันไหม / นะ / สักอย่าง as the main ask. | P0 uses กรุณา / โปรด: `errors.authExpired` กรุณาลงชื่อเข้าใช้อีกครั้ง, `model.pleaseSelectModel` กรุณาเลือกโมเดล, `landing.firstSelectModelPrefix` ก่อนอื่น โปรด, `chartRec.couldYouClarify` กรุณาชี้แจง, `chart.msgWarning` กรุณาตรวจสอบ. No กันไหม. No สักอย่าง. Remaining ไหม is the question particle on EN question CTAs (`encoding.getIdeasQuestion` ดูไอเดียไหม, `chart.orStartWithChartType` สร้างแผนภูมิใหม่ไหม), not the inclusive กันไหม ask. `chart.emptyStateTitle` is เริ่มสำรวจข้อมูลได้เลย. Parse family is แปลง. Aggregate is รวมค่า. Replay CTA is ทำซ้ำ. Thai script on P0 chrome. | n/a |
| A3 | Pass | Placeholders `{{name}}` / i18next plural suffixes / HTML tags such as `<refreshAction>` and `<strong>` match `en`. | Token names and counts match. Sampled: `{{count}}`, `{{name}}`, `{{table}}`, `{{message}}`, `{{type}}`, `{{count, number}}`, `{{sampleSize}}` / `{{totalSize}}`, `{{connector}}` / `{{tables}}` / `{{large}}`, `{{live}}`. Plural suffixes present on both: `textTurnEarlier_other`, `tablesAvailableToAgent_other`, `earlierTurns_other`, `columnCount_one` / `_other`, `dataLoading` `loadedCount_plural`, `previewColumns_plural`, `previewShowingRows_plural`, `failedSteps_plural`, `partialFailure_plural`. `appBar.errorOccurred` keeps `<refreshAction>…</refreshAction>`. `workspace.deleteConfirm` keeps `<strong>{{name}}</strong>` and `{{id}}`. Loader CLI spans keep `<user>` `<host>` `<port>` `<database>` `<name>` `<server>`. `dataLoading.chatHint` is `""` in both trees. | n/a |
| A4 | Pass | No leftover English stubs shipped as the translation. Allow Datly and brand tokens. mssql encrypt keep `(yes/no)`. Parse errors must not use วิเคราะห์. | P0 strings are Thai, not pasted English. Brands Datly, GitHub, Discord, Chartifact, Python, Azure, Vega-Lite, DuckDB, ECharts, Chart.js, LiteLLM stay. Connector tokens `BETWEEN` / `CONTAINS` kept. `chart.gallery.spec` สเปก. `knowledge.editDataMemory` stays `data-memory.md`. `upload.folderPathPlaceholder` stays the path token. `loader.mssql.encrypt` / `trust_server_certificate` keep `(yes/no)` because `mssql_data_loader.py` writes those literals into the ODBC string. Parse errors all แปลง, none วิเคราะห์: `errors.fileParseError`, `upload.errors.failedToParse` / `failedToParseExcel` / `unableToParseUrl`, `refresh.errorParsePaste` / `Content` / `Url` / `File` / `Excel`, `messages.agent.parseActionFailed`, `dataGrid.clipboardPasteFailed`, `report.couldNotParseSvg`. Analysis-job วิเคราะห์ left on `chart.analyzingChart`, `upload.installLocallyTooltip`, `encoding.followUpChartPlaceholder`, and knowledge distill/analysis. | n/a |
| A5 | Pass | P0 chrome is native: navigation, onboarding, CTAs, errors, empty states. | `navigation.*`: เริ่มสำรวจ, ติดตั้งในเครื่อง, ลองเดโมออนไลน์, วิดีโอ, ติดต่อเรา, ข้อกำหนดการใช้งาน, เกี่ยวกับ, หน้าแรก, ข้อมูล, ภาพข้อมูล, รายงาน, แชท, กฎของเอเจนต์. GitHub stays. `appBar.session` เซสชัน, `explore` สำรวจ, `reports` รายงาน, `data` ข้อมูล, `about` เกี่ยวกับ. `onboarding.languageTitle` เลือกภาษาของคุณ. `languageIntro` Datly จะใช้ภาษานี้ทั้งแอป เปลี่ยนทีหลังได้ในการตั้งค่า. `continue` ดำเนินการต่อ. Model wall `landing.firstSelectModelPrefix` ก่อนอื่น โปรด plus `model.selectModels` เลือกโมเดล / `pleaseSelectModel` กรุณาเลือกโมเดล. CTAs: บันทึก, ยกเลิก, ปิด, ลบ, ถัดไป, ดำเนินการต่อ, ลงชื่อเข้าใช้, โหลด, เชื่อมต่อ. `errors.*` native (ต้องยืนยันตัวตนก่อน, เซสชันหมดอายุแล้ว กรุณาลงชื่อเข้าใช้อีกครั้ง, ไม่มีสิทธิ์เข้าถึง, ไม่สามารถแปลงไฟล์ที่อัปโหลดได้). Empty: `dataThread.emptySessionTitle` ยังไม่มีข้อมูลที่นี่, `emptySession` ถามเอเจนต์ด้านล่าง…, `chart.emptyStateTitle` / `emptyStateSubtitle`, `session.noSavedSessions`, `sidebar.noSessions` / `emptyTree` / `emptyWorkspace`, `logs.empty`, `preview.noTablesToPreview`, `messages.noMessages` / `noData`, `chart.noChart`. | n/a |
| A6 | Pass | Product name stays Datly. Glossary-stable product nouns: session, workspace, chart, encoding, model, agent. No mix. | Datly appears in the same nine leaves as `en` (`app.name`, `app.loadingProduct`, `landing.modelTip`, `refresh.installLocallyForUpload`, `db.confirmDeleteTableLoaded`, `auth.loginTitle`, `onboarding.languageIntro`, `upload.installLocallyTooltip`, `loader.mssql.authInstructions`). session is เซสชัน (not เซสชั่น). chart is แผนภูมิ (not ชาร์ต). encoding is การเข้ารหัส. model is โมเดล (not แบบจำลอง). agent is เอเจนต์ (not ตัวแทน). workspace is พื้นที่ทำงาน on the main tree (`workspace.importZip`, `upload.upgrade.featureWorkspaces`, `dataLoading.loadPlan.loadInNewWorkspace` / `addToCurrent`, `sidebar.emptyWorkspace`). `loader.databricks.authInstructions` พื้นที่ทำงาน Databricks is the Databricks product workspace, not Datly workspace. Replay CTA and distill copy now share ทำซ้ำ. Aggregate shelf and large-table prompt now share รวมค่า. | n/a |
| A7 | Pass | No em dashes. Watch length on toolbar and buttons. | No `—` in `src/i18n/locales/th/*.json`. EN em dashes were recast as periods, spaces, or dropped (`chart.emptyStateSubtitle`, `errors.authExpired`, `dataLoading.stopped` is หยุดแล้ว). Short controls stay short: `session.resetButton` รีเซ็ต, `db.asc` / `desc` น้อยไปมาก / มากไปน้อย, `encoding.ascShort` ↑ น้อยไปมาก, `chart.addChart` เพิ่มแผนภูมิ, `onboarding.continue` ดำเนินการต่อ. Load-plan CTAs keep the workspace noun. | n/a |

## Rewritten keys (r2 leftover Fail, then re-check Pass)

| Key | Re-check problem | After rewrite |
|-----|------------------|---------------|
| `loader.mssql.encrypt` | r1 recast to (ใช่/ไม่). A4 and ODBC need the `yes/no` literals. | เปิดการเข้ารหัส (yes/no) |
| `loader.mssql.trust_server_certificate` | Pair of the row above. | เชื่อถือใบรับรองเซิร์ฟเวอร์ (yes/no) |
| `chart.gallery.entryLabels.echartsUniqueStress` | Section label was recast to ภาระ. Entry still said ความเครียด (psychological stress). | ECharts: ภาระเฉพาะ |
| `chart.gallery.entryLabels.echartsStressTests` | Same ความเครียด leak. | ECharts: ทดสอบภาระ |
| `chart.gallery.entryLabels.chartJsStressTests` | Same ความเครียด leak. | Chart.js: ทดสอบภาระ |
| `sidebar.largeTableChatPrompt` | encoding.aggregate is รวมค่า. Prompt still said รวมกลุ่ม (group, not aggregate). `{{connector}}` `{{tables}}` `{{large}}` kept. | …ชุดย่อยที่กรอง สุ่มตัวอย่าง หรือรวมค่า… |
| `knowledge.workflowsDescription` | Replay CTA is ทำซ้ำ. Distill body still said เล่นซ้ำ (media play). | …ให้เอเจนต์บันทึกและทำซ้ำได้ |
| `knowledge.distillHint` | Same เล่นซ้ำ leftover. วิเคราะห์ kept. | …บันทึกและทำซ้ำในเซสชันถัดไป |
| `knowledge.distillSessionHint` | Same เล่นซ้ำ leftover. วิเคราะห์ kept. | …ให้เอเจนต์ทำซ้ำได้ |
| `knowledge.workflowsHint` | Same เล่นซ้ำ leftover. วิเคราะห์ kept. | …แล้วทำซ้ำในบริบทใหม่ |

## Slice outcome

All seven listed checks Pass after the ten leftover rewrites. r1 highs `errors.fileParseError` and `chart.emptyStateTitle` are closed. L-th goal (native Thai P0 chrome, polite กรุณา / โปรด, parse as แปลง, placeholders intact, Datly kept, mssql `(yes/no)`) is met in source.

Not a fail here: `navigation.chat` แชท is the loanword. `app.info` ข้อมูล (not leftover Info). Gallery `treemap` / `sunburst` stay as ECharts type names in Thai transcription. Analysis-job วิเคราะห์ on chart insight, large-dataset unlock, follow-up analysis, and knowledge distill/analysis. `messages.redo` ทำซ้ำ is the undo/redo pair on a different surface from knowledge.replay.

Not exercised in this verify: live `changeLanguage('th')`, CTA clip at 960x640, or i18next interpolation at runtime.
