# UI-expert: F-i18n-picker

Feature: F-i18n-picker  
Session focus: desktop. Ship: web + desktop.  
Do not implement. Do not plan F-locales.

## 1. Meaning

Pick a language on first open (house card screen), persist it, then change it later in Settings or the toolbar, and see the UI in that language.

Out of scope: locale JSON campaign (F-locales); new i18n stack; store-listing copy; ripping the model-select wall; inventing the house 20 locales this turn; value/setup/permissions onboarding beyond the language gate.

## 2. Place / plug-in

No dedicated route. Overlay at the app root, above the shell and above the model wall.

| When | Where | Notes |
|------|--------|--------|
| First-run | New `LanguageScreen` + `resolveEntry()` gate in `src/app/App.tsx` (`AppFC` / around `RouterProvider`), z-index above `DataFormulator` model wall (`zIndex: 1000` in `src/views/DataFormulator.tsx`) | First visible paint when no **explicit** locale persist. Hide toolbar/shell until Continue. `/auth/callback` stays ungated. |
| Later | `ConfigDialog` (Settings) language row; keep toolbar `LanguageSwitcher` + compact `LanguageMenuItems` | Replay never remounts Phase 0. |

SSOT for ids this turn: `LANGUAGE_LABELS` keys in `src/app/App.tsx` (`en`, `zh`, `ja`, `ko`, `fr`, `de`). Server `AVAILABLE_LANGUAGES` (`dfSlice` default `['en','zh']`, env default `en,zh` in `py-src/data_formulator/app.py`) must list the same six or the picker will hide ja/ko/fr/de. That env default is a be-expert item; UI lists the six.

Existing later paths:

- Wide toolbar: `LanguageSwitcher` ToggleButtonGroup (`App.tsx` ~191, mounted ~1219 and About ~1257).
- Narrow toolbar: `ToolbarOverflowMenu` + `LanguageMenuItems` (`showLanguages` default true).
- Settings `ConfigDialog` (~751): theme / chart size / row limit only. **No language row today.**

## 3. Approach

Layers: launch gate + persist flag → house Language screen → Settings later row → keep toolbar as later path → desktop keyboard / Preferences.

Likely files:

- New: `src/views/onboarding/LanguageScreen.tsx` (or `src/views/LanguageScreen.tsx`). Globe well, centered title, one muted sentence, native-name cards (accent ring + check), sticky Continue. No dropdown, no flags-as-hero, no Skip.
- New: small persist helper (e.g. `src/i18n/localePersist.ts`) with an **explicit** completed key, not “i18nextLng exists”.
- `src/app/App.tsx`: gate in `AppFC` after `configLoaded`; extract `LANGUAGE_LABELS` to a shared native-name map; Settings row in `ConfigDialog`; keep `LanguageSwitcher` as later chrome.
- `src/i18n/index.ts`: keep i18next + LanguageDetector. Detector may **preselect**; it must not complete the gate.
- `src/i18n/locales/en/common.json` (+ later F-locales): `onboarding.languageTitle`, `onboarding.languageIntro`, `onboarding.continue`.
- Electron later: `electron/main.cjs` Preferences (Cmd+, / Ctrl+,) opening Settings. Not required to ship the first-run screen.

Look (copy structure, swap Datly accent from `tokens` / active palette):

```
[ globe well 52×52 ]
Choose your language
Datly will use this language everywhere. Change later in Settings.
[ English ✓ ]  [ 中文 ]  [ 日本語 ]  [ 한국어 ]  [ Français ]  [ Deutsch ]
[ Continue ]
```

Tap/select applies `i18n.changeLanguage` immediately (title/intro re-`t()`). Continue writes persist + `languageCompleted` then unmounts. Preselect `navigator.language` base when it matches a shipped id; else `en`. Never skip because detect succeeded.

Existing installs: if `i18nextLng` is already set but no completed flag, treat as persisted (do not trap returning users). New installs: no completed flag → show picker even if detector wrote a guess.

RTL: none of the six ids is `ar`. Still apply `dir` from i18n so a later locale does not require a second gate.

## Native names (first-run cards)

Never EN / FR / DE codes on first-run cards.

| id | Card label |
|----|------------|
| en | English |
| zh | 中文 |
| ja | 日本語 |
| ko | 한국어 |
| fr | Français |
| de | Deutsch |

Settings later row: same native names. Toolbar later path may keep short labels for density (中文 / 日本語 / 한국어 stay as-is; change EN/FR/DE to English / Français / Deutsch, or En / Fr / De only if space forces it). Overflow menu: native names.

## Keyboard (desktop)

First-run (required, no mouse):

- Tab into the card list; ArrowUp / ArrowDown (and Home / End) move selection.
- Space or Enter on a card applies locale immediately.
- Tab to Continue; Enter confirms. One tab stop per card + Continue.
- Visible focus ring. Escape does nothing (no Skip, no dismiss).
- Continue stays visible at Electron min size (960×640).

Later:

- Settings: existing gear; add Preferences Cmd+, (Mac) / Ctrl+, (Win/Linux) to open `ConfigDialog` and focus the language group.
- Toolbar ToggleButtonGroup: Left/Right + Enter (MUI). Overflow: open ⋮ then arrows.
- Do not steal system shortcuts.

## Existing toolbar ToggleButtonGroup

**Both.** Keep as later convenience on App + About (wide). Compact overflow menu stays. Add a Settings language row as the discoverable later path (house: Settings after persist). Do not use the ToggleButtonGroup as first-run. Do not delete it.

## 4. Verdict draft: SHAPE

Fits the product job. IA does not need a user decision. Insert language-first **above** the model wall; do not remove or redesign `selectedModelId == undefined` overlay. ASK would only apply if we deleted that wall or added a Home/nav tile.

Flow after this job:

```
no explicit locale persist → LanguageScreen (full viewport)
  → Continue
  → existing model wall (if no model)
  → app shell
locale already persisted → never re-show LanguageScreen → model wall or shell as today
```

This is SHAPE, not FIT, because first-run today is the model wall and detector already caches `i18nextLng`.

## 5. Risks / plan must not break

- Do not treat LanguageDetector `localStorage` (`i18nextLng`) as “user completed Phase 0”. That would auto-skip the house screen.
- Do not change `AVAILABLE_LANGUAGES` default in UI only; if server still returns `en,zh`, ja/ko/fr/de never appear. Coordinate with W4 / F-locales.
- Do not rip or lower the model wall. Language overlay stacks **above** it (`zIndex` > 1000) then yields.
- Do not mount AppBar as first paint on a new install.
- Do not gate `/auth/callback`.
- Do not re-show the picker every launch; persist `languageCompleted` (or equivalent) separately from locale id.
- Do not replace i18next. Keep `syncVegaLocale` on `languageChanged`.
- Compact toolbar already dropped the visible switcher; overflow + Settings must remain.
- F-locales not done: missing ja/ko/fr/de trees fall back to English until that campaign. Picker still lists them.
- `PersistGate loading={null}` can flash; gate must not wait on Redux for locale completed if the flag is localStorage.
- Titlebar drag: language overlay controls need `no-drag` if painted under the frameless bar. Prefer covering the window without relying on the AppBar.

## 6. Suggested chunks (ids only)

- C-picker-gate
- C-picker-screen
- C-picker-settings
- C-picker-toolbar-later
- C-picker-desktop-keys
