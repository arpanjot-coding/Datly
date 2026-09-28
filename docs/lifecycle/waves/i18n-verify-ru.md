# Independent verify: L-ru

Slice: `L-ru`  
Verifier did not write `ru`. Static read of `src/i18n/locales/ru/*.json` against English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

Scope: P0 (nav, onboarding, CTAs, errors, empty) plus a sample of the rest.

Checks: meaning match; вы register; Cyrillic; native button/title/error phrasing; placeholders intact; no leftover English stubs (Datly OK).

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `appBar.explore` | high | P0 nav. Job is Explore. "Обзор" is overview. The same English key is already "Исследовать" on `chartRec.explore`. | Исследовать |
| `report.backToExplore` | high | Pair of the row above. "вернуться к обзору" follows the wrong noun. | вернуться к исследованию |
| `model.selectModels` | high | First-run wall composes `landing.firstSelectModelPrefix` + this label as "Сначала Выбор моделей". Noun after the adverb is not spoken Russian. Other locales used a verb. | выберите модели |
| `auth.migration.description` | high | Grammar is broken. "У вас есть рабочих областей с данными: {{count}}" puts genitive after есть without the numeral. Placeholder `{{count}}` stays. | Вы раньше работали анонимно. У вас есть {{count}} рабочих областей с данными. Импортировать их в учётную запись? |
| `landing.tagline` | medium | Calque of "See the story in your tables." "история" also reads as history. | Увидьте, что рассказывают ваши таблицы. |
| `dataThread.emptySession` | medium | Empty body says "их загрузить" with no noun on this line. Title sits apart, so the object is easy to miss. | Попросите агента ниже загрузить данные. Они появятся здесь, когда будут готовы. |
| `upload.folderPathPlaceholder` | medium | Leftover English path stub. | /путь/к/вашей/папке/с/данными |
| `dataThread.tablesAvailableToAgent_other` | medium | Counts 2-4 hit `_other` and read "2 таблиц". Key parity with en blocks `_few`. Same family: `dataThread.earlierTurns_other`, `dataGrid.columnCount_other`. | Таблиц доступно агенту: {{count}} |
| `encoding.stack` | medium | "Стопка" is a pile. The control is Vega stack (accumulate series). | Накопление |
| `upload.watchMode` / `db.watchMode` | medium | "Режим слежения" sounds like surveillance. The control auto-refreshes data. | Автообновление |
| `loader.mssql.encrypt` / `trust_server_certificate` | medium | Hint says (да/нет). `mssql_data_loader.py` writes the field into the ODBC string and expects yes/no. | Включить шифрование (yes/no) / Доверять сертификату сервера (yes/no) |
| `messages.confirmDelete` | medium | Confirm copy is clipped to a button. English asks if the user is sure. | Удалить этот объект? |
| `loader.local_folder.authInstructions` | low | Points at **Обзор**, but the control on that form is `upload.selectFolder` "Выбрать папку". Field placeholders and code spans stay. | Нажмите **Выбрать папку**, чтобы указать каталог, или вставьте путь. |
| `chart.vegaLocale.periods` | low | Leftover English AM/PM. Date/time already uses 24-hour `%H:%M:%S`. | дп / пп |
| `dataLoading.sectionTry` | low | Chip for "Try a task" is stiff. | Попробовать |

## What passed

- Onboarding: `onboarding.languageTitle` / `languageIntro` / `continue` are вы ("Выберите язык", "Продолжить"). Datly kept. Settings path is named.
- Nav: `navigation.home|data|visualization|report|chat` are Russian labels, not English stubs. GitHub stays.
- Core CTAs: Сохранить, Отмена, Закрыть, Удалить, Далее, Продолжить, Войти, Загрузить match Russian UI infinitives. `app.duplicate` is Дублировать, not a copy of Копировать. `dataLoading.loadPlan.loadInNewWorkspace` keeps "в новую рабочую область". Formulate family is one verb: Подготовить.
- Errors: `errors.*` reads as Russian failure copy (Требуется вход, Сеанс истёк. Войдите снова, Доступ запрещён). No leftover EN em dash.
- Empty: `emptySessionTitle`, `messages.noMessages`, `chatDialog.noHistory`, `sidebar.noSessions`, `knowledge.noItems`, `preview.noTablesToPreview`, `chart.noChart` / `emptyStateTitle` are native.
- Register: no ты / тебя / твой / хочешь. Addressed copy uses вы / ваш / Выберите / Попросите / хотите.
- Script: Cyrillic throughout P0. ё present where required (отчёт, истёк, ещё, её).
- Placeholders: `{{name}}` / `{{count}}` / `{{count, number}}` / `_one` `_other` `_plural` / `<refreshAction>` / `<strong>` / loader `<user>` `<host>` `<port>` `<database>` match en. Datly untranslated.

## Slice outcome

P0 chrome is mostly native вы Russian. Fail rewrite on `appBar.explore` (and `report.backToExplore`), `model.selectModels`, and `auth.migration.description`. Remaining table rows are polish, not a tree rewrite.

Not a fail here: product nouns (Datly, GitHub, Discord, Chartifact, Python, Azure, Vega-Lite, DataFrame, BETWEEN, CONTAINS, Spec) and command tokens (`pip`, `az login`, yes/no on the MSSQL hint after the rewrite above).

Not exercised in this verify: live Русский switch, CTA clip at 960×640, or i18next interpolation at runtime.
