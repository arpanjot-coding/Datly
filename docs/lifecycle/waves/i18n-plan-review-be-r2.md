# Plan review r2 (be-expert) - F-i18n-W

Plan: `docs/lifecycle/work-packages/F-i18n-W.md`  
Reviewer: W6 [be-expert] round 2 (max 2). Plumbing + locale wire only. No UI look. No translations.

## Verdict

ok

## Still no must? Can plumbing ship as written?

Yes. No remaining must. `C-i18n-plumbing` can be implemented as written.

Round 1 detector must is closed. Place/grain, D-language-first, `C-i18n-plumbing`, and `C-picker-gate` now use a **pre-init** `i18nextLng` snapshot (or `caches: []` until Continue). New installs still see LanguageScreen after a post-init detector write. Returning users skip when the snapshot already has `i18nextLng`. Continue is the only write of `languageCompleted`. `src/i18n/index.ts` already inits from `src/index.tsx` before `AppFC`; `localePersist.ts` can read `localStorage['i18nextLng']` at module load, then `index.ts` can call `i18n.init`. `AppFC` must read that snapshot, not re-read `i18nextLng` after init.

Patched shoulds that stay closed:

- Empty `ja`/`ko`/`fr`/`de` trees: same 10 JSON filenames + barrel as `en`; `{}` or `{ "<top>": {} }`; omit keys; never copy English; never `""`.
- `returnEmptyString: false` next to `returnNull: false`.
- Do not extend `i18nLocales.test.ts` in plumbing. Six-locale parity stays `C-i18n-locale-tests`.
- Do not flatten or empty `zh/`.
- Each L-* depends on `C-picker-screen` so `onboarding.*` exists before writers match `en`.
- First-run cards intersect `AVAILABLE_LANGUAGES`. Allowlist length `<= 1` skips the picker.

SHAPE holds: six ids (`en`, `zh`, `ja`, `ko`, `fr`, `de`); keep i18next; widen `AVAILABLE_LANGUAGES` default once those ids are in `resources`; env still wins. Operator `AVAILABLE_LANGUAGES=en,zh` still yields two langs; `=zh` still hides the switcher.

Acceptance in `C-i18n-plumbing` is implementable against current code:

- `i18n.changeLanguage('ja')` is accepted after the four ids are in `resources` and `supportedLngs`.
- Missing `ja` string falls back to `en` (not `null`, not `""`, not the raw key) with `fallbackLng: 'en'`, `returnNull: false`, `returnEmptyString: false`, and omitted keys.
- `GET /api/app-config` with unset env returns the six ids if both `os.environ.get(..., 'en,zh')` sites (CLI_ARGS default and `run_app`) plus `dfSlice` initial `serverConfig` are widened. Env parse is unchanged.
- Detector may write `i18nextLng`; it does not write `languageCompleted`.
- Pre-init snapshot stays readable after init if captured before first detector cache write.
- Vega with no `chart.vegaLocale` object already keeps English time format in `src/i18n/vega-locale.ts` and does not throw.
- Existing en/zh key-alignment test still passes if plumbing does not empty `zh/` and does not extend that test.

## must

None.

## should

- **Set both `load: 'languageOnly'` and `nonExplicitSupportedLngs: true`.** The chunk still presents them as alternatives. `supportedLngs` of the six codes rejects navigator `ja-JP` and falls back to `en` unless non-explicit variants are allowed. `load: 'languageOnly'` only avoids a `ja-JP` bundle. Screen preselect can parse `navigator.language` itself; detector language will still land on `en` without both flags. Not a gate breaker.
- **Set `document.documentElement.lang` and `dir` on init, not only `languageChanged`.** First paint can otherwise stay `index.html` `lang="en"`. Same helper as the change listener is enough.
- **Third Python default.** Besides the two `os.environ.get(..., 'en,zh')` sites, `get_app_config` uses `args.get('available_languages', ['en', 'zh'])`. Update that fallback in the same chunk so an args miss cannot resurrect two langs. Normal Flask/Electron paths populate CLI_ARGS, so this is defensive.

## nit

- Prefer omitted `chart` over an empty parent in new trees. An empty `chart: {}` can block fallback of `chart.vegaLocale` as an object.
- Guard the snapshot helper when `localStorage` is missing (unit tests). Keep `export default i18n` from `src/i18n/index.ts`.
- Do not add a second locale-id persist key besides detector `i18nextLng`.
- Empty env `AVAILABLE_LANGUAGES=` still becomes `[]` and hides the switcher. Pre-existing. Do not "fix" it here.
- `collectKeys` still walks `vegaLocale` array indices. Skipping arrays stays optional until `C-i18n-locale-tests` if every locale keeps the same arrays.

## W2 / W4 unification

Unchanged and still correct. One plumbing chunk: register six ids in `resources`, widen the default to those six, leave new locale files empty until L-*. Advertise-with-files is the registered trees, not native copy.
