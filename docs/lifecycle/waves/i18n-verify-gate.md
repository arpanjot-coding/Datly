# Independent verify: C-picker-gate

Slice: `C-picker-gate` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write the slice. Static read of delivered files only. Tests not executed.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | Pass | Matches. New empty storage sees the LanguageScreen overlay after config, even if the detector later caches a guess. | `src/i18n/localePersist.ts` captures `preInitI18nextLng` at module load (`readStorage('i18nextLng')`). `src/i18n/index.ts` imports that module before `i18n.init` with detector `caches: ['localStorage']`. `src/app/App.tsx` `showLanguagePicker` requires `configLoaded`, `!getLanguageCompleted()`, and `!getPreInitI18nextLng()`. Empty storage yields null snapshot and false completed, so the overlay mounts. A post-init detector write does not change the snapshot. Until `configLoaded && authChecked`, `AppFC` renders `AnvilLoader` (not AppBar, not the model wall). | n/a |
| A2 | Pass | Matches. Returning pre-init `i18nextLng` skips the picker and backfills `languageCompleted`. | `showLanguagePicker` is false when `getPreInitI18nextLng()` is truthy. Mount effect: `if (getPreInitI18nextLng() && !getLanguageCompleted()) setLanguageCompleted(true)`. Comment at the gate states the snapshot-only rule. | n/a |
| A3 | Pass | Matches. Continue unmounts the picker. Existing model wall is unchanged and still above the shell. | `LanguageScreen` Continue calls `i18n.changeLanguage(selected)`, `setLanguageCompleted(true)`, then `onContinue`. `AppFC` `onContinue` sets `languagePickerDismissed`, which drops `showLanguagePicker` and unmounts the overlay. `inert` / `pointerEvents: 'none'` / `aria-hidden` are removed from the router box. `src/views/DataFormulator.tsx` still gates on `selectedModelId == undefined` with overlay `zIndex: 1000`. No language-gate edits in that file. Language overlay is `zIndex: 2000`, so it sat above the wall and leaves it usable after Continue. | n/a |
| A4 | Pass | Matches. `/auth/callback` never shows the picker (pathname exception plus dedicated route). | Router table: `{ path: "/auth/callback", element: <OidcCallback /> }` is a sibling of `/`, not under `AppShell`. Gate also requires `window.location.pathname !== '/auth/callback'`. Overlay is a sibling of `RouterProvider`, so the path check is what keeps the picker off that URL on first load (typical OIDC full navigation). | n/a |
| A5 | Pass | Matches. Allowlist `length <= 1` skips the picker the same way the toolbar hides. | `showLanguagePicker` requires `serverConfig.AVAILABLE_LANGUAGES.length > 1`. Toolbar `LanguageSwitcher` / `LanguageMenuItems` still return null when `!availableLanguages \|\| availableLanguages.length <= 1`. After `configLoaded`, operator `AVAILABLE_LANGUAGES=zh` is a one-id array from `GET /api/app-config` (`app.py` split). | n/a |
| A6 | Pass | Matches. Overlay does not replace `RouterProvider`. | After `configLoaded && authChecked`, `AppFC` always mounts `<RouterProvider router={router} />`. `LanguageScreen` is a following sibling when `showLanguagePicker`. Full-viewport `position: 'fixed'; inset: 0; zIndex: 2000`. Router box is `inert` and non-interactive while the picker is up. | n/a |
| A7 | Pass | Matches. Gate does not re-read `i18nextLng` after init. | `getPreInitI18nextLng()` returns the module-load const `preInitI18nextLng`. The gate never calls `localStorage.getItem('i18nextLng')`. Completed state uses a separate key (`datly.languageCompleted`) via `getLanguageCompleted` / `setLanguageCompleted`. | n/a |

## Slice outcome

All seven listed checks Pass. Chunk goal (first-run overlay after config, pre-init snapshot skip, model wall left in place, callback and single-locale hide rules) is met in source.

Not a fail here: picker also waits on `authChecked`, so first chrome is `AnvilLoader` until both config and auth finish. Plan text is gate after `configLoaded`; the extra wait does not show AppBar or the model wall.

Not exercised in this verify: live empty-storage launch, live Continue-then-model-wall, or a real `/auth/callback` hit.
