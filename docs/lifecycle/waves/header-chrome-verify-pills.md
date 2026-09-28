# Independent verify: C-chrome-pills

Slice: `C-chrome-pills` in `docs/lifecycle/work-packages/F-header-chrome-W.md`. Writer sidecar `docs/test-runs/.worker-done/C-chrome-pills.md` (`done: true`, files: `src/components/IslandHeader.tsx` only). Verifier did not write the slice. Static read of source only. No command. No shot. No Accept.

Named acceptance: IslandHeader has no language pills, no About nav, no compact About/language items. App remains. `/about` still renders About.tsx. `#config-language` still lists house ids. Ctrl+, still opens Settings language. Do not delete About.tsx or the `/about` route. Do not touch LanguageScreen.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 no language pills | pass | Matches. Header language pickers are gone. | `src/components/IslandHeader.tsx` has no `LanguageSwitcher`, `LanguageMenuItems`, or `ToggleButtonGroup` (imports 1-40: MUI Box/Button/Divider/IconButton/List/Menu/Tooltip/Typography only). Repo grep of those three names under `src/` is empty except this header file's absence. Wide chrome after the mark is App plus workspace Explore/Reports `SegmentedPills` (309-321), not locale toggles. | n/a |
| A2 no About nav | pass | Matches. Header About pill is gone. `/about` is not a top-nav target. | No `TopNavButton to="/about"`. Only `TopNavButton` mount is `to="/app"` (`IslandHeader.tsx` 309). Grep `appBar.about` under `src/` is empty. Remaining `isAboutPage` / `variant === 'about'` (218, 393, 423) is chrome *on* the About page, not a nav item to it. | n/a |
| A3 no compact About/language items | pass | Matches. Overflow has no About row and no language rows. | Compact App `ToolbarOverflowMenu` keys (341-375): `explore`, `reports`, `settings`, `logs`, `exit`. Compact About keys (399-419): `settings`, `logs`, `video`. No `about`, no `language`, no `showLanguages`. `PageNavMenu` is not in this file. | n/a |
| A4 App remains | pass | Matches. App pill stays. | `TopNavButton to="/app" label={t('appBar.app')} selected={isAppPage}` (`IslandHeader.tsx` 309). `isAppPage = variant !== 'about'` (218-219), so landing and workspace still show App selected. | n/a |
| A5 /about still renders About.tsx | pass | Matches. Route and page file kept. | `src/views/About.tsx` exists; `export const About` (22). `src/app/App.tsx` 43 `import { About } from '../views/About'`. Router child `path: "about", element: <About />` (436-438). About still mounts `IslandHeader variant="about"` (`About.tsx` 99). | n/a |
| A6 #config-language lists house ids | pass | Matches. Settings Select unchanged as later path. | `src/views/ConfigDialog.tsx` Select `id="config-language"` (119). Options are `availableLanguages.map(lang => <MenuItem key={lang} value={lang}>)` (129-136), labels via `NATIVE_LANGUAGE_LABELS` / `HOUSE_LOCALE_ALIASES` (132). Default `serverConfig.AVAILABLE_LANGUAGES` in `src/app/dfSlice.tsx` 347 is the same 20 ids as `HOUSE_LOCALE_IDS` (`src/i18n/houseLocales.ts` 2-23): ar, zh, nl, en, fr, de, el, hi, it, ja, ko, pl, pt, ro, ru, es, th, tr, vi, fil. | n/a |
| A7 Ctrl+, opens Settings language | pass | Matches. Keep Settings Select + Ctrl+, / Cmd+, / onOpenPreferences. | `openPreferencesToLanguage` (`IslandHeader.tsx` 233-237) sets `settingsFocusLanguage` and `settingsOpen`, skips when `#language-screen-title` is in the document. Keydown on `,` with Ctrl (non-Mac) or Cmd/meta (Mac) (239-255). `window.electronAPI?.onOpenPreferences?.(openPreferencesToLanguage)` (257-260). All four `ConfigDialog` mounts pass `focusLanguage={settingsFocusLanguage}` (337, 382, 395, 425). `ConfigDialog.tsx` 60-66 focuses `document.getElementById('config-language')` when open + focusLanguage + more than one language. | n/a |
| G1 settings gear on About-wide | pass | Matches chunk goal. Show gear on former About-wide path. Compact About overflow has Settings. | About wide: `ConfigDialog` without `hideTrigger` (`IslandHeader.tsx` 425), so the gear IconButton renders (`ConfigDialog.tsx` 86-100). Compact About: `hideTrigger` plus overflow `key: 'settings'` (395, 401-405). App wide still shows the gear (382). | n/a |
| X1 LanguageScreen not edited | pass | Matches. Out of scope. Sidecar files list is header only. | Writer sidecar lists only `src/components/IslandHeader.tsx`. `src/views/onboarding/LanguageScreen.tsx` still exists as first-run picker (`language-screen-title` at 179; persist/preview at 40+). `App.tsx` 57 imports it and 474-478 still mounts it on the gate. IslandHeader still bails on that title id (234). This verify did not run git log; content still is the first-run screen, not header chrome. | n/a |

## Missing / wrong / extra

- Missing vs named acceptance: none.
- Wrong: none.
- Extra vs this slice: none. Info FAB move and compact Messages are `C-chrome-messages` / `C-chrome-overflow`, not delivered here.

## Residual (not a fail)

- `SHORT_LANGUAGE_LABELS` remains in `src/i18n/houseLocales.ts` with no `src/` consumer after the header cut. Not in this slice's likely files.
- MessageSnackbar bottom-right (i) FAB is still the next chunk.
- No live Ctrl+, run, no desktop shot, no vitest.

## Slice outcome

Acceptance A1-A7 pass. Goal G1 pass. LanguageScreen left in place. IslandHeader has App, Settings, Ctrl+, / Cmd+, / onOpenPreferences, and no language pills or About nav.

Verifier did not Accept. Manager decides.
