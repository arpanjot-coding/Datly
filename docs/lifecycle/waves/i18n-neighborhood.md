# i18n neighborhood (desktop session)

Inventory for F-i18n-picker + F-locales. Do not treat this as an implementation plan.

## 1. Locale SSOT (ids)

There is no single SSOT. Four lists, plus a fifth agent-prompt table.

| Source | Path | Exact ids |
|--------|------|-----------|
| In-app labels | `src/app/App.tsx` `LANGUAGE_LABELS` | `en`, `zh`, `ja`, `ko`, `fr`, `de` |
| i18next resources | `src/i18n/index.ts` `resources` | `en`, `zh` only |
| Locale dirs | `src/i18n/locales/` | `en/`, `zh/` |
| FE default list | `src/app/dfSlice.tsx` `serverConfig.AVAILABLE_LANGUAGES` | `['en', 'zh']` until `/api/app-config` |
| Server list | `py-src/data_formulator/app.py` `available_languages` | `os.environ.get('AVAILABLE_LANGUAGES', 'en,zh')` split, stripped |
| Env default | `.env` / `.env.template` (commented) | default `en,zh`; comments say supported `en, zh` |
| Agent prompt names | `py-src/data_formulator/agents/agent_language.py` `LANGUAGE_DISPLAY_NAMES` | 20 codes: `en zh ja ko fr de es pt ru ar hi th vi it nl pl tr id ms sv` |

Ask A1 holds: the in-app list for a locale campaign is `LANGUAGE_LABELS` (6 ids), not the 20-id agent table.

Switcher renders `serverConfig.AVAILABLE_LANGUAGES`, labels from `LANGUAGE_LABELS[lang] || lang.toUpperCase()`. Hidden when list is missing or `length <= 1`.

## 2. Files / namespaces / key counts

i18next uses **one** namespace: `translation`. JSON files are source modules, then spread into one object.

| File | Role (top-level key) |
|------|----------------------|
| `common.json` | many: `app`, `appBar`, `logs`, `session`, `config`, `landing`, `about`, `footer`, `agentRules`, `refresh`, `report`, `db`, `connectorPreview`, `canvas`, `dataThread`, **`dataLoading` (overwritten)**, `preview`, `conceptShelf`, `chartRec`, `dataGrid`, `chatDialog`, `dataView`, `auth`, `superset*`, `workspace`, `tableSelection`, `interaction`, `concepts`, `dataframe`, `editor`, `sidebar`, `knowledge` |
| `upload.json` | `upload` |
| `chart.json` | `chart` (includes `chart.vegaLocale`) |
| `model.json` | `model` |
| `encoding.json` | `encoding` |
| `messages.json` | `messages` |
| `navigation.json` | `navigation` |
| `dataLoading.json` | `dataLoading` (wins over `common.json` `dataLoading` because spread is later) |
| `loader.json` | `loader` |
| `errors.json` | `errors` |

Merge order (`en/index.ts` and `zh/index.ts` identical): common, upload, chart, model, encoding, messages, navigation, dataLoading, loader, errors.

| Locale | Dirs | JSON files | Index |
|--------|------|------------|-------|
| `en` | present | 10 files above | `locales/en/index.ts` |
| `zh` | present | same 10 names | `locales/zh/index.ts` |
| `ja` `ko` `fr` `de` | **missing** | none | none |

Line counts match for the two large files: `common.json` 1023 lines en and zh; `chart.json` 233 lines en and zh.

String-leaf grep counts (en; object keys with string values, not array items):

| File | en string leaves (grep) |
|------|-------------------------|
| encoding.json | 80 |
| upload.json | 159 |
| model.json | 81 |
| messages.json | 79 |
| dataLoading.json | 101 |
| navigation.json | 14 |
| loader.json | 84 |
| errors.json | 28 |
| common.json | 199+ (grep cap; file is 1023 lines) |
| chart.json | 199+ (grep cap; file is 233 lines) |

`tests/frontend/unit/app/i18nLocales.test.ts` requires `collectKeys(zh) === collectKeys(en)` after merge (string leaves only; Vega locale arrays are not counted). Treat **en vs zh keys as contractually equal**; do not ship a zh file that drops keys.

Vega: `src/i18n/vega-locale.ts` reads `chart.vegaLocale`. zh date/time/months are localized; en uses English month/day names.

## 3. Switch + persist

| Step | Behavior |
|------|----------|
| Init | `src/index.tsx` imports `./i18n`. `i18n.use(LanguageDetector).use(initReactI18next).init(...)` |
| Resources | `{ en: { translation: en }, zh: { translation: zh } }` |
| Fallback | `fallbackLng: 'en'` |
| Detector order | `['localStorage', 'navigator']` |
| Detector cache | `caches: ['localStorage']` |
| localStorage key | detector default `i18nextLng` (not customized in app) |
| Switch (wide toolbar) | `LanguageSwitcher`: `i18n.changeLanguage(value)` |
| Switch (compact) | `LanguageMenuItems` inside `ToolbarOverflowMenu` (`showLanguages` default true) |
| Hide | `availableLanguages.length <= 1` |
| Current code | `i18n.language.split('-')[0]` |
| Vega | `AppFC` `useEffect`: `syncVegaLocale()` + `i18n.on('languageChanged', ...)` |
| Agents | `fetchWithIdentity` sets `Accept-Language: getAgentLanguage()` (`src/app/utils.tsx`). Server `_get_ui_lang()` in `routes/agents.py` |
| `html lang` | `index.html` and `electron/loading.html` hardcoded `lang="en"`. Never updated |
| `document.title` | always `toolName` `"Datly"` |
| `supportedLngs` | **not set** (navigator can select `ja` with no bundle) |
| Redux | language is **not** in persisted store; only server list is |

No CLI flag for languages; env only, copied into `CLI_ARGS` at Flask start and again in `run_app`.

## 4. First-run

| Gate | Exists? | Notes |
|------|---------|--------|
| Language-first overlay | **No** | Cold start uses detector (localStorage then browser) |
| Model wall | **Yes** | `DataFormulator.tsx`: if `selectedModelId == undefined`, blur overlay + `t('landing.firstSelectModelPrefix')` + inline `ModelSelectionButton` + `t('landing.modelTip')` |
| Model persist | `localStorage` `df_selected_model` (`dfSlice.selectModel`) | Independent of locale |
| SSO import | `IdentityMigrationDialog` | After auth identity change; uses `t()`; not language |
| Desktop splash | `electron/loading.html` | English `"Loading Datly..."`; `lang="en"` |
| Workspace landing | After model, workspace picker / session | Not language |

Language-first does not exist. Model wall should stay; picker should sit **before** it on first open if that is the product choice (SHAPE).

## 5. Settings vs toolbar (later change path)

`ConfigDialog` in `App.tsx` (`t('app.settings')`): color theme, chart size, local row limit, stretch, formulate timeout. **No language row.**

| Surface | Language UI today |
|---------|-------------------|
| App bar wide | `LanguageSwitcher` toggle (app + about) |
| App bar compact | overflow `LanguageMenuItems` (default on) |
| Settings dialog | none (best later plug-in: frontend section, first control) |
| First-run | none |

Toolbar is the only later path now. Settings is empty for language; adding a row does not conflict with existing fields.

## 6. RTL

| Check | Result |
|-------|--------|
| `dir="rtl"` on html/body | No |
| `document.dir` / `i18n.dir()` | Not used |
| CSS `direction: rtl` | Layout only: `DataThread.tsx` thread scroller; `VisualizationView.scss` (thumbnail column). Not i18n RTL |
| Agent table `ar` | Prompt names only; no UI locale |

No RTL plumbing. Listed picker langs (`en zh ja ko fr de`) are all LTR.

## 7. Risks

| Risk | Why |
|------|-----|
| Env default hides extra langs | Default `en,zh`. Adding `ja` files does nothing in the switcher until `AVAILABLE_LANGUAGES` includes them. `AVAILABLE_LANGUAGES=zh` hides switcher entirely |
| Empty env | `AVAILABLE_LANGUAGES=` (set empty) does not fall back; list becomes `[]`; switcher hidden |
| Labels without files | `ja ko fr de` in `LANGUAGE_LABELS`. If env is `en,zh,ja`, toggle shows 日本語 but `changeLanguage('ja')` has no bundle; UI falls back to English keys |
| Detector vs list | Navigator `ja-JP` can set `i18n.language` to `ja` even when list is `en,zh` |
| Agent 20 vs UI 6 | Agents can prompt in `es`/`ar`/… if header is that code; UI cannot |
| English leftover in zh | Mostly translated. Leftovers: brands (`Datly`, `Chartifact`, `GitHub`, `Python`, `Vega-Lite`, `ECharts`, connector names), loanwords (`Agent`, `Data Threads` in `about.feature3Description`), `editDataMemory: "data-memory.md"` |
| Hardcoded EN chrome (P0 sample) | `toolName` / titles; `index.html` noscript + description; desktop splash; `CatalogTree` / `VirtualizedCatalogTree` `"Loading…"`; palette names in Settings; many `t(key, { defaultValue: 'English' })` (logs, workspace exit, data-loading canvas, connector preview); `html lang="en"` |
| Merge overwrite | `common.json` `dataLoading` is replaced by `dataLoading.json` |
| HMR | `src/i18n/index.ts` notes locale JSON needs full reload |

## 8. Reuse (must keep) vs sacred contracts

**Must keep (reuse):**

- i18next + `initReactI18next` + `i18next-browser-languagedetector` (`src/i18n/index.ts`)
- Locale JSON files + merge `index.ts` (not a new `t()` stack)
- `syncVegaLocale` / `chart.vegaLocale`
- `LANGUAGE_LABELS` + `LanguageSwitcher` + `LanguageMenuItems`
- `serverConfig.AVAILABLE_LANGUAGES` from `/api/app-config`
- `getAgentLanguage` + `Accept-Language` on `/api/` fetches
- `tests/frontend/unit/app/i18nLocales.test.ts` key-alignment
- Model wall in `DataFormulator.tsx` (do not delete for language-first)

**Sacred contracts:**

- Env `AVAILABLE_LANGUAGES` comma list; default `'en,zh'`
- `GET /api/app-config` field `AVAILABLE_LANGUAGES`
- Switcher hidden when `length <= 1`
- Persist key `i18nextLng` (detector default)
- `fallbackLng: 'en'`
- Agent language from `Accept-Language` primary subtag
- en key tree is meaning SSOT; zh keys must stay aligned
- `df_selected_model` is model, not locale

**Do not treat as UI SSOT:** `LANGUAGE_DISPLAY_NAMES` (20 ids, prompt-only).
