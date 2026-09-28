# UI-expert: F-ide-desktop + F-report-pack

Role: `[ui-expert]`. Report only. Do not edit product code.  
Refs: `docs/lifecycle/waves/ide-arch.md`, `docs/lifecycle/waves/ide-neighborhood.md`.  
Locks: no new top nav; three panes stay (sidebar, thread, canvas); desktop is `desktop.py` pywebview, not Electron; report surface stays `ReportView` + Tiptap.

Slim later (agree with arch): **NEW-02**, **IDE-11**, **NEW-11**. Do them after Save As and after the pack, or cut. None of them need a new place.

---

## F-ide-desktop

IDs: IDE-01, IDE-03, IDE-04, IDE-05, IDE-06, IDE-08, IDE-09, IDE-10, NEW-01, NEW-02, NEW-03, NEW-05, NEW-06.

### Meaning

Catalog, grid+chart, and agent stay visible on one screen. Desktop File menu, drop, restore. The daily workbench is the existing three panes, not a new IDE chrome.

Out of scope: new top nav; fourth Allotment column; Electron rewrite; DataGrip-as-home; notebooks; command palette (PAL-01); file-association installer work this phase (NEW-02 later).

### Place

No new route. Same workspace:

1. `DataSourceSidebar` (catalog, left of the island)
2. Allotment: `DataThread` (agent sidecar) | canvas
3. Canvas: `viewMode === 'editor' ? VisualizationView : ReportView`
4. Phone: Thread / Canvas tabs. Do not invent a fourth desktop pane.

Header stays `IslandHeader` (Explore / Reports pills, `WorkspaceMenu`). Model wall stays the existing overlay in `DataFormulator.tsx`. Landing stays the no-workspace `IslandShell`.

### Approach + files

Tighten density and OS honesty. Do not restack.

| ID | UI | How |
|----|----|-----|
| IDE-01 | Three panes already exist | Density in `DataFormulator.tsx` + `layout.ts`. Keep sidebar + thread + canvas visible at `MIN_SUPPORTED` 1024x600. Do not add a top File/Edit/View/Help **button row**. |
| IDE-03 | Sources tab | Thicken `CatalogTree` / `VirtualizedCatalogTree`: tables, columns, types on the existing tree. No fourth sidebar tab. Cast stays F-clean-grid. |
| IDE-04 | Encoding shelf | Keep `EncodingShelfCard` with the chart in `VisualizationView.tsx`. Live is a Popper on the edit-chart button. Keep it reachable while the chart is focused. Do not bury it in a menu. Do not add a permanent Marks strip if it steals `minChartHeight` 360; collapse on `heightClass === 'short'`. |
| IDE-08 | Agent sidecar | `DataThread` + `SimpleChartRecBox` stay the thread pane. Collapsible via Allotment. Closing canvas is allowed; agent must never be the only editor. Grid and shelf work with no model. |
| IDE-06 | Keyboard | Extend the `IslandHeader` `keydown` listener (already Ctrl/Cmd+, for Preferences). Cheat sheet dialog from that same header, not a palette. Map: focus panes, run agent, undo, export, Explore/Report. |
| IDE-05, IDE-10 | Sessions | Restore last session and Save As on `workspaceService` + `WorkspaceMenu` + sidebar Sessions. Named local files, not git. |
| IDE-09 | After model wall | Same landing: last session / drop / sample. Do not add a wizard route. |
| NEW-01 | Native File/Edit/View/Help | `py-src/data_formulator/desktop.py` `webview.start(menu=...)`. Actions call existing dialogs (upload, Settings, About, Save As). Fallback: one File control in `IslandHeader`. Never a second AppBar. Do not grow `electron/`. |
| NEW-03 | OS drop with full path | Python drop handler in `desktop.py` (pywebview full path), not HTML `FileList`. Wire into existing `UnifiedDataUploadDialog` / `tableThunks`. |
| NEW-05 | Sample vs full vs DuckDB | Quiet badge on the **grid header band** (`DataView` / `VisualizationView`). Truth is `virtual.rowCount` vs loaded sample. Do not dump the file into React. |
| NEW-06 | Offline / data did not leave | Quiet pill on `IslandHeader` or model picker (`ModelSelectionDialog`). Desktop flag + local model. No privacy dashboard. |
| NEW-02 | Session as OS document | Later. After IDE-10 has a file format. Installer + `sys.argv` (parse before Flask clobber). Not a React surface. |

`src/app/App.tsx` stays out. `src/app/desktop.ts` keeps `?desktop=1`; drop `electronAPI` as the ship path. Align `desktop.py` `min_size=(960, 640)` with `MIN_SUPPORTED` 1024x600 rather than shrinking the chart.

i18n: new strings through `t()`, all six locales (`en zh ja ko fr de`). Prefer `dataView`, `canvas`, `workspace`, `appBar`.

### Verdict

**SHAPE.** Placement is FIT (reuse the three panes). Shape change is density, native menu/drop, honesty badges, session File wrapping. Not ASK. Not UNFIT if Electron and a new top nav stay out.

Do now: IDE-01, IDE-03, IDE-04, IDE-05, IDE-06, IDE-08, IDE-09, IDE-10, NEW-01, NEW-03, NEW-05, NEW-06.  
Later: NEW-02.

### Suggested chunks

| Chunk | IDs | Write-set |
|-------|-----|-----------|
| `C-desk-panes` | IDE-01, IDE-03, IDE-04, IDE-08 | `src/views/DataFormulator.tsx` (density only), `src/app/layout.ts` if a badge needs height, `src/components/CatalogTree.tsx`, `src/components/VirtualizedCatalogTree.tsx`, `src/views/DataSourceSidebar.tsx`. Visibility CSS on `src/views/VisualizationView.tsx` / `src/views/EncodingShelfCard.tsx` only after F-clean-grid is done with that file. Do not add panes. Do not hide thread or shelf. |
| `C-desk-keys` | IDE-06 | `src/components/IslandHeader.tsx` keymap + cheat sheet dialog. New thin `src/views/KeyboardCheatSheet.tsx` if the dialog is more than a Menu. |
| `C-desk-session` | IDE-05, IDE-09, IDE-10 | `src/app/workspaceService.ts`, `src/views/WorkspaceMenu.tsx`, landing block in `src/views/DataFormulator.tsx`. Restore last. Save As. After model: last / drop / sample. |
| `C-desk-os` | NEW-01, NEW-03, NEW-05, NEW-06 | `py-src/data_formulator/desktop.py`, `src/app/desktop.ts`. Native menu. Full-path drop. Badges on grid header + IslandHeader. |

Later: `C-desk-os-doc` (NEW-02) on installer spec + argv/activate socket. Not this UI wave.

Phase C after A/B. Do not co-write `VisualizationView.tsx` with F-clean-grid.

---

## F-report-pack

IDs: IDE-14, REP-01, REP-02, REP-03, IDE-11, NEW-11.

### Meaning

Stakeholder report embeds the last chart **and** the current table, exports as one pack, warns if data moved. Explore/Reports remains `viewMode`, not a new app.

Out of scope: Tableau Stories, pages (REP-04), a second document model, replacing PNG/PDF paths, a zip that bypasses workspace state, a new chart chooser pane this phase.

### Place

Canvas when `viewMode === 'report'`: `src/views/ReportView.tsx` + `src/views/TiptapReportEditor.tsx`. Insert, pack, and stale live on that surface (floating pills + download menu). Do not add a report tab in the sidebar. Do not swap Tiptap.

Show Me and legend-click (later) live on the **editor** canvas (`VisualizationView`, `ChartTemplates`, Vega), not inside the report.

### Approach + files

Keep Tiptap. Snapshot at click time: report mode replaces the vis pane, so the live grid is gone unless insert copies chart + table first.

| ID | UI | How |
|----|----|-----|
| IDE-14 | Report polish | Already live: narrative, chart image embed (`ResizableImageView`), copy, html2canvas PNG, PDF print. Polish structure and the insert/pack/stale entry points. Do not restack the editor. |
| REP-01 | One-click last chart + current table | New action on the ReportView floating pills (next to edit / download). Snapshot focused chart PNG from `chartCache` / `ChartRenderService`. Table-as-figure: Tiptap already has `Table`; insert a capped HTML figure (or image of the current grid) plus caption. Bound rows; do not paste 2M cells. |
| REP-02 | Session pack zip | One more item on the existing download Menu: tables + chart PNGs + report. Compose existing CSV/zip/PNG/PDF helpers + `workspaceService.exportWorkspace`. User export, not autosave. |
| REP-03 | Stale badge | Quiet badge on the report header / pill. Compare `GeneratedReport.contentSnapshotHash` to the `derive.source` closure (`contentHash`, `parentNodeId`, `triggerTableId`). Do not use only `updatedAt`. Hash only the trigger table and you miss a join source change. |
| IDE-11 | Show Me | Later. Templates already in `src/components/ChartTemplates.tsx` + `src/app/chartRecommendation.ts` + `SimpleChartRecBox`. Polish on selected fields. No new chooser surface until panes are stable. |
| NEW-11 | Legend-click filter | Later. Vega-Lite legend bind on `VisualizationView`. Map to inspect filters or a chart param. Not a clean step. Not a report control. |

`DataFormulator.tsx` stays `viewMode` swap only. Pack action may get a slot from `IslandHeader`; do not add a second header.

i18n: `report.*` keys, all six locales.

### Verdict

**SHAPE.** Placement is FIT (`ReportView` + Tiptap). Remaining work is table insert, pack zip, stale badge. IDE-14 is mostly live. IDE-11 and NEW-11 are polish on the editor canvas; slim later, same plan.

Do now: IDE-14, REP-01, REP-02, REP-03.  
Later: IDE-11, NEW-11.

### Suggested chunks

| Chunk | IDs | Write-set |
|-------|-----|-----------|
| `C-rep-insert` | IDE-14, REP-01 | `src/views/ReportView.tsx`, `src/views/TiptapReportEditor.tsx`. One-click last chart + current table snapshot. Reuse `getCachedChart` / embed pattern. |
| `C-rep-pack` | REP-02 | ReportView download menu + small zip helper (new `src/app/reportPack.ts` or next to `workspaceService`). Read export helpers; do not fork autosave. |
| `C-rep-stale` | REP-03 | Badge in ReportView. Hash helper may live in `src/app/dfSlice.tsx` selectors only if D owns that slice turn. Prefer a computed selector over a persisted `stale` flag. |

Later: `C-rep-showme` (IDE-11) on `ChartTemplates` / rec box. `C-viz-legend` (NEW-11) on `VisualizationView` Vega. After D or cut.

Phase D after C. Do not co-write persist with F-clean-steps.
