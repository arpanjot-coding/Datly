# Cicada chrome + chart restyle — live neighborhood

Grounded in `src/` as of 2026-08-19. Not a design proposal. Paths are workspace-absolute. No Tailwind/shadcn.

Design brief: [docs/lifecycle/reports/cicada-ui-chart-redesign-2026-08-19.md](D:\Coding\Main\Datly\docs\lifecycle\reports\cicada-ui-chart-redesign-2026-08-19.md).

---

## 1. File inventory

### Tokens, theme, type

| Path | Role |
|---|---|
| `src/app/tokens.ts` | Surfaces, borders, shadows, motion, radius, palettes, `defaultPaletteKey`. |
| `src/app/App.tsx` | `createTheme` (~1547), styled `AppBar`, `AppShell`, Settings `ConfigDialog`, `WorkspaceMenu`. |
| `src/app/layout.ts` | `REFERENCE` geometry, `TEXT_RAMP`, `minimumShellBudget`, `MIN_SUPPORTED` 1024x600. |
| `src/app/LayoutProvider.tsx` | Publishes `--df-text-*` / `--df-icon-*` per density. |
| `src/index.css` | Roboto + Roboto Mono imports; `:root` type seeds; sage `html/body`; `.df-titlebar` drag. |
| `src/mui.d.ts` | Extra MUI button variants (`soft`, `toolbar`). |
| `src/scss/App.scss` | Allotment sash `--focus-border` and separator vars. |

Missing today (named in the brief, not in tree): `src/app/theme.ts`, `src/app/recipes.ts`, `HOUSE_THEME_REVISION`, `src/components/IslandShell.tsx`, `IslandHeader.tsx`, `SegmentedPills.tsx`, `StatusPill.tsx`.

### Shell / landing / about

| Path | Role |
|---|---|
| `src/app/App.tsx` (`AppShell`) | Full-bleed sage field, 52px `AppBar`, outlet, snackbar, `ChartRenderService`, desktop drag. |
| `src/app/desktop.ts` | `electronTitlebarInsets()` traffic/caption + overlay flag. |
| `src/views/DataFormulator.tsx` | Landing hero + workspace island (`fixedSplitPane`), vis pane `radius.pill`. |
| `src/views/About.tsx` | About page; some `radius.pill` chrome. |
| `src/views/ExampleSessions.tsx` | Landing demo cards (`#ffffff` fill). |
| `src/components/AnvilLoader.tsx` | Session loader + `windowWipe`. |

### Sidebar

| Path | Role |
|---|---|
| `src/views/DataSourceSidebar.tsx` | Rail + panel; tabs `sources \| sessions \| knowledge`; selected Material-blue tint. |
| `src/components/CatalogTree.tsx` | Connector catalog tree (selected via `action.selected`). |
| `src/components/VirtualizedCatalogTree.tsx` | Windowed catalog tree. |
| `src/views/KnowledgePanel.tsx` | Knowledge tab body. |
| `src/components/ResizeHandle.tsx` | Sidebar width drag. |

### Composer / model

| Path | Role |
|---|---|
| `src/views/AgentChatInput.tsx` | Landing stacked composer; hardcoded `'12px'` + Google-elevation shadows. |
| `src/views/SimpleChartRecBox.tsx` | Thread composer card (`borderRadius: '12px'`); no model footer. |
| `src/views/DataLoadingChat.tsx` | Inline data-loading chat; vis pane clone uses `radius.pill` (~1922). |
| `src/views/ModelSelectionDialog.tsx` | `ModelSelectionButton` `appearance?: 'toolbar' \| 'inline'` only. |
| `src/views/UnifiedDataUploadDialog.tsx` | Upload / connector dialog hosting the inline chat. |

### Thread cards

| Path | Role |
|---|---|
| `src/views/DataThread.tsx` | Column cards (`entrySx` white + `radius.md`); `'3px'`/`'6px'` inners; selected `primary.light` ring. |
| `src/views/DataThreadCards.tsx` | Inner chart/table cards, `borderRadius: '6px'`. |
| `src/views/SourceTableShelf.tsx` | Source-shelf card using `entrySx`. |
| `src/views/threadLayout.ts` | Thread column geometry used by `DataThread` + Allotment snap. |
| `src/components/DataOperationCard.tsx` | Op cards (uses `radius.sm`). |

### Charts / encoding / export

| Path | Role |
|---|---|
| `src/app/chartTheme.ts` | House Vega theme `DATLY_CHART_THEME`. |
| `src/app/chartCache.ts` | In-memory SVG/PNG cache; `computeCacheKey`; `downscaleImageForAgent` white fill. |
| `src/app/utils.tsx` | `assembleVegaChart` passes `theme_spec: themeId ?? DATLY_CHART_THEME`. |
| `src/app/restyle.ts` | `/api/agent/chart-restyle` assemble path (contract stay). |
| `src/views/VisualizationView.tsx` | Focused canvas; Vega embed `background: null`; action hover blue. |
| `src/views/ChartRenderService.tsx` | Headless compile; `scalePngDown` white fill; writes `chartThumbnails`. |
| `src/views/ChartVariantStrip.tsx` | Flint `THEME_PRESETS` chips. |
| `src/views/ChartQuickConfig.tsx` | Plot-adjacent config popovers. |
| `src/components/ChartTemplates.tsx` | Chart-type catalog + icon mapping. |
| `src/assets/chart-icon-*.svg` | Type icons; primary series `#76c6ff`. |
| `src/views/EncodingShelfCard.tsx` | Encoding shelf + `'12px'` poppers. |
| `src/views/EncodingBox.tsx` | Channel boxes (`radius.sm`). |
| `src/views/EncodingShelfThread.tsx` | Thread-side encoding. |
| `src/scss/EncodingShelf.scss` | Shelf Sass (`.auto-sort-option-label` `#fff`). |
| `src/scss/VisualizationView.scss` | Thumbnail radius; `@keyframes bump` Fluent-blue flash. |
| `src/views/DataView.tsx` | Data grid chrome; hover `rgba(25, 118, 210, 0.25)`. |
| `src/scss/DataView.scss` | Original-column underline `#0288d1`. |
| `src/views/ReportView.tsx` | Report embed + html2canvas/print `#ffffff`. |
| `src/views/ChartifactDialog.tsx` | Export fill `#ffffff`. |

### Persist / leftover chrome

| Path | Role |
|---|---|
| `src/app/dfSlice.tsx` | Initial `config.paletteKey: 'fluent'`; `chartThumbnails` slice; `loadState` resets thumbs. |
| `src/app/store.ts` | redux-persist localforage blacklist (does **not** include `chartThumbnails`). |
| `src/app/useAutoSave.tsx` | Workspace zip excludes `chartThumbnails`. |
| `src/app/stateMigrations.ts` | `DF_STATE_VERSION = 4` (no v5 fluent/thumbnail migrate). |
| `src/views/MessageSnackbar.tsx` | Toast `TYPE_COLORS` Material blues/greens. |
| `src/views/AgentRulesDialog.tsx` | Selected-row inset sash Material blue. |
| `src/components/MarkdownEditor.tsx` | Caret + selection `#1976d2` / `rgba(25, 118, 210, *)`. |

---

## 2. Live facts

### `defaultPaletteKey` vs `dfSlice.paletteKey`

- `src/app/tokens.ts` line 267: `export const defaultPaletteKey: keyof typeof palettes = 'cicada'`.
- `src/app/dfSlice.tsx` line 358: initial `config.paletteKey: 'fluent'`.
- `src/app/App.tsx` ~1388–1389: `activePaletteKey = (rawPaletteKey && palettes[rawPaletteKey]) ? rawPaletteKey : defaultPaletteKey`. Missing/unknown keys fall back to cicada. A stored `'fluent'` key is valid and stays Fluent.
- Settings `ConfigDialog` maps all `paletteKeys` (material, fluent, vivid, jewel, electric, coastal, copilot, cicada, evergreen, orchid, mono). Reset-to-default writes `defaultPaletteKey` (`cicada`).
- redux-persist (`store.ts` localforage) rehydrates `config`, so existing sessions keep Fluent.

### Sash color

`src/scss/App.scss`:

- `.outer-allotment`: `--separator-border: transparent !important`; `--focus-border: #007fd4 !important`.
- `.inner-allotment`: `--separator-border: rgba(128, 128, 128, 0.35) !important`; `--focus-border: #007fd4 !important`.

`DataFormulator.tsx` hover paints `background: 'var(--focus-border)'` on the vertical sash, so hover is Fluent `#007fd4`.

### Live house categorical

`DATLY_CHART_THEME.ink.series.categorical` (`src/app/chartTheme.ts`):

```
['#1f6b4a', '#b4532a', '#3d6b5c', '#8a7a5c', '#2f5448', '#4a5a4e']
```

`series.single` and `accent` are `#1f6b4a`. Plot/canvas surfaces are `surface.card` (`#ffffff`). Test lock: `tests/frontend/unit/app/chartTheme.test.ts` asserts `[0] === '#1f6b4a'`, `[1] === '#b4532a'`, `plot === '#ffffff'`.

`computeCacheKey` (`chartCache.ts`) JSON fields: chartType, encodingMap, config, tableRowCount, tableContentHash, tableMetadata, activeVariantId, activeVariantSpec, fieldSemantics, `themeId: themeId || null`. No house revision. Default house is `themeId` undefined/`null`.

### AppBar height vs `tokens.appBar`

- Live `Toolbar` (`App.tsx` 1212–1214): `height: 52`, `minHeight: 52`.
- `REFERENCE.appBar` (`layout.ts` 116): `48`.
- `minimumShellBudget` height: `appBar(48) + shellChrome(24) + minChartHeight(360) + grid.header(32) + 3×row(25) + tabBar(36) + padding(20) = 595` vs `MIN_SUPPORTED.height = 600`.
- Live chrome is 4px taller than the book. `canvas.tabBar` (36) is only mounted on phone (`max-width: 699px` in `DataFormulator.tsx`); it is still counted in the 600px desktop budget.

`AppBar` surface: styled component `alpha(surface.paper, 0.9)` + theme override `alpha(surface.paper, 0.88)`, `borderBottom` divider, `backdropFilter: blur(12px)`, not primary-filled.

### Sidebar tabs

`dataSourceSidebarTab: 'sources' | 'sessions' | 'knowledge'`. Default comment + fallback: `'sources'`. Rail icons (order in `DataSourceSidebar.tsx`): Add data, **Sessions** (`FolderOutlined`), Sources (`RelationalDBIcon`), Knowledge (`LightbulbOutlined`). Sessions is a full open/rename/delete/import/export list, not a stub.

Second switcher: `WorkspaceMenu` → `WorkspacePickerDialog` in the AppBar (workspace page only).

Selected connector row tint (expanded): `rgba(25, 118, 210, 0.055)` rest, `rgba(25, 118, 210, 0.085)` hover (`DataSourceSidebar.tsx` ~1875).

Panel header: `borderBottom: 1px solid rgba(0, 0, 0, 0.16)`, `backgroundColor: rgba(255, 255, 255, 0.76)`. Panel fill: `rgba(0, 0, 0, 0.018)`.

### Island / pill / thread (live)

- Workspace content card (`DataFormulator.tsx` `fixedSplitPane`): `margin: 0 8px 8px 8px`, `backgroundColor: surface.card` (`#ffffff`), `borderRadius: radius.md` (12px), hairline `borderColor.component`.
- Vis pane `borderBoxStyle`: `borderRadius: radius.pill` (`999px`). Same pattern `DataLoadingChat.tsx` ~1922.
- Thread `entrySx`: `backgroundColor: 'white'`, `borderRadius: radius.md`. Inner cards `'3px'` / `'6px'`. Selected: `boxShadow: 0 0 0 2px ${theme.palette.primary.light}`.
- Landing composer wrap: `surface.card`, `radius.lg` (16px), `shadow.md`.
- Theme `fontFamily`: `"Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"`.
- `TEXT_RAMP.reference.md = 13`. `index.css` `--df-text-md: 13px`.
- `ModelSelectionButton` lives in `AppShell` trailing AppBar (`appearance` default `'toolbar'`). No `footer` appearance.

---

## 3. Leftover Fluent / Material blue sites (quote hex)

Grep gate from the brief: `#007fd4|#0288d1|#1976d2|25, 118, 210`. Keep `#0078d4` / `#1565c0` inside `palettes.fluent` / `palettes.material`.

| Hex / rgba | File | Use |
|---|---|---|
| `#007fd4` | `src/scss/App.scss` 135, 147 | Allotment `--focus-border` (outer + inner). |
| `rgba(25, 118, 210, 0.055)` / `0.085` | `src/views/DataSourceSidebar.tsx` ~1875 | Expanded connector selected fill / hover. |
| `rgba(25, 118, 210, 0.08)` | `src/views/VisualizationView.tsx` 1145 | Canvas action-button hover. |
| `rgba(25, 118, 210, 0.08)` + `inset 2px 0 0 rgba(25, 118, 210, 0.8)` | `src/views/AgentRulesDialog.tsx` 284–285 | Selected rule sash. |
| `#1976d2` caret; `rgba(25, 118, 210, 0.045 / 0.16 / 0.08)` | `src/components/MarkdownEditor.tsx` 30–66 | Caret, selection, wrap toggle. |
| `rgba(25, 118, 210, 0.25)` | `src/views/DataView.tsx` 324 | Grid card hover glow. |
| `#0288d1` | `src/scss/DataView.scss` 92 | `.original` header underline. |
| `#0288d1` | `src/views/MessageSnackbar.tsx` 36, 284 | `TYPE_COLORS.info` + details link. |
| `rgba(2, 136, 209, 0.2)` | `src/scss/VisualizationView.scss` 81 | `@keyframes bump`. |

Related (not in the chrome grep, but still Fluent-blue chrome/icons):

- `#76c6ff` on `src/assets/chart-icon-*.svg` (primary series).
- `#0078d4` only in `palettes.fluent.primary.main`.
- `#1565c0` only in `palettes.material.primary.main`.
- `node_modules/allotment/dist/style.css` default `--focus-border: #007fd4` (overridden by App.scss).

---

## 4. What already matches Cicada

- Surfaces (`tokens.ts`): canvas `#d5dbd2`, paper `#f3f5f0`, card `#ffffff`, ink `#1c231d`, muted `#5c665e`.
- `palettes.cicada`: primary `#1f6b4a` / bgcolor `#e4efe8` / textColor `#18563c`; warning `#b4532a`.
- `defaultPaletteKey = 'cicada'` (new sessions without a stored key).
- Hairlines `rgba(28, 35, 29, 0.10/0.08)`; ink-tinted `shadow.*`; `pressScale.down = scale(0.96)`; 150–200ms `transition.*`.
- `html, body` and `AppShell` `backgroundColor: surface.canvas` (`#d5dbd2`). Theme `background.default = canvas`, `paper`, `text.primary/secondary` ink/muted.
- AppBar is frosted paper, not primary-filled.
- Workspace already sits in an inset rounded card (`fixedSplitPane`).
- Landing hero: 44px / 500 / `-0.04em` + stacked `AgentChatInput`.
- House `series.single` / hues 0–1 already forest + terracotta (`#1f6b4a`, `#b4532a`). Sequential/diverging already forest↔terracotta.
- Charts assemble through `assembleVegaChart` → flint `theme_spec: themeId ?? DATLY_CHART_THEME`.
- Embed `background: null` (`VisualizationView.tsx` 728) so the island can show through.
- `floatingPillSx` hover already targets `primary.main` (forest when cicada is active).
- Encoding slider already uses forest focus `rgba(31, 107, 74, 0.16)` (brief).
- `sidebarEdge` tokens exist for the resize edge.

---

## 5. Risks

### 1024×600 (`MIN_SUPPORTED`)

`minimumShellBudget` is already 595/600 at reference with **book** `appBar` 48. Live Toolbar is **52**. Adding a sage inset (`2×8`) plus keeping 52px (or even 48) overruns 600 unless `appBar` drops (brief: 44) **and** desktop `canvas.tabBar` is omitted from the height sum.

`clampDensityForViewport` + `layout.test.ts` `describe('minimum screen budget')` must stay in lockstep. Comfortable (`k=1.15`) already fails the floor; that assertion must remain true.

Width budget is `rail(40) + threadPaneWidthFor(1) + canvas.min(500) + shellChrome(24) = 844 ≤ 1024`. Do not grow `thread.cardWidth` (248) in a type-ramp PR (`layout.test.ts` “is the app as hardcoded today”).

Phone (`max-width: 699`) is outside the 1024 floor; 28px island corners on a 36px tab bar will eat chrome.

### Titlebar drag

Today drag is:

1. `AppBar` `className={titlebar.overlay ? 'df-titlebar' : undefined}` (`index.css`: `-webkit-app-region: drag`).
2. Toolbar `sx` repeats `WebkitAppRegion: 'drag'` plus no-drag on `button, a, input, [role=button], .MuiInputBase-root, .MuiSelect-root`.
3. `electronTitlebarInsets()` pads `pl`/`pr` for traffic/caption.

If the painted AppBar is removed, drag must move to the sage inset **and** the in-island header, with the same no-drag list. Losing `.df-titlebar` makes the overlay window undraggable except on leftover chrome.

### Persisted `chartThumbnails`

Two stores disagree:

| Path | `chartThumbnails` |
|---|---|
| `useAutoSave` `EXCLUDED_FIELDS` | excluded from workspace zip |
| `dfSlice` `loadState` | forced `{}` |
| `store.ts` persist `blacklist` | **not listed** (`serverConfig`, `globalModels`, `chartSynthesisInProgress`, `starterQuestionsStatus` only) |

A browser refresh rehydrates PNG data URLs from localforage. `computeCacheKey` does not hash the house object when `themeId` is null, so a house restyle leaves those PNGs until `ChartRenderService` overwrites them.

PNG fills still `'white'` in `chartCache.downscaleImageForAgent` **and** `ChartRenderService.scalePngDown`. Report/Chartifact export fills `#ffffff`.

`DF_STATE_VERSION` is 4. No v5 migrate for `fluent → cicada` or thumbnail reset.

---

## 6. Suggested chunk ids only

| Id | Scope |
|---|---|
| `C-tokens` | Expand `tokens.ts` (radius xs/xl/island keep sm=1.5; status; surface aliases; `--df-*` / `--df-focus-border`); extract `createDatlyTheme` to `src/app/theme.ts`; kill leftover chrome blues listed in §3; Roboto drop from `index.css`; Settings Cicada+Mono (+ Advanced when `DEV_MODE`); `dfSlice` initial `paletteKey: 'cicada'`; persist v5 migrate fluent→cicada. |
| `C-sash` | App.scss `--focus-border: var(--df-focus-border)`; keep outer `--separator-border: transparent` while vis pane is still pill. |
| `C-island` | `IslandShell` + `IslandHeader`; move header out of full-bleed AppBar; `layout.ts` `appBar=44`, `islandInset=8`, drop desktop `tabBar` from `minimumShellBudget`; titlebar drag on sage + header. Keep `ModelSelectionButton` in header. Keep Sessions tab. |
| `C-sidebar` | Restyle rail/panel/Sessions list; replace `rgba(25,118,210,*)` selected; `var(--df-island-inset)` sage margins; StatusPill for connector dots. |
| `C-workspace` | Compact header `WorkspaceMenu` card + origin-aware Menu; delete `WorkspaceMenu` / `AppFC` `[DEBUG]` logs. |
| `C-composer` | `AgentChatInput` / `SimpleChartRecBox` radius+shadow recipes; later `appearance: 'footer'` then remove model from header. Do not add footer to `DataLoadingChat`. |
| `C-thread` | `entrySx` / `DataThreadCards` off `'white'`/`'3px'`/`'6px'`; selected forest hairline not `primary.light` glow; kill `radius.pill` on rectangular vis panes (`DataFormulator` + `DataLoadingChat`). |
| `C-recipes` | `src/app/recipes.ts` SxProps only; `SegmentedPills` Explore/Reports; dialogs/menus/toasts via theme. |
| `C-type` | Bump `TEXT_RAMP.reference` one step (`md` 14); do not touch `DENSITY_SCALE` or thread lengths. |
| `C-chart` | Revise `DATLY_CHART_THEME` plot=`surface.paper`; keep hues 0–1; replace categorical 2–5; `HOUSE_THEME_REVISION` inside `computeCacheKey`; persist-blacklist + v5 `chartThumbnails: {}`; paper PNG/export fills; tooltip CSS; recolor `#76c6ff` icons. |

Order implied by the brief: `C-tokens` + leftover blue + `C-sash`, then `C-island`, then recipes/sidebar/composer/thread, then `C-chart`.
