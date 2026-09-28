# Independent verify: C-chrome-overflow

Slice: `C-chrome-overflow` in `docs/lifecycle/work-packages/F-header-chrome-W.md`. Writer sidecar `docs/test-runs/.worker-done/C-chrome-overflow.md` (`done: true`, files: `src/components/IslandHeader.tsx` only). Verifier did not write the slice. Static read of source only. No command. No shot. No Accept.

Named acceptance: Compact overflow: no language, no About. Settings + Messages present. Visible info not overflow-only. desktop.test.ts inset 140 unchanged. Compact menu has no language and no About. Info visible at compact width.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | pass | Compact App `ToolbarOverflowMenu` has no language row and no About row | `src/components/IslandHeader.tsx` compact App items (348-388): optional `explore`/`reports`, then `settings`, `messages`, optional `logs`, optional `exit`. No `language` key, no `about` key, no `/about` href. Repo grep `key: 'language'` empty. | n/a |
| A2 | pass | Compact About `ToolbarOverflowMenu` has no language row and no About row | Compact About items (414-441): `settings`, `messages`, optional `logs`, `video` (YouTube). No language, no About, no `PageNavMenu`. | n/a |
| A3 | pass | Compact App overflow includes Settings (`key: 'settings'`) and Messages (`key: 'messages'`) | Settings 365-369 (`t('app.settings')`, opens ConfigDialog). Messages 371-375 (`t('messages.viewSystemMessages')`, InfoIcon, `openMessages`). | n/a |
| A4 | pass | Compact About overflow includes Settings and Messages | Settings 417-421, Messages 423-427, same keys/handlers as App compact. | n/a |
| A5 | pass | Visible info control at compact width, not overflow-only | Compact App cluster (341-347) and compact About (407-413) both mount `<MessageSnackbarTrigger onOpen={openMessages} />` before overflow. Trigger is a header `IconButton` (`src/views/MessageSnackbar.tsx` 51-68, 72-82). ConfigDialog/LogViewer use `hideTrigger` in compact; info does not. | n/a |
| A6 | pass | Messages overflow onClick opens the same system-messages paper | Overflow `onClick` calls `openMessages` (374, 426). `openMessages` is `shellOutlet?.setMessagesOpen(true)` (214-216). AppShell Outlet context + `<MessageSnackbar hideTrigger open={messagesOpen} onOpenChange={setMessagesOpen} />` (`src/app/App.tsx` 254-256). Same path as visible trigger. IslandHeader only under Outlet: `DataFormulator.tsx` 1060/1065, `About.tsx` 99. | n/a |
| A7 | pass | `tests/frontend/unit/app/desktop.test.ts` still has `captionInset: 140`; file not required to change | Line 29 still `captionInset: 140`. Writer sidecar did not list the test file. | n/a |
| X1 | pass | No language pills / LanguageSwitcher / LanguageMenuItems reintroduced. LanguageScreen not this slice. | Grep of `LanguageSwitcher` and `LanguageMenuItems` in `*.tsx`/`*.ts` is empty. No overflow language items. `src/views/onboarding/LanguageScreen.tsx` still exists; not in writer files list. | n/a |

## Missing / wrong / extra

- Missing vs named acceptance: none.
- Wrong: none.
- Extra vs this slice, not fail: compact App overflow still has explore/reports (workspace), logs (local), exit (session). Compact About still has logs and video. Plan required Settings + Messages present; it did not forbid those other rows.

## Evidence notes

- Paths above. No command, no shot. Reviewer did not run typecheck, lint, or build.

## Slice outcome

A1-A7 pass. X1 pass. Compact overflow has Settings and Messages, no language, no About. Visible `MessageSnackbarTrigger` stays in the compact cluster. captionInset 140 unchanged.

Verifier did not Accept. Manager decides.
