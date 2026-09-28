# IDE neighborhood: cleaning, analysis chrome, reporting

Grounded in `src/` and `py-src/` as of 2026-08-19. Not a plan. Paths are workspace-absolute.

Ask: [docs/lifecycle/feature-ask.md](D:\Coding\Main\Datly\docs\lifecycle\feature-ask.md). Source report: [docs/lifecycle/reports/research-missing-features-2026-08-19.md](D:\Coding\Main\Datly\docs\lifecycle\reports\research-missing-features-2026-08-19.md).

SHAPE lock: one plan, four features, no new top nav, no node canvas. Agent stays sidecar. Clean verbs live on the grid. Reuse `DataView`, `DataThread`, `ReportView`, `desktop.py`.

---

## Reuse (must)

Do not invent a second grid, a second table model, a prep engine, or an Electron shell. Plug into these.

| Job | Live surface | Why reuse |
|-----|--------------|-----------|
| Results grid | `src/views/DataView.tsx` (`FreeDataViewFC`) + `src/views/SelectableDataGrid.tsx` | Column kebab, sort, filter popover, virtual sample, search, CSV/TSV download. CLN-02 / IDE-02 / NEW-08 extend this kebab, not a new table widget. |
| Column inspect | `src/views/ColumnFilterPopover.tsx` + `dfSlice.fetchColumnStats` + `/api/tables/analyze` | Already shows rows / distinct / blanks. Profile actions and type cast attach here. Filter wire is a sacred inspect contract (see below); do not silently turn it into a clean step. |
| Table model | `DictTable` in `src/components/ComponentType.tsx` | `names`, `metadata.type`, `rows`, `virtual.{tableId,rowCount}`, `derive.{source,code,codeSignature,trigger}`, `parentNodeId`, `contentHash`. Every clean step that materializes a table is another `DictTable` with `derive`. |
| Thread / trail | `src/views/DataThread.tsx`, `DataThreadCards.tsx`, `InteractionEntryCard.tsx` (`PlanStepsView`) | Authored history already exists. Applied steps are a rail on the current grid, not a new graph. Pin/re-run (NEW-09) is `derive.code`, not a new artifact store. |
| Agent transform path | `py-src/data_formulator/agents/agent_simple.py` STYLE vs DATA; sandbox Python that writes `derive.code` | Pivot, join, derive already exist as DATA. Grid verbs should produce the same `DictTable.derive` shape so refresh and undo work. |
| Load (not prep) | `py-src/data_formulator/data_operations/` | Connector load plans (`ConnectorQueryStep` + `LoadQuery`). Reuse for import filters only. Do not extend this schema into Applied Steps. |
| Inspect sample | `POST /api/tables/sample-table` (`getUrls().SAMPLE_TABLE`), `py-src/data_formulator/routes/tables.py` | Virtual pagination, sort, range/in/contains, global search. Keep for IDE-02 inspect. CLN-03 row keep/remove must write a derived table, not only push more sample filters. |
| Refresh | `src/app/useDataRefresh.tsx`, `useDerivedTableRefresh`, `src/views/RefreshDataDialog.tsx`, `SourceTableShelf` `manualRefresh` | NEW-12 is surface (menu/F5), not a new refresh pipeline. Derived tables already re-run from `derive.code` when content hash changes. |
| Workbench split | `src/views/DataFormulator.tsx` Allotment: thread pane \| canvas pane; `src/views/DataSourceSidebar.tsx` + `src/components/CatalogTree.tsx` | IDE-01 is pane discipline on this split, not a new layout library. Canvas already swaps `visPane` vs `ReportView` via `viewMode`. |
| Encoding shelf | `src/views/EncodingShelfCard.tsx` mounted from `VisualizationView.tsx`; thread clone `EncodingShelfThread.tsx` | IDE-04: keep always visible with the chart. IDE-11 Show Me: `src/components/ChartTemplates.tsx` + `src/app/chartRecommendation.ts`. |
| Reports | `src/views/ReportView.tsx` + `TiptapReportEditor.tsx` | Live Tiptap, chart image embed (`ResizableImageView`), copy, html2canvas PNG, PDF print. REP-01 table-as-figure and REP-02 zip pack extend this. |
| Session persist | `dfSlice.loadState`, `src/app/stateMigrations.ts` (`DF_STATE_VERSION`), `src/app/useAutoSave.tsx`, workspace zip | IDE-05 / IDE-10: restore and named local sessions already have a payload. Desktop File Open/Save As wraps this, it does not invent JSON. |
| Desktop shell | `py-src/data_formulator/desktop.py` + `src/app/desktop.ts` `isDesktopRuntime()` (`?desktop=1`) | pywebview single window, loading HTML, Flask on loopback, single-instance activate socket. Native menu, argv, full-path drop plug here. |
| Paste load | `src/views/UnifiedDataUploadDialog.tsx` tab `paste`; `createTableFromText` | NEW-04: promote Ctrl+V / Excel TSV to first-class. Do not add a second parser. |
| Types | `src/data/types.ts` `Type` on `metadata[name].type`; `getIconFromType` in `ViewUtils.tsx` | NEW-07: the type icon already renders. Cast writes metadata (and a step), it does not add a type system. |

`data_operations` is **load**. Applied Steps are **`DictTable.derive` plus a UI rail**. Confusing them is the main reuse failure mode.

---

## Sacred contracts (do not break)

1. **Inspect filter vocabulary.** `ColumnFilter` ops `range` | `in` | `contains` must match `_build_filter_where_duckdb` / `_apply_filters_pandas` in `py-src/data_formulator/routes/tables.py`. Unknown ops and missing fields are dropped silently. Empty `in` is `WHERE FALSE` for that field. Global `search` is AND with filters, OR across columns. Do not add clean verbs (`drop`, `fill`, `trim`) as new filter ops.

2. **Virtual sample vs full table.** `DictTable.rows` may be a sample. `virtual.tableId` is the workspace DuckDB/parquet name. `virtual.rowCount` is truth for counts. `SAMPLE_TABLE` methods: `head` | `bottom` | `random`. `PAGE_SIZE` paging. Do not dump the full file into React. NEW-05 honesty is a badge on this contract.

3. **`derive` is provenance + replay.** `derive.source[]`, `derive.code`, `derive.outputVariable`, `derive.codeSignature` (HMAC that the server generated the code), `derive.trigger`. `parentNodeId` is the authored thread edge; `trigger.tableId` / report `triggerTableId` is data provenance. `loadState` backfills `parentNodeId` from `derive.trigger.tableId`. Do not collapse these two ids.

4. **Deleting a table reanchors the thread.** `dfSlice` walks children, reports, drafts, text turns via `parentNodeId` / `derive.trigger.tableId`. Clean steps that spawn tables must go through the same insert/delete helpers (`insertTable`-class reducers, `deleteTablesFromWorkspace`).

5. **`viewMode`: `'editor' | 'report'`.** `DataFormulator.tsx` canvas is either vis or `ReportView`. No third top nav. Reports stay `generatedReports[]` with `id`, `content`, `selectedChartIds`, `triggerTableId`, `parentNodeId`, `contentSnapshotHash`.

6. **Allotment geometry.** Thread pane snaps to whole column counts (`threadLayout.ts` + `layout.ts` `threadColumnsForWidthClass`). `REFERENCE.canvas.min` is 500. Grid row/header sizes live in `layout.ts` (`grid.rowHeight` 25, `headerHeight` 32, `rowIdWidth` 56). Do not inline new shell lengths.

7. **Desktop is pywebview, not Electron.** `desktop.py` creates one window, then `window.load_url("http://127.0.0.1:{port}?desktop=1")`. `sys.argv` is currently overwritten to Flask `--host/--port`. Single-instance port `49731` only activates (`window.show()`), it does not pass file paths. `src/app/desktop.ts` still mentions `window.electronAPI`; do not revive Electron.

8. **No node canvas.** Join / unpivot / group-by are dialogs or column verbs that emit one `DictTable`. `data_operations.DataOperationPlan.steps` stays `connector_query` load steps (`DATA_OPERATION_SCHEMA_VERSION = 1`).

9. **Agent is sidecar.** `SimpleChartRecBox` / `AgentChatInput` stay. Clean verbs must work with the model offline. STYLE vs DATA classification stays for NL chart prompts.

10. **Persist + migrations.** redux-persist + workspace zip share one payload. Bump `DF_STATE_VERSION` and add a migration if you add applied-steps state. `chartThumbnails` is transient.

11. **i18n.** New strings go through `t()`. en/zh key sets must stay equal (`tests/frontend/unit/app/i18nLocales.test.ts`). Prefer existing namespaces: `dataGrid`, `dataView`, `report`, `dataThread`, `canvas`, `upload`.

12. **Stack.** MUI + Emotion + existing Sass. No Tailwind/shadcn. API via `apiRequest` / `fetchWithIdentity`, not raw `fetch` for `/api/`.

13. **Min window vs layout.** `desktop.py` `min_size=(960, 640)`. `layout.ts` `MIN_SUPPORTED` is 1024x600. Do not "fix" one without the other.

14. **Code execution.** Agent/clean Python runs in the sandbox (`LocalSandbox`), not in the Flask process. Replay of a step reuses that path.

---

## File map per feature

### F-clean-grid

IDs: CLN-02, CLN-03, CLN-08, NEW-07, NEW-08, IDE-02, NEW-04, IDE-12, CLN-06.

**Meaning:** right-click a column and clean it without chat. Grid copies/pastes like Excel.

| Path | Role now | Plug |
|------|----------|------|
| `src/views/SelectableDataGrid.tsx` | Virtuoso grid. Kebab opens filter popover only. Download CSV/TSV. No row select, no clipboard. Virtual fetch via `SAMPLE_TABLE`. | Column menu verbs (rename, split, replace, trim, fill, drop, dedupe). Selection + Ctrl+C TSV (IDE-02, NEW-04 out). Keep inspect sort/filter. |
| `src/views/ColumnFilterPopover.tsx` | Unified column panel: summary + sort + range/in/contains. | Attach profile actions (fill/drop/exclude nulls, type cast). Do not overload `onApply(ColumnFilter)`. New callback for transforms. |
| `src/views/DataView.tsx` | Resolves focused table, search header, col defs with `Type`. | Header promote (CLN-08), sample vs full badge (pairs NEW-05), type icon click (NEW-07). |
| `src/scss/DataView.scss` | Original-column underline. | Only if kebab/profile chrome needs it. Prefer tokens. |
| `src/views/ViewUtils.tsx` | `formatCellValue`, `getColumnAlign`, `getIconFromType`. | Cast UI uses existing type icons. |
| `src/data/types.ts` | Column `Type` enum. | Cast target list. |
| `src/app/dfSlice.tsx` | `fetchColumnStats`, table insert, `conceptShelfItems`, `tableSemantics`. | Stats already feed IDE-12. Clean verbs that change data must insert/update `DictTable` + concepts, not mutate `rows` in place on virtual tables. |
| `src/app/tableThunks.ts` | Load file/paste/url/db into workspace. | Paste-as-load and header-promote may share load helpers. |
| `src/views/UnifiedDataUploadDialog.tsx` | Hidden-ish `paste` tab; `createTableFromText`. | NEW-04: OS/global paste of TSV/HTML table should hit this parser, not a new one. |
| `src/data/utils.ts` | `createTableFromText`. | Excel/HTML TSV parse. |
| `src/app/utils.tsx` | `GET_COLUMN_STATS`, `SAMPLE_TABLE`, `EXPORT_TABLE_CSV`. | Copy-out can reuse export delimiter `\t` for small tables; virtual copy needs a bounded export, not full 50M rows into clipboard. |
| `py-src/data_formulator/routes/tables.py` | Sample, analyze, export, DuckDB filters. | Keep inspect APIs. Add transform endpoints only if grid verbs execute server-side (virtual tables). Prefer same sandbox path as agent derive. |
| `src/components/ComponentType.tsx` | `metadata.levels`, `levelCounts`, `distinctCount`, `nullCount`. | IDE-12 / CLN-06 facet: levels already exist for low-cardinality. Cluster-and-merge is P1; do not block Phase A. |
| `src/i18n/locales/*/common.json` | `dataGrid.filter.*`, `dataGrid.columnMenu.*`. | New menu strings. |

**Do not touch for this feature:** `data_operations/` (load plans), `desktop.py` (except if paste needs a native clipboard hook; prefer JS clipboard first), `ReportView`.

**CLN-03 caution:** grid column filters are inspect/viz. Row keep/remove as a **table transform** must emit `derive`, or the next refresh/sample will resurrect dropped rows.

---

### F-clean-steps

IDs: CLN-01, CLN-04, CLN-05, CLN-07, CLN-09, NEW-09, IDE-07, NEW-12.

**Meaning:** every clean is a named step they can undo, replay, and refresh. Steps rail on the current grid, not a KNIME canvas.

| Path | Role now | Plug |
|------|----------|------|
| `src/components/ComponentType.tsx` `DictTable.derive` | One generated Python blob per derived table. Thread node = table. | Applied Steps can be (a) one derive per verb (thread of tables) or (b) an ordered step list **inside** one table's derive. (a) already works with `parentNodeId`. (b) needs a versioned field and a migration. Prefer (a) unless UI requires in-place list. |
| `src/views/DataThread.tsx` / `DataThreadCards.tsx` | Cards for tables, charts, triggers, code. Drop catalog tables onto thread. | NEW-09: pin/show/re-run `derive.code`. Do not hide code behind agent chat. |
| `src/views/InteractionEntryCard.tsx` | `PlanStepsView` for agent plan lines. | Visual cousin for clean steps; do not reuse agent plan as query history. |
| `src/views/DataView.tsx` / grid chrome | No steps rail today. | Feature-ask: "steps rail on current grid". New strip **in the canvas under/above the grid**, owned by DataView or VisualizationView. Still not a new route. |
| `src/app/dfSlice.tsx` | `derivedTables`, draft nodes, `fetchCodeExpl`, unref cleanup, undo is **not** a stack. Sample-order reset only. | IDE-07 needs an explicit undo/redo of clean + encode + thread. Today: CodeMirror-local and random-sample reset. Do not fake undo by deleting tables without a stack. |
| `src/app/useDataRefresh.tsx` | Auto + `manualRefresh`; derived recompute via hash. | NEW-12: bind F5 / menu. `RefreshDataDialog.tsx` already handles file replace / paste. |
| `src/views/SourceTableShelf.tsx` | Calls `manualRefresh`. | Keep. |
| Sandbox + formulate routes | Agent writes Python, server signs `codeSignature`, workspace publishes parquet. | Grid verbs (pivot, join, group-by, sample-apply-full) should call the same execute/sign/publish path so replay is identical. |
| `py-src/data_formulator/data_operations/models.py` | `LoadQuery` filters/columns/order/limit. `ConnectorQueryStep` only. | **Reuse for CLN-09 "apply to full file" only if the source is still a connector load.** Do not add `unpivot` kinds here. |
| `py-src/data_formulator/data_operations/executor.py` | Publishes connector queries into workspace tables. | Leave as load executor. |
| `py-src/data_formulator/agents/agent_simple.py` | DATA = join/compute/new field; STYLE = same encodings. | Join/pivot dialogs can still offer "ask agent" fallback. Deterministic pandas/DuckDB for named verbs. |
| `src/views/VisualizationView.tsx` | Chart + shelf + focused table overlay. | Group-by-to-table (CLN-07) must not steal chart aggregation on the shelf. Two outputs: chart agg stays; table agg is a derive. |

**Join/unpivot UI:** small dialogs. Left table = focused `DictTable`. Right table from `dfSelectors.getAllTables` / catalog. Result is one derived table. No canvas of nodes.

---

### F-ide-desktop

IDs: IDE-01, IDE-03, IDE-04, IDE-05, IDE-06, IDE-08, IDE-09, IDE-10, NEW-01, NEW-02, NEW-03, NEW-05, NEW-06.

**Meaning:** catalog, grid+chart, and agent stay visible. Desktop File menu, drop, restore.

| Path | Role now | Plug |
|------|----------|------|
| `src/views/DataFormulator.tsx` | Landing vs workspace. Allotment thread \| canvas. Sidebar is **outside** this split (app shell). Phone: tabs thread/canvas. `DndProvider` HTML5. `viewMode` swaps report. | IDE-01 three-pane: keep sidebar + this split. Do not add a third Allotment column for the agent; agent is thread (`DataThread` + `SimpleChartRecBox`). Closing canvas is allowed; do not make agent the only editor (IDE-08). |
| `src/app/layout.ts` / `LayoutProvider.tsx` | Density, rail, sidebar, thread, grid, chart, `MIN_SUPPORTED`. | Any pane chrome sizes go here. |
| `src/views/DataSourceSidebar.tsx` | Rail: add data, sessions, sources, knowledge. | IDE-03 schema/field browser: thicken sources/catalog, do not add a fourth tab unless necessary. |
| `src/components/CatalogTree.tsx` / `VirtualizedCatalogTree.tsx` | Connector catalog. | Types already on fields; surface them. Cast is F-clean-grid. |
| `src/views/VisualizationView.tsx` | Focused chart, `EncodingShelfCard`, grid overlay, Vega embed. | IDE-04 keep shelf. NEW-05 sample/full badge near grid. |
| `src/views/EncodingShelfCard.tsx` | Encoding wells. | Stay mounted with the chart. |
| `src/components/ChartTemplates.tsx` / `chartRecommendation.ts` | Template catalog. | IDE-11 is F-report-pack in the ask, but Show Me lives here. |
| `src/app/App.tsx` | AppBar, ConfigDialog, snackbar, `isDesktopRuntime`, titlebar insets. **No document drag-drop on the shell.** File drop is upload-dialog / landing. | Native menu actions should call existing dialogs (open upload, config, about). Keyboard cheat sheet (IDE-06) belongs near the existing keydown listeners (find them in App / DataFormulator / thread; there is no map today). |
| `src/app/desktop.ts` | `?desktop=1` or `electronAPI.isDesktop`. | Keep URL flag. Native menu can use pywebview JS bridge; do not depend on `electronAPI`. |
| `py-src/data_formulator/desktop.py` | `webview.create_window`, loading HTML, Flask thread, single-instance activate, Per-Monitor DPI V2, `DATA_FORMULATOR_DESKTOP=1`. | NEW-01: `webview.start(menu=...)`. NEW-03: pywebview 5 full-path drop (`pywebviewFullPath`), not HTML FileList. NEW-02 / IDE-10: parse `sys.argv` **before** overwriting it for Flask; pass path through the activate socket (today payload is only `DATA_FORMULATOR_ACTIVATE_V1`). IDE-05: last session already via persist; first-run last/drop/sample is IDE-09. |
| `packaging/data_formulator_desktop.spec` | PyInstaller. | Document types / Open With (NEW-02) live in installer metadata, not React. |
| `src/app/useAutoSave.tsx` / `dfSlice.loadState` / `stateMigrations.ts` | Workspace zip + persist. | Save As writes this zip/json. |
| `src/views/ExampleSessions.tsx` / sidebar sessions tab | In-app session list. | IDE-10 named sessions: this list + OS file, not a second store. |
| `src/views/ModelSelectionDialog.tsx` | Ollama + cloud models. | NEW-06 offline / "data did not leave" badge: model provider + desktop flag. |
| `src/views/LocalInstallUpgradePanel.tsx` | Advertises local large files. | Align copy with NEW-03/NEW-05. |
| `src/scss/App.scss` | Allotment sash colors. | Leave unless three-pane tweak. |

**HTML drop vs native drop:** `UnifiedDataUploadDialog` `onDrop={handleFileDrop}` and `AgentChatInput` Files drag are browser File API. Desktop large-file honesty requires the Python drop handler.

---

### F-report-pack

IDs: IDE-14, REP-01, REP-02, REP-03, IDE-11, NEW-11.

**Meaning:** stakeholder report embeds last chart **and** current table, one zip pack, stale if data moved.

| Path | Role now | Plug |
|------|----------|------|
| `src/views/ReportView.tsx` | Tiptap host. Copy (clipboard HTML with inlined images), PNG via html2canvas, PDF via print. `embedDimsFor` from chart cache. | REP-01 insert table-as-figure. REP-02 session pack zip. REP-03 stale badge using `contentSnapshotHash` vs table `contentHash` / focused thread. |
| `src/views/TiptapReportEditor.tsx` | Editor, clipboard write, `ResizableImageView` for charts. | Table node or HTML figure for current grid snapshot. Reuse chart embed pattern. |
| `src/app/dfSlice.tsx` `GeneratedReport` | `selectedChartIds`, `triggerTableId`, `parentNodeId`, `contentSnapshotHash`. | Stale = source table hash or thread head moved since snapshot. Do not compare only `updatedAt`. |
| `src/app/chartCache.ts` / `ChartRenderService.tsx` | SVG/PNG cache, thumbs. | Pack export should use cached PNG, not re-query the LLM. |
| `src/app/useAutoSave.tsx` | Workspace zip excludes thumbs. | REP-02 pack is a **user export** (tables + charts + report), distinct from workspace autosave. Can still use zip helpers. |
| `src/views/DataFormulator.tsx` | `viewMode === 'report'` replaces vis pane. | Stay. Insert-from-explore needs access to last focused chart + `FreeDataView` table while in report mode (or insert before switch). |
| `src/views/VisualizationView.tsx` | Vega embed; legend is not a filter. | NEW-11 legend-click: Vega-Lite `bind: "legend"` / selection. Do not invent a parallel filter model; map to existing inspect filters or a chart param, not a clean step. |
| `src/components/ChartTemplates.tsx` | Chart type catalog. | IDE-11 Show Me on selected fields. |
| `src/app/chartRecommendation.ts` | Field-based type pick. | Same. |
| `src/views/ChartifactDialog.tsx` | Chart export fill. | Optional pack helper; ReportView is the SSOT for report export. |

IDE-14 in the research table is P1 "narrative + embed + PNG/PDF" and is **mostly live**. Remaining work is table insert, pack zip, stale badge, Show Me polish, legend filter.

---

## Cross-feature wiring (who owns the shared object)

```
CatalogTree / sidebar  --load-->  DictTable (input)
        |                              |
        |                         DataView grid  --inspect filters-->  SAMPLE_TABLE
        |                              |
        |                         column verbs  --derive.code-->  DictTable (derived)
        |                              |                              |
   EncodingShelf  <----- tableRef -----  VisualizationView            |
        |                              |                              |
   DataThread (sidecar agent + cards)  |                              |
        |                              |                              |
        +---- parentNodeId / trigger --+                              |
                                       |                              |
                                  ReportView  <-- chart cache + table figure
                                       |
                                  viewMode editor|report
```

Desktop (`desktop.py`) wraps the same React app. It does not get its own data model.

---

## Risks

- **Load vs prep.** Extending `data_operations` with unpivot/join kinds looks convenient and breaks the load-plan hash/status machine (`DataOperationStatus`, `plan_hash`, connector-only executor). Applied steps belong on `DictTable.derive`.

- **Inspect filter vs transform.** If CLN-03 is implemented as extra `SAMPLE_TABLE` filters, refresh and export-without-filters will resurrect rows. Stakeholder reports will disagree with the grid.

- **Virtual tables.** In-place `rows` mutation will desync DuckDB. Every materializing verb must publish a workspace table and update `virtual.tableId`.

- **Undo (IDE-07) vs thread delete.** Deleting a derived table already reanchors children. A naive undo stack that re-inserts ids will fight `loadState` and persist. Design undo as a session-local command log or keep one derive-table per step and restore by id.

- **`codeSignature`.** Client-invented Python for grid verbs must still go through the server sign path, or replay/refresh will reject the code.

- **Clipboard vs large virtual tables.** Copy-all on a 2M-row table will freeze the WebView. Bound copy to loaded sample or an explicit export.

- **Allotment + steps rail + shelf.** Extra chrome steals `minChartHeight` 360. Put the steps rail in the grid header band, not by shrinking the plot. `layout.ts` is the budget.

- **`viewMode` steals the canvas.** Report cannot see the live grid unless insert copies a snapshot first. REP-01 should snapshot chart + table at click time.

- **Stale reports.** `contentSnapshotHash` exists but is unused as a badge. Hash only the triggering table and you will miss a join source change. Hash `derive.source` closure.

- **`sys.argv` clobber.** File Open With will never work until Flask args are set without dropping the OS document path. Single-instance socket must grow a path payload or Open With on a second launch is a no-op show().

- **HTML drop vs native drop.** Shipping only React `dataTransfer.files` leaves large local CSVs as in-memory File objects (NEW-03 miss).

- **`electronAPI` leftover.** Copy-paste from Electron docs will not run in pywebview.

- **Min size mismatch.** Native menu + three panes at 960x640 will clip; `MIN_SUPPORTED` says 1024.

- **Phase coupling.** F-clean-grid verbs without F-clean-steps will mutate with no replay. F-clean-steps without grid verbs will only wrap the agent. Plan-check should keep Phase A verbs writing `derive` even if the rail UI ships in Phase A+1.

- **CLN-06 cluster-and-merge.** Easy to sprawl into OpenRefine. Keep Phase A at fill/drop/cast/rename/trim; cluster is P1.

- **Tests.** Grid, report, and desktop have thin unit coverage. Filter vocabulary and `derive` insert/delete are the lock tests. Do not snapshot Allotment pixel layouts.

- **i18n freeze.** en/zh key equality will fail CI-local tests if only English menu strings land.

Skip unchanged: SQL drawer, command palette, dual-axis well, MCP server, notebooks, git, KNIME canvas, Electron rewrite.
