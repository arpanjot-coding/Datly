# UI-expert: F-cicada-ui

Feature: F-cicada-ui  
Session focus: desktop. Ship: web + desktop.  
Do not implement. Do not plan other jobs.

Visual SSOT: `docs/lifecycle/reports/cicada-ui-chart-redesign-2026-08-19.md`  
Refs read: `ref-1-dashboard.png`, `ref-3-analytics.png`, `cicada.png`, `frames/frame-02.jpg`, `frames/frame-07.jpg`, `frames/frame-08.jpg`.

## 1. Meaning

Make the shipped Datly chrome and house Vega charts read as Cicada editorial light (sage field, cream islands, one forest accent, paper plots) while the user job stays catalog, data thread, encode/chart/grid, optional report.

Out of scope: Cicada Preview / Codex / Design tabs, Voice, credits / Upgrade-to-Business, Figma Connect, purple 12-column specimens, chat-only editor, Night / dark theme, professional data-IDE (SQL workbench, notebooks, command palette), Tailwind / shadcn restack, Google Sans, silent Data Formulator rename, backend / assemble-pipeline / encoding-scheme changes, unwinding LanguageScreen or the model wall.

## 2. Place / plug-in

No new route. Restyle the three existing places. Keep landing, workspace, and About. Keep the sidebar Sessions tab.

| Place | Live plug-in | After restyle |
|-------|----------------|---------------|
| First-run language | `LanguageScreen` overlay, `zIndex: 2000`, sage canvas, 52px drag spacer, `no-drag` on cards/Continue (`src/views/onboarding/LanguageScreen.tsx`, gated in `AppFC`) | Same gate and overlay. Pick up paper cards / forest check. Do not fold it into `IslandHeader`. |
| Model wall | `DataFormulator.tsx` overlay `zIndex: 1000` when `selectedModelId == undefined`; inline `ModelSelectionButton` | Same wall and z-order (under LanguageScreen). Card uses island / paper recipe. |
| Landing (`/` app, no `activeWorkspace`) | `DataFormulator` hero + stacked `AgentChatInput` under full-bleed 52px `AppBar` | One cream `IslandShell` on sage. `IslandHeader variant="landing"`. No fake sidebar. |
| Workspace | `AppShell` AppBar + `DataSourceSidebar` + Allotment (`DataThread` \| `VisualizationView` / `ReportView`) | Sage field; sidebar island (Sources / **Sessions** / Knowledge); workspace island with in-island header + existing split. |
| About | `src/views/About.tsx` under the same AppBar | One `IslandShell` + `IslandHeader variant="about"`. Keep About / App `TopNavButton`s. |
| Charts | `DATLY_CHART_THEME` via `assembleVegaChart` → flint-chart; PNG fills in `chartCache` + `ChartRenderService` | House ink on `surface.paper`. Compiler contract unchanged. |

Keep as-is (restyle only):

- Sidebar rail tabs `sources \| sessions \| knowledge` (`DataSourceSidebar.tsx`). Sessions is the full open / rename / delete list. Header `WorkspaceMenu` stays a compact switcher, not a Sessions replacement.
- `viewMode` Explore / Reports as new `SegmentedPills` in the workspace header only. Not a replacement for About / App.
- Auth trailing. Overflow menu. Local log viewer. Exit session.
- Phone `max-width: 699px` Thread / Canvas `Tabs` swap. Island radius steps to `lg`.
- `Cmd+,` / `Ctrl+,` Preferences (`App.tsx` ~1161) and `electronAPI.onOpenPreferences`. Do not steal other system shortcuts.

Not a second switcher to delete: `WorkspacePickerDialog` / `WorkspaceMenu` in the AppBar. Restyle both switchers.

## 3. Approach

Steal Cicada **visual language**. Do not copy Cicada **IA**.

### What the refs actually give us

| Steal (look) | From | Datly mapping |
|--------------|------|----------------|
| Sage field around 24–28px cream islands; header **inside** the island | `ref-1-dashboard.png`, `frame-07.jpg`, `frame-08.jpg` | `surface.canvas` `#d5dbd2` on `AppShell`; `IslandShell` `radius.island` 28 / sidebar `xl` 24; drop full-bleed AppBar |
| One forest fill for primary (Publish / Get Started / +) | All refs | `#1f6b4a` contained buttons and send. White label. No elevation. |
| Hairline borders, almost no shadow, paper cards | Kit stills `ref-3-analytics.png` / `cicada.png` | `borderColor.*`, `shadow.sm` only, `cardRecipeSx` |
| Workspace card + chevron; list popover with check + create | Kit workspace picker | Compact `WorkspaceMenu` in `IslandHeader`. Not the Sessions tab. |
| Active / Offline / dashed In-progress pills | Kit sidebar + task card | `StatusPill` on connectors. Do not add Cicada project tree IA. |
| Sliding segmented thumb on a muted track | Dashboard Preview/Codex/Design chrome | **Explore / Reports** only (`viewMode`). Do not add Preview / Codex / Design. |
| Composer docked at the bottom of the chat column; model name as a quiet footer pill | `ref-1-dashboard.png` (GPT 5.5 ▾) | End state PR-5: landing stacked `AgentChatInput` + thread `SimpleChartRecBox`. Header keeps the picker until then. |
| In Progress / Ready grouped cards | `frame-02.jpg`, `frame-07.jpg`, kit | Visual recipe for thread / session rows. Not a new task-board place. |
| Quiet 400/500/600 grotesque, tight tracking on titles | Dashboard + landing frames | Stay Segoe UI. Drop Roboto `@fontsource`. Do not load Google Sans. |
| Paper / cream chart field, not stark white | Implied by island + kit type cards | House `ink.surface.plot/canvas` = `surface.paper`. |

Do **not** steal: Voice button, credits bar, Buy credits, Upgrade-to-Business gift tile, Light/Night segmented, Figma Connect, Share/Publish product actions, purple grid specimen, chat-as-only-editor, marketing hero from `frame-02.jpg` / `frame-08.jpg` as Datly IA.

### Stack (locked)

TypeScript + React 18 + Vite + **MUI** + Redux Toolkit + Vega / Vega-Lite via flint-chart. Tokens in `src/app/tokens.ts`. No Tailwind, no shadcn, no new component library. `design-ui` anti-slop and token discipline apply; its Tailwind `@theme` / shadcn defaults do **not**.

Live gap (still true 2026-08-19):

- `defaultPaletteKey = 'cicada'` but `dfSlice` `config.paletteKey: 'fluent'` and persist keeps fluent.
- `createTheme` still inline in `App.tsx` ~1547. No `theme.ts`, no `recipes.ts`, no `IslandShell` / `IslandHeader` / `SegmentedPills` / `StatusPill`.
- AppBar `height: 52` vs layout book `appBar: 48`. Full-bleed frosted bar.
- Leftover Material / Fluent blue still in sidebar, DataView, snackbar, MarkdownEditor, AgentRules, VisualizationView hover, Allotment `--focus-border: #007fd4`.
- House categorical hues 2–5 still sage (`#3d6b5c`, `#8a7a5c`, `#2f5448`, `#4a5a4e`). Plot fill `#ffffff`. PNG / report fills `'white'` / `#ffffff`.
- `LanguageScreen` already uses sage + paper tokens. Leave its job alone; only paint.

Highest-leverage order matches the design doc: tokens + leftover blue + theme extract, then recipes, then island shell, then sidebar / composer, then cards, then chart house, then type / settings / QA.

### Desktop (session focus)

- Overlay titlebar: today `electronTitlebarInsets()` pads the AppBar; `.df-titlebar` is `drag`; buttons / links / inputs / `[role=button]` / MUI input/select are `no-drag` (`src/index.css`, Toolbar sx). After the island: **sage inset + IslandHeader** stay drag; the same no-drag list on header controls. Traffic / caption insets become `pl` / `pr` on `IslandHeader`, not a ghost AppBar.
- `LanguageScreen` already sets overlay `drag` and control `no-drag`. Keep that when chrome moves.
- Min window `MIN_SUPPORTED` 1024×600. Primary CTAs (landing send, model-wall model button, LanguageScreen Continue, workspace send) must remain visible. Do not buy inset by shrinking `minChartHeight`.
- `Cmd+,` / `Ctrl+,` stays Preferences (language row). No new shortcut map required for this restyle. Keep Mac vs Win/Linux copy honest if any new shortcut string appears.

## 4. Verdict draft: SHAPE

Fits the product job. IA does not need a user decision. Keep Datly places (landing / workspace / About), keep Sessions, keep encoding shelf, keep agent as sidecar, keep LanguageScreen above the model wall.

Not **FIT**: live chrome is still Data Formulator (full-bleed AppBar, fluent persist, white plots, leftover blue). The island + header-in-island + paper house is a real shape change.

Not **ASK**: Preview/Codex/Design, Voice, credits, and chat-only editor are explicit non-goals. No product loop.

Not **UNFIT**: stack, panes, and compiler contract stay.

```
LanguageScreen (if first-run) → model wall (if no model) → landing island
  → open / create session → workspace islands (sidebar + header + thread | canvas)
  → Explore / Reports stays viewMode, not a new app
About stays a third island, reachable from About / App nav
```

## 5. Risks / plan must not break

| Risk | Why it is live | Mitigation |
|------|----------------|------------|
| **LanguageScreen** | Overlay `zIndex: 2000`, `inert` on the router, `id="language-screen-title"` blocks Preferences, drag spacer 52px | Do not remount it inside `IslandHeader`. Do not drop sage overlay. If header height becomes 44, keep a dedicated titlebar drag strip on the picker (52 is fine; it is not in `minimumShellBudget`). Tokens-only paint in PR-8. |
| **Model wall** | `zIndex: 1000` card, `appearance="inline"` picker | Restyle card. Do not remove or lower under LanguageScreen. Do not add a model footer to `DataLoadingChat`. |
| **Encodings** | User `encoding.scheme` and Flint `THEME_PRESETS` win over the house | Change only `DATLY_CHART_THEME` when `themeId` is null. Keep hues 0–1 `#1f6b4a` / `#b4532a`. Replace 2–5 with slate / ochre / steel / plum. Do not forest-paint every series. |
| **Titlebar drag** | Frameless Electron overlay + `LanguageScreen` drag | After AppBar dies, `.df-titlebar` (or equivalent) must sit on sage + header. Audit `no-drag` on new `SegmentedPills`, workspace card, footer model pill, Auth. pywebview / `?desktop=1` without overlay still must not clip CTAs. |
| **600px height** | Live `minimumShellBudget` = `appBar(48) + shellChrome(24) + 360 + 32 + 3×25 + tabBar(36) + 20` = 595. Live Toolbar is **52**. `canvas.tabBar` is phone-only | PR-3 must land `appBar: 44`, `islandInset: 8`, drop tabBar from the **desktop** height sum, publish **547**, and update `describe('minimum screen budget')` in `layout.test.ts`. Visual inset 16px only when `heightClass !== 'short'`, via `--df-island-inset`, **not** in the budget. Comfortable may still fail the floor. |
| Stale thread PNGs | persist is **not** blacklisting `chartThumbnails`; `computeCacheKey` does not hash the house; fills are white | PR-1: `DF_STATE_VERSION` 4→5, fluent→cicada, `chartThumbnails: {}`, persist blacklist. PR-7: bake `HOUSE_THEME_REVISION` inside the existing key signature; paper fills in **both** `downscaleImageForAgent` and `ChartRenderService.scalePngDown`. |
| `radius.sm` 1.5→2 | Encoding / knowledge / upload / rules / ops cards use 1.5 | Keep 1.5. Add `xs` / `xl` / `island`. |
| `radius.pill` on rect panes | `DataFormulator` `borderBoxStyle` and `DataLoadingChat` ~1922 | PR-3 vis pane; PR-6 DataLoadingChat. Then maybe re-tint outer Allotment sash; default leave outer `--separator-border: transparent`. |
| Two workspace switchers | Sessions tab + AppBar dialog | Restyle both. Deleting Sessions is an IA change. |
| Settings rainbow | `ConfigDialog` maps all `paletteKeys` | PR-9: Cicada + Mono always; rest under `DEV_MODE`. |
| i18n | New strings need `en` + `zh` only | Wire existing `appBar.explore` / `reports`. Do not paste English into ja/ko/fr/de. |
| Debug logs | `WorkspaceMenu` three `console.log`s; `AppFC` `[DEBUG] activeWorkspace` / `tables` | Delete in PR-4. |
| Type bump vs 248px cards | `TEXT_RAMP.reference.md` is 13 | PR-8 type only. Do not touch `DENSITY_SCALE` or `thread.cardWidth`. |

## 6. Suggested chunks (aligned with design-doc PR-1..PR-10)

Live tree still matches the design-doc split: no `theme.ts` / `recipes.ts` / island composites; `ConfigDialog` and `WorkspaceMenu` still live in `App.tsx`; chart house and blues unchanged. Keep this order. PR-4 ∥ PR-5 after PR-3.

- **C-cicada-tokens** (PR-1) — `tokens.ts` (`xs` / `xl` / `island`, `status`, `surface.island/plot`; keep `sm: 1.5`); extract `createDatlyTheme` to `src/app/theme.ts`; leftover-blue grep under `src/` excluding `palettes.fluent` / `material`; `dfSlice` default `cicada`; persist v5 + thumbnail blacklist; drop Roboto (keep Roboto Mono); Allotment `--df-focus-border`.
- **C-cicada-recipes** (PR-2) — MUI overrides; `recipes.ts` SxProps only; add unmounted `IslandShell`, `SegmentedPills`, `StatusPill`; extract `ConfigDialog.tsx`.
- **C-cicada-island** (PR-3) — Mount sage + two islands; `IslandHeader` variants landing / workspace / about; **model picker stays in the header**; keep About / App; wire Explore / Reports; mechanical `WorkspaceMenu.tsx` extract (still a dialog); `appBar: 44`, `islandInset: 8`, `--df-island-inset`; vis pane off `radius.pill`; desktop drag on sage + header; update `minimum screen budget` tests. CTA visible at 1024×600.
- **C-cicada-sidebar** (PR-4) — Sidebar island + Sessions restyle (do not delete); `StatusPill`; compact header workspace card / origin-aware menu; delete debug logs; sage-facing margin = `var(--df-island-inset)`.
- **C-cicada-composer** (PR-5) — `appearance: 'footer'` on landing stacked input + `SimpleChartRecBox`; then remove header model. **No** footer on `DataLoadingChat`.
- **C-cicada-cards** (PR-6) — Thread / example / encoding / dialog radii; selected = forest hairline; `DataLoadingChat` ~1922 pill → `lg`.
- **C-cicada-charts** (PR-7) — House paper plot; categorical 2–5; tooltip CSS; PNG / report fills; `HOUSE_THEME_REVISION` inside `computeCacheKey`; recolor `#76c6ff` chart icons. No encoding / flint preset / assemble-option changes. QA: bar, line, scatter, pie, map, KPI, tooltip, variant, refresh thumbnails.
- **C-cicada-type** (PR-8) — `TEXT_RAMP` md=14 / lg=15 only; leftover About / report toolbar / **LanguageScreen paint**. No length token edits.
- **C-cicada-settings** (PR-9) — Settings Cicada + Mono; Advanced iff `DEV_MODE`; reduced-motion in `MuiCssBaseline`; en+zh chrome strings.
- **C-cicada-qa** (PR-10) — Dead Sass (vega-actions unused; bump keyframes blue); leftover `'white'` overlays; grep gate; desktop chrome shot + 1024×600 + 1280×800.

Proof (when implemented): `desktop-landing-default.png` (titlebar visible), `desktop-workspace-default.png`, `desktop-workspace-min-w1024h600.png`, `web-workspace-default-w1280.png`, plus LanguageScreen and model-wall overlays so first-run is not a second visual language.
