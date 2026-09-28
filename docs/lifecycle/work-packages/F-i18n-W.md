# Work package - F-i18n Language picker + listed locales

- **Status:** ACCEPTED
- **Kind:** W
- **Session focus:** desktop
- **Ship targets:** web, desktop
- **Features:** F-i18n-picker, F-locales
- **Wave A:** W1 neighborhood, W2 research, W3 ui-expert, W4 be-expert (all DONE)

## Ask / out of scope

Verbatim: desktop / we want the app to have a language picker and we want to publish it into all the languages we have added to the list please make sure that it going to be translated well.

| # | Job | Feature id |
|---|-----|------------|
| 1 | First-run + Settings language picker (native names, persist, later toolbar) | F-i18n-picker |
| 2 | Locale campaign: native copy for every id already on the in-app list | F-locales |

**Out of scope**

- Store listing translations
- Hebrew (`he`) and any locale outside the house 20
- Replacing i18next / adding a second `t()` stack
- Ripping or redesigning the model-select wall
- Translating user data, SQL, or Python
- Value slides, setup, permissions, RecoveryGate
- About / Legal / icon polish
- Restart-to-apply, VS Code language packs, separate UI vs data locale knobs
- Flags on the picker
- Pasting English into house locales as fake translations

## Meaning

**F-i18n-picker.** A desktop (and web renderer) analyst picks a language on first open, then can change it later, and sees the UI in that language.

Entry → steps → success: cold start with no explicit locale persist → house LanguageScreen → Continue writes `languageCompleted` + locale → existing model wall if no model → rest of app uses `t()`. Settings or toolbar can change locale later without replaying first-run.

**F-locales.** Speakers of the listed locales get real native UI copy, not leftover English stubs.

Entry → steps → success: English keys locked as meaning SSOT → per-locale write + optimize → later independent verify → picker can switch to that locale and P0 chrome is native.

Who: desktop analyst using Datly; also the web renderer.

## Verdict

**SHAPE** (logged). Fits the product job. IA does not need a user decision. Not FIT because today first-run is the model wall, detector already caches `i18nextLng`, resources and server default still say two langs while `LANGUAGE_LABELS` says six.

**What we slim**

- Six in-app locales only: `en`, `zh`, `ja`, `ko`, `fr`, `de`. Not the house 20.
- Keep i18next + react-i18next + i18next-browser-languagedetector. Do not replace.
- Insert a language-first overlay **above** the existing model wall. Do not rip the model wall.
- `languageCompleted` is a separate persist flag from `i18nextLng`. Existing users who already have `i18nextLng` skip the first-run picker. New installs see the picker even if the detector guessed.
- Missing keys fall back to `en`. Do not paste English into `ja` / `ko` / `fr` / `de`.
- Advertise the six ids in `AVAILABLE_LANGUAGES` default once resources are registered (empty keys OK until the campaign). Campaign writers then fill native copy.

ASK does not apply: we are not deleting the model wall and not breaking the env contract.

## Place / grain

No dedicated route. Overlay at the app root, above the shell and above the model wall (`DataFormulator.tsx` model overlay `zIndex: 1000`). Language is a first-run + Settings job, not a Home tile and not a nav section.

| When | Where |
|------|--------|
| First-run | New `LanguageScreen` overlay in `AppFC` (after `configLoaded`, around `RouterProvider`). Do not replace `RouterProvider` with the picker. Hide toolbar/shell until Continue. `/auth/callback` stays ungated. |
| Later discoverable | `ConfigDialog` frontend section, first control: Language, native-name list, live `changeLanguage`. |
| Later shortcut | Keep toolbar `LanguageSwitcher` (wide) and compact `LanguageMenuItems`. Do not use them as first-run. Do not delete them. |

Flow:

```
snapshot i18nextLng from localStorage BEFORE i18n.init caches a guess
no languageCompleted AND pre-init snapshot empty
  → LanguageScreen (full viewport overlay, z-index > 1000; do not unmount RouterProvider)
  → Continue writes i18nextLng + languageCompleted
  → existing model wall (if selectedModelId undefined)
  → app shell
pre-init snapshot already has i18nextLng (returning user, even without languageCompleted)
  → never re-show LanguageScreen; backfill languageCompleted → model wall or shell as today
languageCompleted set
  → never re-show LanguageScreen
allowlist AVAILABLE_LANGUAGES length <= 1 after configLoaded
  → skip LanguageScreen (same hide rule as the toolbar)
```

New install: detector may write a navigator guess after init and may preselect a card; that write must not complete the gate. Snapshot `localStorage['i18nextLng']` before first detector cache write (or set detector `caches: []` until Continue). Show the picker when `languageCompleted` is missing and the pre-init snapshot is empty, even if the detector later writes a guess.

**Grain.** Do not add a Home/nav tile. Picker is overlay; later change is Settings + existing toolbar.

**Reuse (must keep)**

- i18next init in `src/i18n/index.ts` (`fallbackLng: 'en'`, detector `localStorage` then `navigator`, cache `localStorage`)
- Single `translation` namespace; JSON merge barrels
- `syncVegaLocale` / `chart.vegaLocale` on `languageChanged`
- `LANGUAGE_LABELS` + `LanguageSwitcher` + `LanguageMenuItems`
- `serverConfig.AVAILABLE_LANGUAGES` from `GET /api/app-config`
- `getAgentLanguage` + `Accept-Language`
- `tests/frontend/unit/app/i18nLocales.test.ts` en/zh key alignment (keep in plumbing; six-locale parity is C-i18n-locale-tests only)
- Model wall in `DataFormulator.tsx`
- Hide switcher when `availableLanguages.length <= 1`

**Must not break**

- Do not treat a detector-written `i18nextLng` (post-init cache) as Phase 0 complete for **new** installs. Use the pre-init snapshot only.
- Do not trap returning users who already have `i18nextLng`
- Do not change `AVAILABLE_LANGUAGES` in UI only while server still returns `en,zh`
- Do not rip or lower the model wall
- Do not mount AppBar as first paint on a new install
- Do not gate `/auth/callback`
- Do not replace i18next or split `useTranslation('chart')`
- Do not hardcode the picker to `LANGUAGE_LABELS` while ignoring the server allowlist
- Overlay controls need `no-drag` if painted under the frameless titlebar
- `PersistGate loading={null}` can flash; read `languageCompleted` from localStorage, not Redux

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-picker-screen | |
| section-grain | n/a | Language is first-run overlay + Settings row, not a Home/nav tile. No new dock root and no reprinted today widget. |
| phone-chrome | n/a | Session and ship are web + desktop. No phone shell, notch, dock, or FAB in this job. |
| web-layout | C-picker-screen | Same React renderer ships web. Overlay is full-viewport; S9 still dual-viewport on web. |
| desktop-chrome | C-picker-desktop-keys | |
| first-run | C-picker-gate | |
| value-slide | n/a | No welcome / value slides this turn. Language overlay only, then existing model wall. |
| app-polish | n/a | About, icons, splash, Legal not in scope. Desktop splash English leftover is later. |
| notifications | n/a | No reminders or local alerts in this job. |
| i18n | C-i18n-plumbing, L-zh, L-ja, L-ko, L-fr, L-de | |
| hardware-back | n/a | No Android/iOS ship this turn. Escape on the picker is intentionally a no-op (no Skip). |

## Decisions

| ID | Chosen | Status |
|----|--------|--------|
| D-locale-set | House 20 from cross-cutting.md: ar zh nl en fr de el hi it ja ko pl pt ro ru es th tr vi fil. User 2026-08-19: ship all of them. `fil` aliases `tl`. | LOCKED |
| D-i18n-stack | Keep i18next. No second stack. Widen `AVAILABLE_LANGUAGES` default to the six once resources are registered. | LOCKED |
| D-language-first | Insert house LanguageScreen **above** the existing model wall. Do not delete the wall. `languageCompleted` is separate from `i18nextLng`. Returning-user skip uses the **pre-init** `i18nextLng` snapshot, not a post-init detector cache write. New installs see the picker even if the detector guessed. | LOCKED |

Native names (first-run cards and Settings). Never EN / FR / DE codes on first-run cards. No flags.

| id | Card label |
|----|------------|
| en | English |
| zh | 中文 |
| ja | 日本語 |
| ko | 한국어 |
| fr | Français |
| de | Deutsch |

Toolbar later path may keep short labels for density (中文 / 日本語 / 한국어 stay; change EN / FR / DE to English / Français / Deutsch, or En / Fr / De only if space forces it). Overflow menu: native names.

## Chunks

| ID | Goal | Depends | Likely files | Acceptance | Feature |
|----|------|---------|--------------|------------|---------|
| C-i18n-plumbing | Register `ja`/`ko`/`fr`/`de` resource trees (same 10 JSON filenames + barrel as `en`). Do not copy English string values. Each new JSON is `{}` or `{ "<top>": {} }`; omit keys; never `""` (blank beats fallback). Add each id to i18next `resources`. Set `supportedLngs` to the six only after those ids are in `resources`, `load: 'languageOnly'` (or `nonExplicitSupportedLngs: true`), `returnNull: false`, `returnEmptyString: false`, keep `fallbackLng: 'en'`. On `languageChanged` set `document.documentElement.lang` (and `dir` from `i18n.dir()`). Widen default `AVAILABLE_LANGUAGES` to `en,zh,ja,ko,fr,de` in `app.py` (both sites), `dfSlice` initial `serverConfig`, and `.env.template` comment. Env still wins. Add persist helper: `languageCompleted` key separate from detector `i18nextLng`. Snapshot helper: read `i18nextLng` before first detector cache write (or `caches: []` until Continue). Do not flatten or empty `zh/`. Do not extend `i18nLocales.test.ts` in this chunk (empty ja trees cannot match en keys yet). | none | `src/i18n/index.ts`; `src/i18n/locales/index.ts`; `src/i18n/locales/{ja,ko,fr,de}/` (empty trees + `index.ts`); `src/i18n/localePersist.ts` (new); `src/app/dfSlice.tsx`; `py-src/data_formulator/app.py`; `.env.template` | `i18n.changeLanguage('ja')` is accepted. A missing `ja` string for an existing en key renders the English copy, not `null`, not `""`, and not the raw key. `document.documentElement.lang` becomes `ja`. `GET /api/app-config` with unset env returns the six ids. Operator `AVAILABLE_LANGUAGES=en,zh` still yields two langs and a visible switcher; `AVAILABLE_LANGUAGES=zh` still hides the switcher. Detector may write `i18nextLng`; it does not write `languageCompleted`. Pre-init snapshot of `i18nextLng` is readable after init. Vega locale without a `chart.vegaLocale` object keeps English time format and does not throw. Existing en/zh key-alignment test still passes. | F-i18n-picker |
| C-picker-gate | First-run gate in `AppFC` after `configLoaded`. Show LanguageScreen when `languageCompleted` is missing AND the **pre-init** `i18nextLng` snapshot is empty, even if the detector later wrote a guess. Overlay the router (do not replace `RouterProvider`). Hide AppBar while the picker is up. Returning user: pre-init snapshot already has `i18nextLng` → skip picker and backfill `languageCompleted`. After `configLoaded`, if `AVAILABLE_LANGUAGES.length <= 1`, skip the picker the same way the toolbar hides. `/auth/callback` ungated (overlay, or pathname exception). After Continue, unmount picker; existing model wall still shows when `selectedModelId` is undefined. | C-i18n-plumbing | `src/app/App.tsx` (`AppFC`); `src/i18n/localePersist.ts` | Brand-new profile (empty localStorage before init): first visible paint is LanguageScreen, not the model wall and not the app bar, even after the detector caches a navigator guess. Profile with `i18nextLng=en` already in localStorage before this session: LanguageScreen never appears; app proceeds to model wall or shell as today. After Continue on a new profile with no model: LanguageScreen is gone and the existing model-select overlay is visible and usable. Opening `/auth/callback` never shows the picker. Kill + relaunch after Continue does not re-show the picker. `AVAILABLE_LANGUAGES=zh` never shows the picker. | F-i18n-picker |
| C-picker-screen | House LanguageScreen: 52×52 globe well, centered title, one muted sentence, native-name cards for the **allowlist** (intersect the six; accent ring + trailing check), sticky Continue. No Skip, no flags, no dropdown, no mascot. Tap/select calls `changeLanguage` immediately so title/intro re-`t()`. Continue persists locale + `languageCompleted` then unmounts. Preselect `navigator.language` base when it is on the allowlist; else `en`. English keys: `onboarding.languageTitle`, `onboarding.languageIntro`, `onboarding.continue` in `en`. Matching keys in `zh` must be real Simplified Chinese, not English pasted for parity. Accent from Datly tokens / active palette. Overlay controls `no-drag`. | C-picker-gate | `src/views/onboarding/LanguageScreen.tsx` (new); `src/app/App.tsx`; `src/i18n/locales/en/common.json`; `src/i18n/locales/zh/common.json`; shared native-name map extracted from `LANGUAGE_LABELS` | Default allowlist of six: cards show English, 中文, 日本語, 한국어, Français, Deutsch. Operator `AVAILABLE_LANGUAGES=en,zh`: only those two cards. No flag art. No Skip control. Selecting 日本語 retitles the screen in Japanese once that key exists, else English fallback, before Continue. Continue is the only primary CTA and stays on-screen at Electron min size 960×640. Escape does not dismiss. Card list is a single column of selectable cards, not a `<select>`. | F-i18n-picker |
| C-picker-settings | Settings language row as the discoverable later path. First control under `config.frontend` in `ConfigDialog`: native-name list of the six (filtered by `AVAILABLE_LANGUAGES`), live `i18n.changeLanguage`, no restart. Keep toolbar `LanguageSwitcher` and compact `LanguageMenuItems` as later shortcuts. Overflow menu uses native names. Hide rule `length <= 1` unchanged. | C-i18n-plumbing | `src/app/App.tsx` (`ConfigDialog`, `LanguageSwitcher`, `LanguageMenuItems`, `LANGUAGE_LABELS`) | After first-run, opening Settings shows a Language row with the same six native names. Changing it to Deutsch updates chrome immediately (Vega locale included) without reload. Compact overflow still lists languages when the toolbar collapses. Toolbar is not the first-run UI. With `AVAILABLE_LANGUAGES=zh` the Settings language control and toolbar switcher are both hidden. | F-i18n-picker |
| C-picker-desktop-keys | Keyboard-first picker and later Preferences. First-run: Tab through cards; ArrowUp / ArrowDown / Home / End move selection; Space or Enter on a card applies locale immediately; Tab to Continue; Enter confirms; one tab stop per card + Continue; visible focus ring; Escape no-op. Later: Cmd+, (Mac) / Ctrl+, (Win/Linux) opens `ConfigDialog` and focuses the language group. Do not steal system shortcuts. Titlebar: overlay is `no-drag` on controls; Continue not clipped at min window. | C-picker-screen, C-picker-settings | `src/views/onboarding/LanguageScreen.tsx`; `src/app/App.tsx`; `electron/main.cjs`; `electron/preload.cjs` | With no mouse, a new install can select Français and Continue. Preferences shortcut opens Settings on the language control. Min window 960×640 still shows Continue and the selected card. Frameless drag does not eat clicks on cards or Continue. | F-i18n-picker |
| C-test-spec | Author keep-catalog for the picker journeys and point S9 at it. | C-picker-screen, C-picker-settings | `docs/lifecycle/test-cases/F-i18n-picker.md` | Catalog lists P0 journeys: new install (empty **pre-init** `i18nextLng` snapshot) sees picker first even if detector later caches a guess; returning pre-init `i18nextLng` user skips; Continue then model wall; Settings live change; toolbar still works; `/auth/callback` ungated; no Skip / no flags; keyboard path; min-size Continue; allowlist length `<= 1` skips picker. Status ready for those P0 ids. File is the S9 pointer for W10. | F-i18n-picker |
| L-zh | Native pass on existing Simplified Chinese: optimize leftover English UI copy, fill new onboarding keys, keep key alignment with `en`. Brands and product name stay. Simplified only, not 繁體. Pass 1+2 in this chunk. Independent verify is a later `[polish]` wave, not this row. | C-i18n-plumbing, C-picker-screen | `src/i18n/locales/zh/*.json` | Switching to 中文 shows native P0 chrome (nav, first-run, CTAs, errors, empty). No 繁體. Placeholders intact. Existing en/zh key-alignment test still passes. | F-locales |
| L-ja | New Japanese tree matching `en` keys (including onboarding keys from C-picker-screen). Pass 1 translate + pass 2 optimize. Register: です/ます. One locale only. | C-i18n-plumbing, C-picker-screen | `src/i18n/locales/ja/*.json` | Switching to 日本語 shows native P0 chrome (nav, first-run, CTAs, errors, empty). Polite です/ます throughout. No leftover English stubs shipped as the translation. `{name}` / i18next plurals intact. | F-locales |
| L-ko | New Korean tree matching `en` keys (including onboarding keys). Pass 1 + pass 2. Register: 합니다. | C-i18n-plumbing, C-picker-screen | `src/i18n/locales/ko/*.json` | Switching to 한국어 shows native P0 chrome. 합니다 register held for the file. No English stubs. Placeholders intact. | F-locales |
| L-fr | New French tree matching `en` keys (including onboarding keys). Pass 1 + pass 2. Register: vous. Watch length on toolbar and buttons. | C-i18n-plumbing, C-picker-screen | `src/i18n/locales/fr/*.json` | Switching to Français shows native P0 chrome. vous throughout. Accents present (Français, not Francais). CTAs still fit the controls. Placeholders intact. | F-locales |
| L-de | New German tree matching `en` keys (including onboarding keys). Pass 1 + pass 2. Register: Sie. Longest expansion risk: toolbar, dialogs, encoding shelf. | C-i18n-plumbing, C-picker-screen | `src/i18n/locales/de/*.json` | Switching to Deutsch shows native P0 chrome. Sie throughout. No clipped primary CTAs at default desktop width. Placeholders intact. | F-locales |
| C-i18n-locale-tests | Key-parity unit test for all six locales after merge (string leaves, same contract as today’s en/zh test). Vega locale arrays not counted as string leaves. | L-zh, L-ja, L-ko, L-fr, L-de | `tests/frontend/unit/app/i18nLocales.test.ts` | `collectKeys` of `zh`, `ja`, `ko`, `fr`, `de` each equals `collectKeys(en)`. A dropped key in any listed locale fails the test. en remains meaning SSOT (no rewrite-English-to-help-translators chunk). | F-locales |

`en` is meaning SSOT. There is no L-en rewrite chunk.

**Impl order.** Plumbing → gate → screen → Settings/toolbar → desktop keys → test-spec. Then one `[impl]` per locale (L-*). Key-parity tests after the five locale rows. S9 (W10) runs after picker chunks (through C-picker-desktop-keys + C-test-spec), not after the campaign.

## Locale campaign

One locale per later `[impl]`. Many locales may run in parallel up to the operating cap. Do not draft all languages in one agent. Worktree if two writers might touch a shared index; isolation is not required when each writer only edits its own locale directory.

| Pass | Who | Job |
|------|-----|-----|
| 1 Translate | `[impl]` for that locale | Each key: say the job in that language. Meaning matches. Not English word order. |
| 2 Optimize | same `[impl]`, second walk | Grammar, structure, flow, local word choice. Rewrite if it only works as translated English. |
| 3 Verify | later `[polish]` wave (W9), not the writer | Independent. Fail = rewrite that key, then re-verify. Not this package’s impl rows. |

P0 strings that must pass passes 1–2 in each L-* chunk: nav, first-run, CTAs, errors, empty states. Rest of the tree is in the same walk (one locale file set, not a P0-only dump).

**Register**

- `ja`: です/ます
- `ko`: 합니다
- `fr`: vous
- `de`: Sie
- `zh`: Simplified only

**Rules**

- Convey the job, not the English sentence. No machine-calque dumps.
- Do not paste English into `ja` / `ko` / `fr` / `de` as a start.
- Accents / script required by the language stay in.
- Placeholders `{name}` / `{{name}}` / i18next plurals intact.
- Glossary-stable product nouns: session, workspace, chart, encoding, model, agent. Product name stays Datly.
- No em dashes.
- Line by line. No batch paraphrase of the whole file.

## Proof

- **S9 after picker chunks (W10):** `[wf]` + `[ui-vis]` + `[connect]` + `[arch-fit]`. Desktop session. Web dual-viewport on the LanguageScreen because web ships. Catalog: `docs/lifecycle/test-cases/F-i18n-picker.md`.
- **S9 does not wait on L-*.** Campaign verify is W9 `[polish]`, one locale at a time, not the picker panel.
- **shipsNotifications:** no
- **writesOutput:** no
- **siblingFamily:** no

Desktop S9 must include: window shot with chrome of LanguageScreen; min-size 960×640 Continue visible; keyboard path notes; Settings language row; model wall still present after Continue.

## Wave C (round 1)

- W6-ui: must-fix (new-install gate vs detector cache). Patched: pre-init `i18nextLng` snapshot; overlay keeps `RouterProvider`; allowlist hide rule.
- W6-be: no must. Shoulds folded: empty trees, `returnEmptyString: false`, L-* depends on C-picker-screen, do not extend en/zh test in plumbing, zh stays full.
- Round 2: confirm must is closed. No [impl] until round 2 returns ok.

## Wave C (round 2)

- W6-ui-r2: ok. Must closed (pre-init snapshot).
- W6-be-r2: ok. No remaining must. `C-i18n-plumbing` can ship as written.
- Shoulds for the impl brief (not another review): set both `load: 'languageOnly'` and `nonExplicitSupportedLngs: true`; set `lang`/`dir` on init; third Python default in `get_app_config`.
- Wave C complete. Next: W7 `[impl]` `C-i18n-plumbing` only. Do not start locale writers this wave.

## User questions

None. Not ASK.
