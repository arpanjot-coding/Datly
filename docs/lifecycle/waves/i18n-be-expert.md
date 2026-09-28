# BE-expert: F-i18n-picker plumbing + F-locales wire

Feature: F-i18n-picker (plumbing) and data/wire for F-locales.  
Session focus: desktop. Ship: web + desktop.  
Do not implement. Do not write translations. Do not design first-run visual.

## 1. Meaning

Wire i18next so the picker can switch among the listed locales, persist the choice, and show English for any missing key.

Out of scope: locale campaign copy (F-locales writers); first-run card UI; a second i18n npm stack; house 20-id table (`ar`, `nl`, …); store-listing strings.

## 2. Place / plug-in

No new route. Same init + server config + existing `changeLanguage` calls.

| Layer | Path | What to do |
|-------|------|------------|
| Init | `src/i18n/index.ts` | Keep i18next + `LanguageDetector` + `initReactI18next`. Register all listed locale ids in `resources`. Keep `fallbackLng: 'en'`. Detect `order: ['localStorage', 'navigator']`, `caches: ['localStorage']`. |
| Boot | `src/index.tsx` | Already `import './i18n'` before `AppFC`. Do not move. |
| Locale tables | `src/i18n/locales/` | Today only `en/` and `zh/` (11 JSON files each, merged in `index.ts` into one `translation` ns). Add `ja/`, `ko/`, `fr/`, `de/` with the same file set and barrel. Export from `locales/index.ts`. |
| Persist | i18next detector | Default localStorage key is `i18nextLng`. Do not invent a second locale-id store. First-run **completed** flag is a separate UI key (W3). Detector may preselect; it must not be treated as Phase 0 done. |
| Picker later | `src/app/App.tsx` | `LanguageSwitcher` and `LanguageMenuItems` already call `i18n.changeLanguage(lang)`. First-run Continue and Settings row must call the same API. |
| Vega | `src/i18n/vega-locale.ts` + `AppFC` | `languageChanged` already runs `syncVegaLocale()`. New locales need `chart.vegaLocale` or Vega keeps the English D3 time defaults. |
| Server list | `py-src/data_formulator/app.py` | Env `AVAILABLE_LANGUAGES` (default `en,zh` at lines 116 and 535) → `CLI_ARGS['available_languages']` → `GET /api/app-config` field `AVAILABLE_LANGUAGES`. |
| Client default | `src/app/dfSlice.tsx` | `serverConfig.AVAILABLE_LANGUAGES: ['en', 'zh']` until `/api/app-config` overwrites via `setServerConfig`. |
| Hide rule | `App.tsx` ~197, ~261 | Picker returns null if `availableLanguages.length <= 1`. Buttons are **only** `AVAILABLE_LANGUAGES`, not `LANGUAGE_LABELS`. |

Picker call path (already shipped):

```
user pick → i18n.changeLanguage(id)
  → LanguageDetector writes localStorage `i18nextLng`
  → `languageChanged` → syncVegaLocale()
  → `t()` re-renders
```

Keep this path. Do not add another npm i18n package.

## 3. Approach

Layers: resource registry → fallback → server list default → client default → picker already wired.

### Register ja / ko / fr / de

1. Clone the `en/` tree shape (`common`, `upload`, `chart`, `model`, `encoding`, `messages`, `navigation`, `dataLoading`, `loader`, `errors` + `index.ts` merge).
2. Export from `src/i18n/locales/index.ts` next to `en` and `zh`.
3. Add each id to `resources` in `src/i18n/index.ts` as `{ translation: <bundle> }`.
4. Do **not** paste English into those files as fake translations. Empty objects or omitted keys are fine; `fallbackLng: 'en'` fills them.
5. After F-locales, `tests/frontend/unit/app/i18nLocales.test.ts` should assert key parity for every listed locale, not only `zh`.

Optional init hardening (still i18next, no new dep):

- `fallbackLng: 'en'` (already set)
- `supportedLngs: ['en','zh','ja','ko','fr','de']` plus `nonExplicitSupportedLngs: true` (or `load: 'languageOnly'`) so `ja-JP` maps to `ja`
- `returnNull: false` so missing keys do not become `null`
- Do **not** set `supportedLngs` without registering those ids, or `changeLanguage('ja')` will be rejected

### Stop `AVAILABLE_LANGUAGES` hiding listed langs

The list in the UI is `LANGUAGE_LABELS` (`en`, `zh`, `ja`, `ko`, `fr`, `de`). The server default is `en,zh`. Until `/api/app-config` returns the six ids, the toolbar never shows ja/ko/fr/de.

Widen defaults in lockstep (additive, env still wins):

| Site | Today | Ship default |
|------|-------|--------------|
| `app.py` module `CLI_ARGS` | `'en,zh'` | `'en,zh,ja,ko,fr,de'` |
| `app.py` `run_app()` override | `'en,zh'` | same six |
| `dfSlice` initial `serverConfig` | `['en','zh']` | same six |
| `.env.template` comment | "Supported: en, zh" | list the six; keep override examples |

Operators who set `AVAILABLE_LANGUAGES=en,zh` still get two langs and a visible switcher. Single-lang (`AVAILABLE_LANGUAGES=zh`) still hides the switcher. Desktop is the same Flask process (`desktop.py` does not override this env).

Do not hardcode the picker to `LANGUAGE_LABELS` while ignoring the server. Keep one list: server/config is the runtime allowlist; the default of that allowlist must equal the in-app list.

### Missing key → English

Already the init contract (`fallbackLng: 'en'`). After `changeLanguage('ja')` with no ja string, `t('chart.delete')` resolves `en`. If English is also missing, i18next returns the key. Do not ship English stubs inside ja/ko/fr/de files.

`zh` already has a full tree; do not delete or flatten it.

## 4. Verdict draft: SHAPE

Fits the existing i18next stack. No user-visible breaking Python contract. Widen the **default** of `AVAILABLE_LANGUAGES`; do not rename the env or the `/api/app-config` field.

SHAPE, not FIT: resources and server default still say two langs while `LANGUAGE_LABELS` says six. ASK does not apply (no required breaking env change).

## 5. Risks / sacred contracts

- Keep a single `translation` namespace. `chart.*` and `encoding.*` are nested JSON keys, not extra i18next `ns` values. Do not split `useTranslation('chart')`.
- `syncVegaLocale` reads `i18n.t('chart.vegaLocale', { returnObjects: true })`. A locale without that object must fall back to English time format, not throw.
- `i18nLocales.test.ts` requires `zh` key set == `en`. New locale files must not break that test. Empty ja trees are OK until the campaign extends the test.
- Many unit tests mock `react-i18next` or `src/i18n`. Do not change the default export shape of `src/i18n/index.ts`.
- `serverConfig` is not persisted (`store.ts` blacklist). Locale must stay in `i18nextLng`, not Redux.
- Do not treat `i18nextLng` as first-run completed (W3 owns `languageCompleted`).
- Do not add an i18n npm package.
- RTL (`html dir`) only required if `ar` is on the list. It is not. Still safe to set `document.documentElement.lang` (and `dir` from i18n) on `languageChanged`.
- HMR note in `index.ts`: new keys need a full reload. Same for new resource ids.

## 6. Suggested chunks (ids only)

- C-i18n-resources
- C-i18n-fallback
- C-i18n-available-langs
- C-i18n-persist
- C-i18n-locale-tests

## 7. Locale id list (the list)

**`en`, `zh`, `ja`, `ko`, `fr`, `de`**

| Evidence | Ids |
|----------|-----|
| `src/app/App.tsx` `LANGUAGE_LABELS` | en, zh, ja, ko, fr, de |
| `src/i18n/index.ts` `resources` | en, zh only |
| `src/i18n/locales/` trees | `en/`, `zh/` only |
| `dfSlice` + `app.py` + `.env.template` default | en, zh |
| House 20-id table in cross-cutting.md | not the in-app list this turn |

No `ar` on this list. No RTL campaign this turn.
