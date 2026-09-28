# F-i18n-picker keep catalog

- Feature: F-i18n-picker
- Kind: keep-catalog
- Status: executed
- S9 pointer: this file (W10)
- Session: desktop
- Ship: web, desktop
- Work package: docs/lifecycle/work-packages/F-i18n-W.md

S9 (`[wf]` + `[ui-vis]` + `[connect]` + `[arch-fit]`) walks these P0 ids. Desktop is the session. Web ships, so LanguageScreen also gets dual-viewport on web.

Persist keys: detector `i18nextLng`; gate flag `datly.languageCompleted`. Gate reads the **pre-init** `i18nextLng` snapshot only. A post-init detector cache write is not first-run complete.

Desktop S9 must capture: LanguageScreen chrome (not AppBar, not model wall); Continue at min size 960x640; keyboard path notes; Settings language row; model wall still present after Continue.

## Index

| id | priority | status | chunk | journey |
|----|----------|--------|-------|---------|
| TC-picker-01 | P0 | pass | C-picker-gate | New install sees LanguageScreen first |
| TC-picker-02 | P0 | pass | C-picker-gate | Returning `i18nextLng` user skips picker |
| TC-picker-03 | P0 | pass | C-picker-gate | Continue then model wall still works |
| TC-picker-04 | P0 | pass | C-picker-settings | Settings live language change |
| TC-picker-05 | P0 | pass | C-picker-settings | Toolbar still works as later path |
| TC-picker-06 | P0 | pass | C-picker-gate | `/auth/callback` ungated |
| TC-picker-07 | P0 | pass | C-picker-screen | No Skip / no flags |
| TC-picker-08 | P0 | pass | C-picker-desktop-keys | Keyboard path |
| TC-picker-09 | P0 | pass | C-picker-desktop-keys, C-picker-screen | Min-size Continue |
| TC-picker-10 | P0 | pass | C-picker-gate | `AVAILABLE_LANGUAGES` length `<= 1` skips picker |

---

### TC-picker-01 New install sees LanguageScreen first

- id: TC-picker-01
- priority: P0
- status: pass
- chunk: C-picker-gate
- surfaces: desktop (primary), web

**Steps**

1. Use a brand-new profile: empty localStorage before app init (no `i18nextLng`, no `datly.languageCompleted`).
2. Launch desktop (and web) with default `AVAILABLE_LANGUAGES` of six (`en,zh,ja,ko,fr,de`).
3. Wait until `configLoaded` and the first non-loader paint.
4. Let the detector run (navigator guess may write `i18nextLng` after init).
5. Observe first visible chrome: LanguageScreen vs model wall vs AppBar.

**Expected**

- First visible paint after the loader is LanguageScreen: globe well, title, intro, native-name cards, Continue.
- Model-select wall is not first paint.
- AppBar / toolbar is not first paint (overlay covers the shell).
- A detector cache write of `i18nextLng` after init does not skip the picker.
- Overlay keeps `RouterProvider`; it does not replace the router.

**Trace**

- C-picker-gate: `AppFC` `showLanguagePicker` is true when `languageCompleted` is missing and `getPreInitI18nextLng()` is empty, even if the detector later caches a guess.

---

### TC-picker-02 Returning i18nextLng user skips picker

- id: TC-picker-02
- priority: P0
- status: pass
- chunk: C-picker-gate
- surfaces: desktop, web

**Steps**

1. Before this session, set localStorage `i18nextLng=en` (or any listed id). Leave `datly.languageCompleted` unset.
2. Launch with default six-id allowlist.
3. Wait for first non-loader paint.
4. Confirm whether LanguageScreen appears.
5. Inspect localStorage for `datly.languageCompleted`.

**Expected**

- LanguageScreen never appears.
- App proceeds to the existing model wall (if `selectedModelId` is undefined) or the shell as today.
- Gate backfills `datly.languageCompleted=true`.
- Kill + relaunch still skips the picker.

**Trace**

- C-picker-gate: returning user uses the pre-init `i18nextLng` snapshot, not a post-init detector write. Mount effect backfills `languageCompleted`.

---

### TC-picker-03 Continue then model wall still works

- id: TC-picker-03
- priority: P0
- status: pass
- chunk: C-picker-gate
- surfaces: desktop, web

**Steps**

1. Start as TC-picker-01 (empty pre-init snapshot, no model selected).
2. Select a card (for example Français) so title/intro re-`t()`.
3. Click Continue.
4. Observe the next overlay.
5. Use the existing model-select control.
6. Kill + relaunch.

**Expected**

- Continue writes locale + `datly.languageCompleted` and unmounts LanguageScreen.
- Existing model-select overlay is visible and usable (`selectedModelId` undefined, z-index 1000). The wall is not ripped or lowered.
- LanguageScreen does not return on relaunch.

**Trace**

- C-picker-gate: Continue unmounts the picker; `DataFormulator` model wall is unchanged.
- C-picker-screen: Continue is the persist CTA (`changeLanguage` + `setLanguageCompleted`).

---

### TC-picker-04 Settings live language change

- id: TC-picker-04
- priority: P0
- status: pass
- chunk: C-picker-settings
- surfaces: desktop, web

**Steps**

1. Complete first-run (or start as a returning user) so LanguageScreen is gone.
2. Open Settings (`ConfigDialog`).
3. Confirm the first control under `config.frontend` is Language.
4. Open the list and confirm native names for the allowlist (default six: English, 中文, 日本語, 한국어, Français, Deutsch).
5. Change to Deutsch.
6. Watch chrome (AppBar, Settings labels) and a Vega chart locale if a chart is present. Do not reload.

**Expected**

- Language row is the discoverable later path. Same native names as first-run cards, filtered by `AVAILABLE_LANGUAGES`.
- `i18n.changeLanguage` applies immediately. No restart.
- Vega locale follows `languageChanged` when `chart.vegaLocale` exists.
- Toolbar is not required to complete this change.

**Trace**

- C-picker-settings: `ConfigDialog` language `Select` under `config.frontend`, live `changeLanguage`.

---

### TC-picker-05 Toolbar still works

- id: TC-picker-05
- priority: P0
- status: pass
- chunk: C-picker-settings
- surfaces: desktop, web

**Steps**

1. After first-run, use a wide toolbar (not compact).
2. Change language with `LanguageSwitcher`.
3. Narrow the toolbar until overflow (width under 900).
4. Open the overflow menu and change language from the compact list.
5. Confirm the toolbar was never the first-run UI (LanguageScreen was).

**Expected**

- Wide `LanguageSwitcher` still changes locale live.
- Compact overflow lists languages with native names (`LanguageMenuItems`).
- Hide rule `length <= 1` still hides both switcher and overflow language rows.
- Toolbar is a later shortcut, not Phase 0.

**Trace**

- C-picker-settings: keep `LanguageSwitcher` and `LanguageMenuItems`; overflow uses native names; hide rule unchanged.

---

### TC-picker-06 /auth/callback ungated

- id: TC-picker-06
- priority: P0
- status: pass
- chunk: C-picker-gate
- surfaces: web (primary), desktop if the renderer can hit the path

**Steps**

1. Use empty localStorage (would otherwise show LanguageScreen on `/`).
2. Open `/auth/callback` (OIDC callback URL, query string optional).
3. Observe whether LanguageScreen mounts.
4. Confirm `OidcCallback` can run (loader / error / redirect), not a language wall.

**Expected**

- LanguageScreen never shows on `/auth/callback`.
- Pathname exception (and dedicated route outside `AppShell`) keeps the picker off.
- Overlay does not trap the callback.

**Trace**

- C-picker-gate: `showLanguagePicker` requires `window.location.pathname !== '/auth/callback'`. Router table: `{ path: "/auth/callback", element: <OidcCallback /> }`.

---

### TC-picker-07 No Skip / no flags

- id: TC-picker-07
- priority: P0
- status: pass
- chunk: C-picker-screen
- surfaces: desktop, web

**Steps**

1. Launch a new install (TC-picker-01).
2. Inspect LanguageScreen chrome: globe well, title, intro, cards, Continue.
3. Search the overlay for Skip, flag art, a `<select>` dropdown, and a mascot.
4. Confirm default six cards: English, 中文, 日本語, 한국어, Français, Deutsch (never EN / FR / DE codes on first-run cards).
5. Press Escape.
6. With operator `AVAILABLE_LANGUAGES=en,zh`, relaunch a new profile and count cards.

**Expected**

- No Skip control. Escape does not dismiss.
- No flags. No dropdown. No mascot.
- Cards are a single column of native-name rows with accent ring + trailing check on the selected id.
- Selecting a card calls `changeLanguage` immediately so title/intro re-`t()`.
- Operator two-id allowlist shows only those two cards.
- Continue is the only primary CTA.

**Trace**

- C-picker-screen: house LanguageScreen look and copy keys (`onboarding.languageTitle`, `onboarding.languageIntro`, `onboarding.continue`).

---

### TC-picker-08 Keyboard path

- id: TC-picker-08
- priority: P0
- status: pass
- chunk: C-picker-desktop-keys
- surfaces: desktop (primary), web for picker keys

**Steps**

1. New install. Do not use the mouse.
2. Tab through language cards.
3. ArrowDown / ArrowUp / Home / End move selection.
4. Space or Enter on a card applies that locale immediately (title/intro update).
5. Tab to Continue. Enter confirms.
6. Confirm one tab stop per card plus Continue, and a visible focus ring.
7. Press Escape (must be a no-op).
8. After Continue (and model wall if needed), later: Cmd+, (Mac) or Ctrl+, (Win/Linux) opens `ConfigDialog` and focuses the language group. Do not steal system shortcuts.

**Expected**

- A new install can select Français and Continue with keyboard only.
- Escape does not skip or dismiss.
- Preferences shortcut opens Settings on the language control after first-run.
- Overlay card and Continue clicks are not eaten by frameless titlebar drag (`no-drag` on controls).

**Trace**

- C-picker-desktop-keys: keyboard-first picker and later Preferences.
- C-picker-screen: card list, Escape no-op, `WebkitAppRegion: no-drag` on buttons.

---

### TC-picker-09 Min-size Continue

- id: TC-picker-09
- priority: P0
- status: pass
- chunk: C-picker-desktop-keys, C-picker-screen
- surfaces: desktop

**Steps**

1. New install on Electron.
2. Resize the window to min size 960x640 (`minWidth` / `minHeight` in `electron/main.cjs`).
3. Confirm the selected card remains visible (scroll the card list if needed).
4. Confirm Continue is on screen and clickable (not clipped by the frameless titlebar).
5. Click a card and Continue at that size.

**Expected**

- Continue stays on-screen at 960x640.
- Selected card remains reachable.
- Titlebar drag region does not eat clicks on cards or Continue.

**Trace**

- C-picker-screen: sticky Continue at Electron min size.
- C-picker-desktop-keys: min window 960x640 still shows Continue and the selected card; overlay controls `no-drag`.

---

### TC-picker-10 Allowlist length <= 1 skips picker

- id: TC-picker-10
- priority: P0
- status: pass
- chunk: C-picker-gate
- surfaces: desktop, web

**Steps**

1. Set operator env `AVAILABLE_LANGUAGES=zh` (one id). Empty localStorage.
2. Launch. Wait for `configLoaded`.
3. Observe whether LanguageScreen appears.
4. After the model wall / shell, open Settings and inspect the toolbar.

**Expected**

- LanguageScreen never appears (same hide rule as the toolbar).
- Settings language control is hidden.
- Toolbar `LanguageSwitcher` and compact language rows are hidden.
- App proceeds to model wall or shell as today.

**Trace**

- C-picker-gate: after `configLoaded`, `AVAILABLE_LANGUAGES.length <= 1` skips the picker.
- C-picker-settings: Settings row and toolbar hide on the same length rule.

---

## S9 notes

- Catalog status for all ten P0 ids: pass (W10 harvest 2026-08-19).
- Do not wait on F-locales L-* for this panel. Missing keys fall back to English.
- Dual-viewport web shots of LanguageScreen are in scope because web ships.
- `/auth/callback` is a web (or renderer URL) check; desktop session still records the pathname exception.
- Not in this catalog: store listing, house 20 locales, RTL files, restart-to-apply, value slides, About/Legal polish.
