# Independent verify: C-i18n-plumbing

Slice: `C-i18n-plumbing` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write the slice. Static read of delivered files only. Tests not executed.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | Pass | Matches. `ja`/`ko`/`fr`/`de` are in `resources` and `supportedLngs`. `changeLanguage('ja')` is a listed code. | `src/i18n/index.ts`: `LISTED_LANGUAGES` is `en zh ja ko fr de`; `resources` has all six `{ translation }`; `supportedLngs: [...LISTED_LANGUAGES]`; `load: 'languageOnly'`. Locales barrel `src/i18n/locales/index.ts` re-exports six. W6-be-r2 should to also set `nonExplicitSupportedLngs: true` is still open (`ja-JP` detector guess can land on `en`). Not a chunk fail: plan text is `load` **or** that flag, and A1 is explicit `changeLanguage('ja')`. | n/a |
| A2 | Pass | Matches. New trees are empty objects, not English and not `""`. | All 10 JSON names per locale (`common` `upload` `chart` `model` `encoding` `messages` `navigation` `dataLoading` `loader` `errors`) under `src/i18n/locales/{ja,ko,fr,de}/` are a single `{}`. Barrels match `en/index.ts` (same 10 imports + spread). Merge of `{}` omits keys (no empty `chart: {}` parent that would block `chart.vegaLocale` fallback). | n/a |
| A3 | Pass | Matches. `zh/` not flattened or emptied. | `src/i18n/locales/zh/` still has the same 10 JSON files plus `index.ts`. `zh/common.json` and `zh/chart.json` still hold Simplified Chinese leaves (example: `app.loading` 加载中..., `chart.vegaLocale` months). | n/a |
| A4 | Pass | Matches. Plumbing must not extend six-locale parity. | `tests/frontend/unit/app/i18nLocales.test.ts` still imports only `en` and `zh` and has one test: `collectKeys(zh)` equals `collectKeys(en)`. No `ja`/`ko`/`fr`/`de` imports. | n/a |
| A5 | Pass | Matches. | `src/i18n/index.ts` init: `fallbackLng: 'en'`, `returnNull: false`, `returnEmptyString: false`. | n/a |
| A6 | Pass | Matches. Pre-init snapshot is a module-load const, imported before `i18n.init`. | `src/i18n/localePersist.ts` line 24: `export const preInitI18nextLng = readStorage(I18N_LNG_KEY)` at load. `src/i18n/index.ts` first import is `./localePersist`; `i18n.init(...)` is in the module body after all imports. ESM evaluates that first import before the body, so the snapshot is taken before detector `caches: ['localStorage']`. Re-exported from `index.ts` after init as the same const. `src/index.tsx` still side-imports `./i18n` first among app modules. | n/a |
| A7 | Pass | Matches. Separate persist key. Detector cache is still `i18nextLng` only. | `LANGUAGE_COMPLETED_KEY = 'datly.languageCompleted'` vs `I18N_LNG_KEY = 'i18nextLng'`. `getLanguageCompleted` / `setLanguageCompleted` are the only writers of the completed flag. Detector config is `order: ['localStorage', 'navigator']`, `caches: ['localStorage']` (i18next default key `i18nextLng`). No detector option points at `datly.languageCompleted`. | n/a |
| A8 | Pass | Matches. `lang` and `dir` on `languageChanged`. Also applied after init (W6-be-r2 should). | `applyDocumentLang` sets `document.documentElement.lang` (base tag) and `document.documentElement.dir = i18n.dir(lang)`. Bound on `i18n.on('languageChanged', ...)`. Also called from `i18n.init(...).then(...)`. | n/a |
| A9 | Pass | Matches. Six-id default at both env parse sites, `get_app_config` fallback, `dfSlice`, template comment. Env still wins. | `py-src/data_formulator/app.py` `CLI_ARGS` (line 116) and `run_app` (line 535): `os.environ.get('AVAILABLE_LANGUAGES', 'en,zh,ja,ko,fr,de')`. `get_app_config` (line 382): `args.get('available_languages', ['en', 'zh', 'ja', 'ko', 'fr', 'de'])`. `src/app/dfSlice.tsx` initial `serverConfig.AVAILABLE_LANGUAGES`: `['en', 'zh', 'ja', 'ko', 'fr', 'de']`. `.env.template` lines 51-56: default comment `en,zh,ja,ko,fr,de`; examples still show operator `zh` and `en,zh`. | n/a |
| A10 | Pass | Matches. Default export remains the i18n instance. | `src/i18n/index.ts` ends with `export default i18n`. Callers (`src/app/dfSlice.tsx`, `src/app/utils.tsx`, `src/i18n/vega-locale.ts`, others) still `import i18n from '../i18n'` / `'./index'`. | n/a |

## Slice outcome

All ten listed checks Pass. Chunk goal (register empty trees, widen allowlist default, persist snapshot helper, keep en/zh contract) is met in source.

Open should (not a fail here): add `nonExplicitSupportedLngs: true` next to `load: 'languageOnly'` so a navigator `ja-JP` is treated as `ja` instead of falling through to `en`.

Not exercised in this verify: live `changeLanguage('ja')`, `GET /api/app-config` with unset env, or `i18nLocales.test.ts` run.
