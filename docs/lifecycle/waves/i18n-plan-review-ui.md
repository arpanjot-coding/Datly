# Plan review (ui): F-i18n-W

Job: F-i18n-picker. Plan: `docs/lifecycle/work-packages/F-i18n-W.md`.
Reviewer: Wave C [ui-expert]. Report only.

## Verdict

ok

## Ships the job?

Yes. First-run `LanguageScreen`, Settings later path, and desktop keys are all in chunks. Neighbors stay intact.

- Model wall: overlay stacks above `DataFormulator.tsx` (`zIndex: 1000`). Wall is not rewritten. After Continue, `selectedModelId == undefined` still shows it.
- Toolbar switcher: `LanguageSwitcher` and compact `LanguageMenuItems` stay as later chrome. Hide rule `length <= 1` unchanged. Not first-run.
- `/auth/callback`: stays a sibling route of `AppShell`. Overlay keeps `RouterProvider`. Pathname exception (or equivalent) keeps the callback ungated.
- PersistGate: `languageCompleted` and the pre-init `i18nextLng` snapshot are localStorage, not Redux. Gate does not wait on `PersistGate loading={null}`.

House look, keyboard, and Cmd/Ctrl+, are in `C-picker-screen` and `C-picker-desktop-keys`.

## C-picker-gate (languageCompleted vs detector)

Unified correctly. Round 1 must is closed.

W3 rule was: `languageCompleted` is separate from `i18nextLng`. Returning users with an existing locale skip. New installs see the picker even if the detector guessed.

The written gate now matches that:

- Snapshot `localStorage['i18nextLng']` before first detector cache write (or `caches: []` until Continue).
- Show LanguageScreen when `languageCompleted` is missing and that **pre-init** snapshot is empty, even if init later writes a navigator guess.
- Returning user: pre-init snapshot already has `i18nextLng` → skip and backfill `languageCompleted`.
- `languageCompleted` set → never re-show.
- Continue is the only write of `languageCompleted` plus the confirmed locale.
- Detector may write `i18nextLng`; it does not complete Phase 0.
- After `configLoaded`, allowlist length `<= 1` skips the picker the same way the toolbar hides.

Do not re-read live `i18nextLng` after `i18n.init` in `AppFC`. That is the old hole. The snapshot is the returning-user test.

## House look

Present in `C-picker-screen` / `C-picker-desktop-keys`:

| Check | Plan |
|-------|------|
| 52×52 globe well | yes |
| Native-name cards | English, 中文, 日本語, 한국어, Français, Deutsch |
| No flags | yes |
| No Skip | yes; Escape is a no-op |
| z-index above 1000 | yes; full-viewport overlay |
| no-drag on overlay controls | yes |
| Keyboard path | Tab, arrows, Home/End, Space/Enter, one tab stop per card + Continue, visible focus ring |
| Cmd/Ctrl+, Preferences | opens `ConfigDialog` and focuses the language group |

Single column of selectable cards, sticky Continue, no dropdown, no mascot. Accent from Datly tokens / active palette. Continue stays on-screen at 960×640.

## must

None.

## should

- Run the snapshot in `src/i18n/localePersist.ts` / `src/i18n/index.ts` **before** `i18n.init` (`src/index.tsx` imports `./i18n` first). `AppFC` reads that captured value. Do not re-read `localStorage['i18nextLng']` after init to decide the gate.
- Overlay at `AppFC` covers every route. `/auth/callback` needs an explicit pathname exception (`window.location.pathname`), not overlay-only.
- While LanguageScreen is up, mark the router tree inert (or equivalent) so Tab cannot reach the covered AppBar. Paint a top drag strip (~52px) with no-drag on cards and Continue; hiding AppBar removes the existing frameless drag region.
- Bind Cmd/Ctrl+, in `App.tsx` (renderer) so web and pywebview get Preferences. Electron menu is extra. Prefer a Menu accelerator over `globalShortcut`.
- Decide picker visibility on the first render after `configLoaded` (sync localStorage read), not a later `useEffect`, so AppBar and the model wall cannot flash for one frame under AnvilLoader.

## nit

- Single language phase can omit house pill dots.
- Toolbar "En / Fr / De if space forces" is optional density. S9 should prefer English / Français / Deutsch.
- `C-picker-settings` acceptance says "the same six native names". Goal already filters by `AVAILABLE_LANGUAGES`. Default allowlist is six; operator list still applies.
- "Shared native-name map extracted from `LANGUAGE_LABELS`" must not copy today's EN / FR / DE values onto first-run cards. Cards use the Decisions table. Toolbar may keep short labels.

Nits do not need another review round.

## Plan change (must)

n/a
