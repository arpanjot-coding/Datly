# Independent verify: C-cicada-recipes

Slice: `C-cicada-recipes` in `docs/lifecycle/work-packages/F-cicada-ui-W.md`. Writer sidecar `docs/test-runs/.worker-done/C-cicada-recipes.md`. Verifier did not write the slice. Static read only. Tests not executed. No Accept.

Named acceptance (package + dispatch): ConfigDialog no longer defined in App.tsx. recipes.ts exists, SxProps only (no React components). IslandShell, SegmentedPills, StatusPill exist and are not mounted on landing/workspace/AppShell. AppBar still full-bleed.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 ConfigDialog extracted | Pass | Matches. Dialog lives in its own view; App.tsx only imports and mounts it. | `src/views/ConfigDialog.tsx` line 42 `export const ConfigDialog`. Workspace grep `function ConfigDialog\|const ConfigDialog\|export const ConfigDialog` under `src/` hits only that file. `src/app/App.tsx` line 55 `import { ConfigDialog } from '../views/ConfigDialog'`; JSX at lines 961, 995, 1061 (compact App, full App, About). No `const ConfigDialog` / `function ConfigDialog` in App.tsx. | n/a |
| A2 recipes.ts SxProps only | Pass | Matches. File is SxProps recipes, no React components. | `src/app/recipes.ts` exists. Imports: `type { SxProps }` and `alpha` from MUI styles (helper, not a component). Exports `islandFieldSx`, `islandSx`, `islandHeaderSx`, `cardRecipeSx` as `SxProps`; `composerSx` as `SxProps` callback; `statusPillSx` as `(kind) => SxProps`. Grep `React\.|jsx|createElement` in `recipes.ts`: empty. No FC, no JSX. | n/a |
| A3 composites exist, unmounted | Pass | Matches. Three composites exist. Unused in AppShell / landing / workspace. | `src/components/IslandShell.tsx` line 13 `IslandShell`. `src/components/SegmentedPills.tsx` line 25 `SegmentedPills`. `src/components/StatusPill.tsx` line 16 `StatusPill`. Grep `IslandShell\|SegmentedPills\|StatusPill` under `src/`: only those three files (definitions). No import from landing (`DataFormulator.tsx`), About, or `App.tsx` / AppShell. `IslandShell` consumes `islandFieldSx`/`islandSx`; `StatusPill` consumes `statusPillSx`. Comments in the three files say unmounted until later chunks. | n/a |
| A4 AppBar still full-bleed | Pass | Matches. Island chunk owns removing full-bleed AppBar. This slice must keep it. | `src/app/App.tsx` lines 114-124 styled `MuiAppBar`; AppShell lines 892-1054 wrap chrome in `<AppBar position="static">` then `<Outlet />` (landing/workspace still under the bar). Toolbar still 52px (lines 896-898). `src/app/theme.ts` lines 66-75 still override `MuiAppBar` (cream/ink, border, blur). No IslandHeader. | n/a |
| G1 MUI overrides | Pass | Matches chunk goal: overrides in theme, recipes stay SxProps. | `src/app/theme.ts` `createDatlyTheme` `components`: CssBaseline (incl. `--df-island-inset`), AppBar, Paper, Dialog, DialogTitle, Menu, MenuList, Popover, Tooltip, Chip, OutlinedInput, TableHead, TableCell, Slider, Alert, Button (soft/toolbar), IconButton, Link. `App.tsx` line 19 import, line 1231 `createDatlyTheme(activePaletteKey)`. | n/a |

## Slice outcome

Named acceptance A1-A4 Pass. Goal G1 Pass. Composites are present and unused. ConfigDialog is extracted. AppBar remains full-bleed for C-cicada-island.

Verifier did not run vitest, did not take shots. Manager decides.
