# C-chrome-messages verify

Reviewer did not write this slice. Source-only check. No typecheck, lint, build, or shots.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | pass | hideTrigger + controlled open on MessageSnackbar | `src/views/MessageSnackbar.tsx` props `open?`, `onOpenChange?`, `hideTrigger?` (167-178). `openMessages = openProp ?? openState`; `setOpenMessages` calls `onOpenChange` (189-194). | |
| A2 | pass | App mounts MessageSnackbar with hideTrigger | `src/app/App.tsx` AppShell: `const [messagesOpen, setMessagesOpen] = useState(false)` (202); `<MessageSnackbar hideTrigger open={messagesOpen} onOpenChange={setMessagesOpen} />` (256). Sole product mount. | |
| A3 | pass | No bottom-right (i) FAB on product path | App passes `hideTrigger`. FAB/trigger gated `{!hideTrigger && (` (`MessageSnackbar.tsx` 266-272). No other `<MessageSnackbar` mount. Residual `MessageTriggerButton` is not absolute FAB and is off when hideTrigger. | |
| A4 | pass | Visible info IconButton after terminal or gear on wide and compact; not overflow-only | `src/components/IslandHeader.tsx` `MessagesHeaderButton` InfoIcon (96-125). Compact app after ConfigDialog / optional LogViewer (371-377). Wide app same cluster (416-421). Compact about (431-437). Wide about (462-466). Overflow menus have no Messages row. | |
| A5 | pass | Click opens existing messages paper | Header `openMessages` -> `shellOutlet?.setMessagesOpen(true)` (244-246). Outlet context from AppShell (254). Paper Snackbar `open={openMessages}` (`MessageSnackbar.tsx` 273-275). IslandHeader only under Outlet: `DataFormulator.tsx` 1060/1065, `About.tsx` 99. | |
| A6 | pass | Toasts stay bottom-right | Paper Snackbar `anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}` (`MessageSnackbar.tsx` 275). Last-message toast same origin (391-395). | |
| A7 | pass | no-drag on new button | `MessagesHeaderButton` `className="df-no-drag"` (111). Overlay header also sets `WebkitAppRegion: 'no-drag'` on `& button` (311-315). | |
| A8 | pass | captionInset / desktop.test.ts inset 140 unchanged | `tests/frontend/unit/app/desktop.test.ts` 29 still `captionInset: 140`. `src/app/desktop.ts` still `right: api.captionInset ?? 0`. No test edit required. | |
| X1 | pass | compact overflow Messages extra if present; LanguageScreen not this slice | Overflow items: explore/reports/settings/logs/exit or settings/logs/video. No Messages overflow row. `LanguageScreen` only referenced from App.tsx gate; file not in writer sidecar. Extra unused `MessageSnackbarTrigger` + context + `children` is not X1. | |

## Missing / wrong / extra

- Extra, not fail: unused `MessageSnackbarTrigger` / `MessageSnackbarPanelContext` / `children` (`MessageSnackbar.tsx`). Header uses its own `MessagesHeaderButton` + outlet, not the trigger export.
- Extra, not fail: default `!hideTrigger` trigger is a small IconButton, not the old absolute FAB. Product path always uses hideTrigger.
- Not extra fail: no compact overflow Messages item (next slice C-chrome-overflow).

## Evidence notes

- Paths above. No command, no shot. Reviewer did not run typecheck, lint, or build.

## Manager

Do not Accept here. Manager decides.
