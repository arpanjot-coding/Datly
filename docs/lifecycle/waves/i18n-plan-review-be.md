# Plan review (be-expert) - F-i18n-W

Plan: `docs/lifecycle/work-packages/F-i18n-W.md`  
Reviewer: W6 [be-expert]. Plumbing + locale wire only. No UI look. No translations.

## Verdict

must-fix

## Ships plumbing without wrecking neighbors?

Mostly, except the persist gate.

- `GET /api/app-config` keeps field `AVAILABLE_LANGUAGES`. Only the unset-env default string changes (`en,zh` to `en,zh,ja,ko,fr,de`) in `app.py` CLI_ARGS and `run_app()`, plus `dfSlice` initial `serverConfig`. Env parse (comma split, strip, drop empties) is unchanged. Operator `AVAILABLE_LANGUAGES=en,zh` still returns two ids; `=zh` still returns one. Hide rule `length <= 1` is unchanged, so that operator still hides the switcher.
- `tests/frontend/unit/app/i18nLocales.test.ts` stays en vs zh string-leaf equality during plumbing. Empty `ja/ko/fr/de` trees do not enter that test until `C-i18n-locale-tests` after L-*. `C-picker-screen` adds `onboarding.*` to both `en` and `zh`, so the existing test stays green.
- i18next stays the only stack. One `translation` namespace. `fallbackLng: 'en'`. Vega `syncVegaLocale` already no-throws when `chart.vegaLocale` is missing (non-object or no `months` uses `D3_DEFAULT_TIME`).
- **W2 vs W4 is unified in `C-i18n-plumbing`.** Register the six resource trees, then widen the default. Empty objects / omitted keys until L-* writers. That is W2 "do not advertise without files" (trees exist and are in `resources`) plus W4 "widen default now". Do not paste English into `ja/ko/fr/de`.
- **Init options in the chunk:** `supportedLngs` to the six, `returnNull: false`, `fallbackLng: 'en'`, `document.documentElement.lang` and `dir` from `i18n.dir()` on `languageChanged`. Vega no-throw is already true in `src/i18n/vega-locale.ts`. See should on `load: 'languageOnly'` vs `nonExplicitSupportedLngs`.

The detector vs `languageCompleted` contract cannot ship as written (must below).

## must

1. **New-install snapshot vs detector cache.** `C-i18n-plumbing` keeps detector `caches: ['localStorage']` and says the detector may write `i18nextLng` but must not write `languageCompleted`. `src/i18n/index.ts` inits from `src/index.tsx` before `AppFC`. On a brand-new profile the detector will persist a navigator guess, then `C-picker-gate` / the Place flow (`no languageCompleted AND no existing i18nextLng`) will treat that write as a returning user and skip LanguageScreen. That breaks D-language-first, house law (detector must not complete the gate), and the plumbing line that a guess is only a preselect. Returning-user skip when `i18nextLng` was already in storage *before* init remains correct.

## should

- **Empty trees, not English clones.** "Clone `en` file set" means filenames + barrel only. Each JSON `{}` or `{ "<top>": {} }`, keys omitted. Never copy `en` strings. Never `""` (i18next renders blank, not English). Set `returnEmptyString: false` next to `returnNull: false`.
- **`supportedLngs` needs `nonExplicitSupportedLngs: true`.** `load: 'languageOnly'` is not a substitute. With `supportedLngs` of the six codes, navigator `ja-JP` is rejected and falls back to `en` unless non-explicit variants are allowed. Set both: `supportedLngs` plus `nonExplicitSupportedLngs: true`, and `load: 'languageOnly'` so no `ja-JP` bundle is required.
- **Allowlist stays the server list.** Resources register all six. Runtime advertise/hide is `AVAILABLE_LANGUAGES` from `/api/app-config`. First-run cards should intersect that list (same as Settings and the toolbar). `AVAILABLE_LANGUAGES=zh` must not grow a six-id picker. Do not unregister resources when the env is narrower.
- **Do not extend `i18nLocales.test.ts` in plumbing.** Empty ja trees cannot equal `collectKeys(en)`. Keep today’s en/zh test until `C-i18n-locale-tests`.
- **L-* after onboarding keys.** `onboarding.*` lands in `en`/`zh` in `C-picker-screen`. Locale writers who match `en` too early miss those keys. Follow the impl-order sentence, or add `C-picker-screen` to each L-* Depends.
- **zh stays a full tree.** Plumbing must not flatten or empty `zh/`. New zh onboarding strings should be real Chinese, not English pasted for parity.
- **Set `lang`/`dir` on init, not only `languageChanged`.** First paint can otherwise stay `index.html` `lang="en"`. Same helper as the change listener is enough.
- **Third Python default.** Besides the two `os.environ.get(..., 'en,zh')` sites, `get_app_config` uses `args.get('available_languages', ['en', 'zh'])`. Update that fallback in the same chunk so an args miss cannot resurrect two langs.

## nit

- `vega-locale.ts` already returns English time format when the object has no `months`. No required edit. Empty ja plus `fallbackLng` still yields English `chart.vegaLocale` unless a parent `chart: {}` blocks fallback; prefer omitted `chart` over an empty parent.
- `collectKeys` already walks `vegaLocale` array indices as string leaves. Skipping arrays is optional if every locale keeps the same arrays after L-*.
- `localePersist.ts` in plumbing is the right home for the pre-init snapshot and `languageCompleted`. Do not add a second locale-id key besides `i18nextLng`.
- Keep `export default i18n` from `src/i18n/index.ts`. Unit tests mock that shape.
- Empty env `AVAILABLE_LANGUAGES=` (set, zero ids) still becomes `[]` and hides the switcher. Pre-existing. Do not "fix" it in this job.
- Desktop Flask path does not override this env. `.env.template` comment should list the six and keep the `=zh` hide example.

## Plan change (must)

`C-i18n-plumbing` must snapshot `localStorage['i18nextLng']` in `localePersist.ts` *before* `i18n.init` (or set detector `caches: []` until Continue). `C-picker-gate` and the Place/grain flow must not test “`i18nextLng` missing after init.” Show LanguageScreen when `languageCompleted` is missing and that pre-init snapshot is empty, even if the detector later writes a navigator guess. Returning users skip when the snapshot already has `i18nextLng` (the gate may then backfill `languageCompleted`). Continue remains the only write of `languageCompleted` plus the confirmed locale. Do not treat a post-init detector cache as proof of a prior session.

## W2 / W4 unification

Confirmed. One plumbing chunk: register six ids in `resources`, widen `AVAILABLE_LANGUAGES` default to those six, leave new locale files empty until L-*. Advertise-with-files is the registered trees, not native copy. Campaign writers fill keys later. Missing keys fall back to `en`.
