# Independent verify: L-th

Slice: `L-th` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `src/i18n/locales/th/`. Static read of `src/i18n/locales/th/*.json` against English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

Scope: P0 (nav, onboarding, CTAs, errors, empty) plus a sample of the rest.

Checks: meaning match; Thai script; polite professional register (กรุณา / โปรด, no casual กันไหม / นะ); native button/title/error phrasing; placeholders intact; no leftover English stubs (Datly OK).

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `errors.fileParseError` | high | P0 error uses วิเคราะห์ (analyze). English job is parse the uploaded file. Same stem on upload/refresh parse errors. | ไม่สามารถแปลงไฟล์ที่อัปโหลดได้ |
| `chart.emptyStateTitle` | high | P0 empty heading is กันไหม, casual inclusive. Register is polite. | เริ่มสำรวจข้อมูลได้เลย |
| `landing.demoBannerSuffix` | medium | Concat with body โปรดอ่าน plus CTA คู่มือการติดตั้ง yields โปรดอ่าน คู่มือการติดตั้ง ได้. ได้ after the noun is not a sentence. | . |
| `dataThread.emptySession` | medium | P0 empty body says พิมพ์ด้านล่างเพื่อให้เอเจนต์โหลด. English job is ask the agent below to load data. | ถามเอเจนต์ด้านล่างให้โหลดข้อมูล เมื่อพร้อมจะแสดงที่นี่ |
| `chart.msgAuto` | medium | P0 empty prompt is สักอย่าง, casual filler, not a polite ask. | พิมพ์สิ่งที่ต้องการ เพื่อรับคำแนะนำแผนภูมิ |
| `workspace.errorOccurred` | medium | Prefix is เกิดข้อผิดพลาด กรุณา. App then appends the refresh link and a hardcoded `. `. Reads as กรุณา รีเฟรชเซสชัน. which a speaker would not put on an error line. | เกิดข้อผิดพลาด |
| `encoding.aggregate` | medium | รวมกลุ่ม is group, not aggregate (sum / avg / count on the encoding shelf). | รวมค่า |
| `report.downloadAndShare` | medium | แล้ว is then / already. English job is Download and share as two peer actions. | ดาวน์โหลดและแชร์ |
| `upload.errors.failedToParse` | medium | Same parse-as-analyze leak on the upload toast. `{{name}}` stays. | แปลง {{name}} ไม่สำเร็จ |
| `refresh.errorParsePaste` | medium | Same วิเคราะห์ on a paste error. Pair: errorParseContent, errorParseUrl, errorParseFile, errorParseExcel. | แปลงเนื้อหาที่วางเป็น JSON หรือ CSV/TSV ไม่ได้ |
| `knowledge.replay` | medium | เล่นซ้ำ is media play. English job is replay this analysis on current data. | ทำซ้ำ |
| `auth.ssoErrorAccessDenied` | low | อนุญาต is permission allow. English is authorization cancelled. | การยืนยันตัวตนถูกยกเลิก หากต้องการใช้ SSO กรุณาลงชื่อเข้าใช้อีกครั้ง |
| `encoding.tooltip` | low | ทูลทิป is leftover English on the encoding shelf. Same on `encoding.channelTooltip`. | คำแนะนำ |
| `loader.mssql.encrypt` | low | leftover English yes/no on a field hint. Same on `trust_server_certificate`. | เปิดการเข้ารหัส (ใช่/ไม่) |
| `dataThread.chartAlt` | low | Missing space so Latin `{{type}}` glues to แผนภูมิ. | แผนภูมิ {{type}} |
| `model.apiBase` | low | ฐาน API is a calque of API Base. Field is the base URL. | URL ฐาน API |
| `db.selectTableFromTree` | low | ต้นไม้ is the English widget name, not what someone taps. | เลือกตารางจากรายการเพื่อดูตัวอย่าง |
| `chartRec.couldYouClarify` | low | ได้ไหม is casual on a clarify title. Nearby CTAs already use กรุณา. | กรุณาชี้แจง |
| `chart.gallery.sectionLabels.stressTests` | low | ความเครียด is psychological stress, not load tests. | การทดสอบภาระ |

## What passed

- Onboarding: `onboarding.languageTitle` เลือกภาษาของคุณ, `languageIntro` (Datly kept, Settings is การตั้งค่า), `continue` ดำเนินการต่อ. Model wall `landing.firstSelectModelPrefix` ก่อนอื่น โปรด plus `model.selectModels` เลือกโมเดล / `pleaseSelectModel` กรุณาเลือกโมเดล.
- Nav: `navigation.*` and `appBar.session|explore|reports|data|about` are Thai labels, not English stubs. Brands GitHub / Datly stay.
- Core CTAs: บันทึก, ยกเลิก, ปิด, ลบ, ถัดไป, ดำเนินการต่อ, ลงชื่อเข้าใช้, โหลด, เชื่อมต่อ.
- Errors: rest of `errors.*` is Thai failure copy with กรุณา where English uses please (เซสชันหมดอายุแล้ว กรุณาลงชื่อเข้าใช้อีกครั้ง, ไม่มีสิทธิ์เข้าถึง).
- Empty: `emptySessionTitle`, `messages.noMessages`, `session.noSavedSessions`, `sidebar.noSessions` / `emptyTree` / `emptyWorkspace`, `logs.empty`, `preview.noTablesToPreview`, `chart.noChart`.
- Script: Thai throughout P0. Vega `chart.vegaLocale` is Thai (วันอาทิตย์, มกราคม, ก่อนเที่ยง).
- Placeholders: `{{name}}` / `{{count}}` / `{{count, number}}` / `_one` `_other` `_plural` / `<refreshAction>` / `<strong>` / loader `<user>` `<host>` `<port>` `<database>` match en. `dataLoading.chatHint` is `""` in both trees.
- No em dashes in `th/*.json`. No pasted English sentences on nav, onboarding, or empty titles. Datly, GitHub, Discord, Chartifact, Python, pip, CSV, BETWEEN, CONTAINS kept on purpose.

## Slice outcome

Fail. P0 chrome is mostly native polite Thai with placeholders intact. Fail rewrite on `errors.fileParseError` and `chart.emptyStateTitle`. Remaining table rows are polish, not a tree rewrite. Recast parse as แปลง / อ่าน, not วิเคราะห์.

Not a fail here: product nouns (Datly, GitHub, Discord, DuckDB, Vega-Lite, Chart.js, ECharts) and command tokens (`pip`, `az login`, `yes/no` literals that `mssql_data_loader.py` writes into ODBC, except the two encrypt hints above).

Not exercised in this verify: live `changeLanguage('th')`, CTA clip at 960x640, or i18next interpolation at runtime.
