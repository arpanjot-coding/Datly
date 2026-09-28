# Independent verify: C-loader-pulse

Slice: `C-loader-pulse` in `docs/lifecycle/work-packages/F-header-chrome-W.md`. Writer sidecar `docs/test-runs/.worker-done/C-loader-pulse.md` (`done: true`, files: `src/components/AnvilLoader.tsx` only). Harvest was sidecar-only; this verify read the component and both mounts, not file existence. Verifier did not write the slice. Static read of source only. No command. No shot. No Accept.

Named acceptance: AnvilLoader shows the fire mark, no 0/1 cells. App first paint and session Backdrop still use AnvilLoader. Delete BinaryGrid. Import df-logo.svg at 52x48. Opacity pulse only. prefers-reduced-motion: still logo, no animation. Keep label and action API.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 BinaryGrid deleted | pass | Matches. No 0/1 cells, no ROWS/COLS interval grid. | `src/components/AnvilLoader.tsx` (1-70) has no `BinaryGrid`, `ROWS`, `COLS`, `CYCLE_MS`, `setInterval`, or digit cells. Grep `BinaryGrid` under `src/` is empty. Mark is one `Box component="img"` (30-47), not a Courier grid. | n/a |
| A2 df-logo.svg 52x48 | pass | Matches. Fire mark imported at landing sm size. | `import dfLogo from '../assets/df-logo.svg'` (`AnvilLoader.tsx` 4). Img `src={dfLogo}` `width={52}` `height={48}` and `sx` width/height 52/48 (31-38). Asset `src/assets/df-logo.svg` is the faceted gold bonfire (title Datly). Same SVG as landing `DataFormulator.tsx` 57. | n/a |
| A3 opacity pulse only | pass | Matches. CSS opacity keyframes only. | `pulse` keyframes (`AnvilLoader.tsx` 6-8): 0%/100% opacity 0.4, 50% opacity 1. Applied `animation: ${pulse} 2.5s ease-in-out infinite` (41). No scale, rotate, translate, transform, filter, or SVG path animation in this file. | n/a |
| A4 prefers-reduced-motion | pass | Matches. Still logo, animation none. | `@media (prefers-reduced-motion: reduce)` sets `animation: 'none'` and `opacity: 1` on the mark (`AnvilLoader.tsx` 42-45). Logo remains visible; it does not freeze at the 0.4 keyframe. | n/a |
| A5 label and action API | pass | Matches. Slots kept. | `AnvilLoaderProps` still exports `height`, `label`, `action`, `sx` (11-20). Destructure on the function (22). Label `Typography` still renders when `label !== undefined` (50-64). `{action}` unstyled beside the label (65). Outer column still centered, `gap: 3`, height/sx passthrough (24-28). | n/a |
| A6 App first paint | pass | Matches. First paint still AnvilLoader. | `src/app/App.tsx` 47 imports `AnvilLoader`. Gate `configLoaded && authChecked` (461); else branch mounts `<AnvilLoader label={t('app.loadingProduct')} action={isDesktopApp ? View backend log Link : ...}>` (481-498). LanguageScreen still overlays after that gate (474-478), not inside the loader. | n/a |
| A7 session Backdrop | pass | Matches. Session wait still AnvilLoader. | `src/views/DataFormulator.tsx` 39 imports `AnvilLoader`. `Backdrop` `open={sessionLoading}` zIndex 999 (1087-1097) wraps `<AnvilLoader height="100%" label={sessionLoadingLabel \|\| t('session.loadingSessions')} action={Cancel Button} sx={{ width: '100%' }}>` (1099-1113). Cancel still `setSessionLoading({ loading: false })`. | n/a |
| X1 out of scope files | pass | Matches. This slice is AnvilLoader only. | Writer sidecar lists only `src/components/AnvilLoader.tsx`. `IslandHeader.tsx` and `About.tsx` still exist with their own `df-logo.svg` imports (not loader mounts). `LanguageScreen` still exists and still mounts from `App.tsx` 474-478. This verify did not run git log. | n/a |

## Missing / wrong / extra

- Missing vs named acceptance: none.
- Wrong: none.
- Extra vs this slice: none. Header chrome, LanguageScreen rewrite, About.tsx delete, F-model-card, and new palette were not part of the sidecar files list.

## Residual (not a fail)

- UI-expert asked rest opacity ~0.9 under reduced-motion; implementation uses `opacity: 1`. W only requires a still logo and no animation.
- UI-expert asked to keep the label Typography's own 2.5s pulse. Current label has no animation (`AnvilLoader.tsx` 51-63). W only requires the label/action API.
- Optional `aria-busy` from UI notes is absent. Not in W acceptance.
- No desktop shot, no first-paint capture, no vitest.

## Slice outcome

Acceptance A1-A7 pass. Out of scope X1 pass. AnvilLoader shows the df-logo.svg fire mark at 52x48 with an opacity pulse; BinaryGrid is gone from `src/`. App first paint and DataFormulator session Backdrop still mount AnvilLoader with label and action.

Verifier did not Accept. Manager decides.
