# Arch-expert: Kind R PENDING as four features

Feature: F-clean-grid, F-clean-steps, F-ide-desktop, F-report-pack  
Role: `[arch-expert]`. Report only. Do not edit product code.  
Source: `docs/lifecycle/feature-ask.md`, `docs/lifecycle/reports/research-missing-features-2026-08-19.md`  
Checked: `src/app/dfSlice.tsx` exports, `src/views/DataFormulator.tsx` layout, `src/app/layout.ts`, `src/views/DataView.tsx`, `src/views/SelectableDataGrid.tsx`, `src/views/VisualizationView.tsx`, `src/views/DataThread.tsx`, `src/views/ReportView.tsx`, `src/dataOperations/models.ts`, `py-src/data_formulator/data_operations/`, `py-src/data_formulator/desktop.py`, `src/app/desktop.ts`, `src/app/stateMigrations.ts`, `src/components/ComponentType.tsx` `DictTable.derive`.

No em dashes.

---

## Verdict

**SHAPE**

All four jobs can land on the live stack. Not UNFIT. Not ASK (user already named every PENDING Kind R ID). Not FIT: four parallel rewrites would fork a prep engine, a second workbench, or a native-shell rewrite.

Slim: one plan, four phases, same surfaces. Phase A is F-clean-grid only. Cleaning verbs write deterministic `DictTable.derive` children (templated Python, no LLM). Applied-steps rail, join/pivot dialogs, desktop OS chrome, and report pack are later phases on the same lineage.

---

## 1. Can all four plug in without a parallel stack?

**Yes, if each feature extends a live surface and none invents a second runtime.**

| Feature | Live plug | Parallel stack (UNFIT) |
|---------|-----------|------------------------|
| F-clean-grid | `FreeDataViewFC` + `SelectableDataGrid` under chart/table canvas. Sort/filter/search already exist. `fetchColumnStats` already fills `metadata.nullCount` / `distinctCount` / `levels`. | New spreadsheet widget, Handsontable/AG Grid swap, or KNIME nodes. |
| F-clean-steps | Named steps = `DictTable.derive` chain (`source`, `code`, `trigger`, `parentNodeId`). Replay = sandbox run of that code. Refresh = `useDataRefresh` + `contentHash`. Code already inspectable in `VisualizationView` code dialog (`fetchCodeExpl`). | Fork `data_operations` (load plans, `connector_query` only) into a prep DAG. New undo store that ignores thread focus. |
| F-ide-desktop | Already three panes: `DataSourceSidebar` + Allotment (`DataThread` \| canvas). Canvas is `VisualizationView` or `ReportView` via `viewMode`. Desktop is pywebview in `desktop.py` (`?desktop=1`). Sessions = `workspaceService` + `activeWorkspace`. | New top nav. Electron as home. DataGrip-style editor-first chrome. Notebook home. |
| F-report-pack | `ReportView` + Tiptap. `GeneratedReport.selectedChartIds`, `parentNodeId`, `triggerTableId`, `contentSnapshotHash` already exist. PNG/PDF download live. Workspace export/import live. | Second document model, Tableau Stories, or a zip path that bypasses workspace state. |

`data_operations/` is **load** (filters/columns/order/limit on import). Do not stretch `DATA_OPERATION_SCHEMA_VERSION` / `kind: 'connector_query'` into rename/split/join. Prep steps belong on `derive` (and a thin `CleanStep` summary on that lineage), not on load plans.

`dataCleanBlocks` / `focusedDataCleanBlockId` / `cleanInProgress` are legacy. Do not revive them. New verbs must not write that array.

---

## 2. Meaning (locked)

Desktop IDE for analysis, cleaning, reporting.

- **F-clean-grid:** Analyst right-clicks a column and cleans it without chat. Grid copies and pastes like Excel.
- **F-clean-steps:** Every clean is a named step they can undo, replay, and refresh.
- **F-ide-desktop:** Catalog, grid+chart, and agent stay visible. Desktop File menu, drop, restore.
- **F-report-pack:** Stakeholder report embeds last chart and table, exports as one pack, warns if data moved.

Agent stays sidecar (`DataThread`). Cleaning verbs live on the grid. Encoding shelf stays with the chart (`IDE-04` keep).

---

## 3. Live seams (what I read)

### `dfSlice.tsx` exports (reuse, do not restack)

Public surface today:

- Types: `SSEMessage`, `ServerConfig`, `ModelConfig`, `FocusedId`, `ClientConfig`, `GeneratedReport`, `DataFormulatorState`
- Constants: `DEFAULT_ROW_LIMIT`
- Factories: `generateFreshChart`, `getDataFieldItems`
- Thunks: `fetchFieldSemanticType`, `generateStarterQuestions`, **`fetchColumnStats`** (profile), `fetchCodeExpl` (pin/re-run text), `fetchGlobalModelList`, `fetchAvailableModels`
- Slice: `dataFormulatorSlice`, `dfActions`, `dataFormulatorReducer`
- Selectors: `selectTableIds`, `selectRefreshConfigs`, `dfSelectors` (`getAllTables`, `selectSessionEmpty`, `selectCanvasTarget`, `getEffectiveTableId`, `getAllCharts`, `getChartThumbnail`, reports)

State already has: `inputTables` / `derivedTables` / `conceptShelfItems`, `focusedId`, `viewMode: 'editor' | 'report'`, `generatedReports`, `textTurns`, `activeWorkspace`, sidebar open/tab, `displayRowsTick`, `chartThumbnails`, virtual-aware tables. Persist is `DF_STATE_VERSION = 5` via `migrateState`.

Additive only: a `CleanStep` list (or derive-chain projection) plus session/file-honesty badges. Bump version when the payload shape changes. Keep `dfActions` as the only mutation path.

### `DataFormulator.tsx` layout (do not replace)

Already the workbench:

1. `DataSourceSidebar` (catalog: `sources | sessions | knowledge`)
2. Allotment `fixedSplitPane`: `DataThread` (agent + thread cards) | canvas
3. Canvas: `viewMode === 'editor' ? visPane : <ReportView />`
4. Phone: Thread / Canvas tabs. Do not invent a fourth desktop pane.

`VisualizationView` already stacks chart, `FreeDataViewFC` grid, `EncodingShelfCard` (Popper). `IDE-01` is density and always-on visibility, not a new shell. `IDE-04` slim: keep the shelf with the chart; do not add a permanent Tableau strip if `minimumShellBudget` (600) cannot take it. Do not hide the shelf.

### Desktop

`desktop.py` `run_desktop()`: single-instance socket, loading HTML, `webview.create_window("Datly")`, Flask on loopback, `?desktop=1`. No native File menu, no argv Open With, no full-path drop. `src/app/desktop.ts` is `isDesktopRuntime()` + Electron titlebar insets only.

`electron/` has a File/Preferences menu. Product lock: **no Electron rewrite**. NEW-01 lands on pywebview (`desktop.py` + existing `IslandHeader` / `WorkspaceMenu`), or a thin pywebview menu API. Do not grow `electron/` as the ship path.

---

## 4. Exact slim (SHAPE)

Do now (same plan, phased):

| Phase | Feature | IDs in | How (slim) |
|-------|---------|--------|------------|
| A | F-clean-grid | CLN-02, CLN-03, CLN-08, NEW-07, NEW-08, IDE-02, NEW-04, IDE-12 | Column context menu + type cast on header icon. Row keep/remove as a **table** derive, not a chart filter. Promote first row. Copy TSV / paste TSV into current table or new table (reuse `createTableFromText` from paste tab). Profile popover on header using `fetchColumnStats` + fill/drop/exclude. Search already in `DataView`; add copy. |
| B | F-clean-steps | CLN-01, CLN-04, CLN-05, CLN-07, NEW-09, IDE-07, NEW-12 | Steps rail = derive lineage of the focused table, shown beside the grid (not a node canvas). Each Phase A verb becomes a named step with templated `derive.code`. Undo/redo walks that stack plus chart encoding snapshots (not CodeMirror-only). Pin/show/re-run reuses the code dialog + sandbox. F5 / menu Refresh calls `useDataRefresh`. Join/union and pivot/unpivot are dialogs that emit one derive step. Group-by-to-table same. |
| C | F-ide-desktop | IDE-01, IDE-03, IDE-04, IDE-05, IDE-06, IDE-08, IDE-09, IDE-10, NEW-01, NEW-03, NEW-05, NEW-06 | Tighten existing panes (do not add top nav). CatalogTree types + field browser. Session restore / Save As on `workspaceService`. After model wall: last session / drop / sample. Keyboard map + cheat sheet on the existing `keydown` listener (`IslandHeader` already has Ctrl/,). Native File/Edit/View/Help via pywebview or header File menu. OS drag-drop with full path on desktop only. Sample vs full vs DuckDB badge. Offline / data-did-not-leave badge. |
| D | F-report-pack | IDE-14, REP-01, REP-02, REP-03 | Keep Tiptap. One click: insert last chart **and** current table figure. Session pack zip = tables + chart PNGs + report (compose existing CSV/zip/PNG/PDF). Stale badge: compare `contentSnapshotHash` / table `contentHash` / `parentNodeId` to last clean/analysis node. |

**Later (same plan, after D, or cut if blast):**

- **CLN-06** cluster-and-merge (OpenRefine). P1. Needs a cluster API. After rail exists.
- **CLN-09** clean-on-sample / apply-full. Virtual sample already inspects. After rail + honesty badge (NEW-05).
- **NEW-02** session as OS document (file association / Open With). After Save As (IDE-10).
- **IDE-11** Show Me polish. Templates exist (`ChartTemplates`, `SimpleChartRecBox`). Do not new chooser surface until panes are stable.
- **NEW-11** legend-click filter. Vega interaction; after report pack or with Show Me. Must write a **table** filter step if it is a clean; chart-only brush stays viz.

**Never in this plan:**

- SQL-01, PAL-01, NEW-13, NEW-15
- Notebooks, git projects, Hex/Slack, Count canvas, KNIME node canvas, DataGrip-as-home, Electron rewrite
- New top nav
- New design kit
- Extending load `data_operations` into prep
- Reviving `dataCleanBlocks`

---

## 5. Write-set conflicts

One writer at a time on these files. Two features must not land overlapping hunks in the same wave.

| File | Why exclusive | Owner phase |
|------|---------------|-------------|
| `src/app/dfSlice.tsx` | All features add state/actions/selectors. Single 2.7k-line slice. | Sequential: A then B then C then D. Extract helpers if a chunk exceeds one concern, but do not split into a second store. |
| `src/components/ComponentType.tsx` | `DictTable.derive`, `Trigger`, `FieldItem` | A+B (steps schema). C/D read only after freeze. |
| `src/app/stateMigrations.ts` + `src/app/store.ts` | `DF_STATE_VERSION` | The phase that first persists new fields (likely B). A may stay unversioned if verbs only create derived tables. |
| `src/views/SelectableDataGrid.tsx` | Header, sort, filter, selection, clipboard | **A only.** B/C/D consume callbacks. |
| `src/views/DataView.tsx` | Search header, column defs, table resolve | **A only.** |
| `src/scss/DataView.scss` | Grid chrome | A |
| `src/views/ColumnFilterPopover.tsx` | Adjacent to column menu | A |
| `src/views/VisualizationView.tsx` | Chart + grid + shelf + code dialog | A (profile/menu host) then D must not restack. C may only change visibility CSS via tokens. Prefer A finish before C touches this file. |
| `src/views/DataThread.tsx` + `DataThreadCards.tsx` | Thread cards, agent sidecar | **B** (step cards / pin). C must not restack thread. |
| `src/views/DataFormulator.tsx` | Allotment, viewMode, workspace list | **C**. A/B/D do not change pane topology. |
| `src/app/layout.ts` | `minimumShellBudget`, pane widths | **C only** if a badge or menu needs height. Do not spend `minChartHeight`. |
| `src/components/IslandHeader.tsx` | Header, viewMode pills, keydown, WorkspaceMenu | **C** (File menu, keymap). D may add a pack action via a slot, not a second header. |
| `src/views/WorkspaceMenu.tsx` | Save / sessions | C (Save As, restore) |
| `src/app/workspaceService.ts` + `workspaceDB.ts` | Disk sessions | C; D pack may **read** export. |
| `src/app/useDataRefresh.tsx` + `tableThunks.ts` | Refresh / addTable | B (NEW-12, replay). A apply uses `tableThunks` after B's apply helper exists, or A lands a small `applyCleanVerb` thunk first. |
| `py-src/data_formulator/desktop.py` | Window, argv, drop, menu | **C only** |
| `src/app/desktop.ts` | Desktop detect | C |
| `src/views/ReportView.tsx` + `TiptapReportEditor.tsx` | Report | **D only** |
| `src/components/CatalogTree.tsx` + `VirtualizedCatalogTree.tsx` + `DataSourceSidebar.tsx` | Field browser | **C** (IDE-03) |
| `src/data/types.ts` + `src/data/column.ts` | Type cast | A (NEW-07) |
| Locale JSON under `src/i18n/locales/` | New strings | Each phase owns its keys. Fill **all six** locales (`en zh ja ko fr de`). No English stubs. |

`py-src/data_formulator/data_operations/*` is **not** a write-set for this job unless a load-filter bug blocks CLN-09. Default: do not touch.

`src/app/App.tsx` should stay out. Menus and keydown live in `IslandHeader` / `desktop.py`.

---

## 6. Suggested implement order + chunk ids

Execute Phase A first after plan-check. Later features stay in the **same** work package as later chunks.

### Phase A — F-clean-grid

| Chunk | IDs | Write-set |
|-------|-----|-----------|
| `C-grid-clipboard` | IDE-02 (copy), NEW-04 | `SelectableDataGrid.tsx`, `DataView.tsx`. Selection + TSV copy. Paste TSV when grid focused (new table or append via `createTableFromText`). Do not only keep the hidden upload Paste tab. |
| `C-grid-menu` | CLN-02, CLN-03, CLN-08, NEW-07 | `SelectableDataGrid` header menu, `DataView`, `types.ts`, small apply helper (new `src/app/cleanVerbs.ts` or thunk in `tableThunks.ts`). Deterministic derive code. No LLM. |
| `C-grid-profile` | IDE-12, NEW-08 | Header profile popover. Reuse `fetchColumnStats` + existing `metadata`. Actions call the same apply helper as the menu. |

CLN-06 is not in Phase A.

**Apply contract for A:** each verb inserts one `derivedTables` node with templated `derive.code`, `source: [parentId]`, `trigger` marked `source: "user"`, `parentNodeId` set. Focus the new table. That is enough for B to project a step list.

### Phase B — F-clean-steps

| Chunk | IDs | Write-set |
|-------|-----|-----------|
| `C-steps-model` | CLN-01 | `ComponentType.tsx`, `dfSlice.tsx`, `stateMigrations.ts`. Named step projection over derive chain. Persist. |
| `C-steps-rail` | CLN-01 UI | New thin rail **inside the current grid chrome** (DataView header or VisualizationView bottom), not a new Allotment pane. Optional step chip on `DataThreadCards`. |
| `C-steps-reshape` | CLN-04, CLN-05, CLN-07 | Dialogs only. One derive step each. Join/union on tables already in `getAllTables`. |
| `C-steps-undo` | IDE-07 | Undo/redo stack for clean + encode + thread. Do not steal CodeMirror undo. |
| `C-steps-rerun` | NEW-09, NEW-12, (CLN-09 later) | Pin/show/re-run code dialog. Wire F5 / header Refresh to `useDataRefresh`. |

### Phase C — F-ide-desktop

| Chunk | IDs | Write-set |
|-------|-----|-----------|
| `C-desk-panes` | IDE-01, IDE-03, IDE-04, IDE-08 | `DataFormulator.tsx` density only. `CatalogTree` types. Do not add panes. Do not hide thread or shelf. |
| `C-desk-keys` | IDE-06 | `IslandHeader` keymap + cheat sheet dialog. |
| `C-desk-session` | IDE-05, IDE-09, IDE-10 | `workspaceService`, `WorkspaceMenu`. Restore last session. Save As. After model: last / drop / sample. |
| `C-desk-os` | NEW-01, NEW-03, NEW-05, NEW-06 | `desktop.py` + `desktop.ts`. File/Edit/View/Help. Full-path drop. Honesty + offline badges on grid/header. |

NEW-02 later.

### Phase D — F-report-pack

| Chunk | IDs | Write-set |
|-------|-----|-----------|
| `C-rep-insert` | IDE-14, REP-01 | `ReportView.tsx`, `TiptapReportEditor.tsx`. One-click last chart + current table. |
| `C-rep-pack` | REP-02 | Zip composer using existing export helpers + `workspaceService.exportWorkspace`. |
| `C-rep-stale` | REP-03 | Badge from `contentSnapshotHash` / table `contentHash` / `parentNodeId`. |

IDE-11 / NEW-11 after D or cut.

### Wave / writer order

1. Plan-check on this SHAPE.
2. Impl A: `C-grid-clipboard` → `C-grid-menu` → `C-grid-profile` (one writer on the grid files).
3. Impl B: `C-steps-model` → `C-steps-rail` → `C-steps-reshape` → `C-steps-undo` → `C-steps-rerun`.
4. Impl C: `C-desk-panes` → `C-desk-keys` → `C-desk-session` → `C-desk-os`.
5. Impl D: `C-rep-insert` → `C-rep-pack` → `C-rep-stale`.

Do not run A and C writers together (`VisualizationView` / `dfSlice`). Do not run B and D together on persist. Neighborhood + specialists may plan in parallel; implementers are serial on the conflict files.

---

## 7. What the unified plan must not break

- **Topology:** sidebar + thread + canvas. Phone Thread/Canvas tabs. `viewMode` Explore/Reports in `IslandHeader` only. No new top nav.
- **Agent sidecar:** `DataThread` stays the editor companion. Grid verbs must work with no model selected.
- **Encoding shelf:** stays with the chart. Do not bury it in a menu. Do not make it a fourth Allotment pane.
- **Derive / sandbox:** `derive.code` + `codeSignature` + sandbox remain the execution path. Do not add a client-only mutate of `table.rows` that cannot replay or refresh.
- **Virtual tables:** `SelectableDataGrid` `fetchVirtualData`, `virtual.rowCount`, `displayRowsTick`, `frontendRowLimit`. Verbs on virtual tables must go through server/sandbox, not slice the sample and call it the full file. NEW-05 badge must tell the truth.
- **Load ops:** `data_operations` connector query plans unchanged.
- **Persist:** `migrateState` chain; `useAutoSave`; workspace load/save; `selectSessionEmpty`. Blacklist stays (`serverConfig`, `globalModels`, `chartSynthesisInProgress`, `starterQuestionsStatus`, `chartThumbnails`).
- **Focus model:** `focusedId` + `selectCanvasTarget`. Cleaning a table must not drop chart/report focus incorrectly.
- **Layout budget:** `MIN_SUPPORTED` 1024x600. Do not shrink `minChartHeight` 360. Steps rail and badges must fit `minimumShellBudget` or collapse on `heightClass === 'short'`.
- **Desktop runtime:** pywebview + Flask loopback. `isDesktopRuntime()`. Single-instance socket in `desktop.py`. No Electron as ship path.
- **i18n:** all six locales for new copy. No English pasted into ja/ko/fr/de.
- **Cicada chrome:** MUI + `tokens.ts` + `IslandShell` / `IslandHeader`. No second kit.
- **Reports:** Tiptap embeds; existing PNG/PDF. Pack adds a zip, does not replace those paths.
- **Tests:** extend grid / derive / workspace / report unit tests. Do not require a running desktop GUI for Phase A.

---

## 8. Fit dimensions

| Dimension | Score | Note |
|-----------|-------|------|
| Reuse | PASS if | DataView, DataThread, ReportView, desktop.py, dfSlice, derive/sandbox, fetchColumnStats, workspaceService. |
| Layering | PASS if | Verbs → templated derive → sandbox. UI does not talk to Flask except existing `apiClient`. Load ops stay load. |
| Conventions | SHAPE | New files allowed: `cleanVerbs.ts`, step rail component, cheat sheet, pack zip helper. Not a new app tree. |
| Contracts | SHAPE | Persist v6 when steps are named. `FocusedId` unchanged. `GeneratedReport` fields additive (`stale` computed, not a breaking rename). |
| Scope | SHAPE | Four phases. Phase A first. P1 cluster / sample-apply / OS document / Show Me / legend later. |
| Testability | PASS | Clipboard unit tests; derive-code snapshot per verb; migrate v5→v6; workspace Save As; report hash stale. |

---

## 9. Risks (load-bearing)

| Risk | Why | Mitigation |
|------|-----|------------|
| `dfSlice.tsx` hotspot | Every feature wants actions | Serial phases. Prefer `cleanVerbs.ts` + `dfActions.addTable` over new slice fields in A. |
| Load ops mistaken for steps | Same word "steps" in `DataOperationPlan.steps` | Plan language: **clean steps** = derive lineage. Never extend `connector_query`. |
| Client-only grid mutate | Fast but unreplayable | Forbidden. Sample edits on virtual tables must say so (NEW-05) and apply full via sandbox. |
| Encoding shelf "always visible" | Live is a Popper | Keep reachable with the chart. Permanent strip only if budget test still `fitsHeight`. |
| Native menu vs no new top nav | NEW-01 vs lock | OS menu bar or one File control in `IslandHeader`. Not a second AppBar row of File/Edit/View/Help buttons. |
| Electron menu already exists | Tempting to ship NEW-01 there | Out. pywebview is the desktop product. |
| Four writers in one wave | `VisualizationView` / `DataFormulator` / `dfSlice` | Phase A first. Plan lists exclusive files. |
| Undo scope | Encode + thread + clean | B owns one stack. A verbs are just another derive node, so undo falls out of walking `parentNodeId`. |

---

## 10. Answer for the planner

1. **Plug in without a parallel stack?** Yes: grid, derive chain, existing three panes, pywebview, Tiptap.
2. **Verdict:** **SHAPE**
3. **Slim later:** CLN-06, CLN-09, NEW-02, IDE-11, NEW-11. Never: node canvas, new top nav, Electron rewrite, load-ops-as-prep.
4. **Conflicts:** `dfSlice.tsx`, `ComponentType.tsx`, `stateMigrations.ts`, `SelectableDataGrid.tsx`, `DataView.tsx`, `VisualizationView.tsx`, `DataThread.tsx`, `DataFormulator.tsx`, `IslandHeader.tsx`, `desktop.py`, `ReportView.tsx` (see table).
5. **Order:** A `C-grid-*` → B `C-steps-*` → C `C-desk-*` → D `C-rep-*`
6. **Do not break:** pane topology, sidecar agent, shelf-with-chart, derive/sandbox replay, virtual honesty, persist migrations, 1024x600 budget, pywebview desktop, six locales, Cicada tokens.
