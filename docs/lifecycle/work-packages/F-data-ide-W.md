# Work package - F-data-ide analysis cleaning reporting

- **Status:** ACCEPTED
- **Kind:** W
- **Session focus:** desktop
- **Ship targets:** web, desktop
- **Features:** F-clean-grid, F-clean-steps, F-ide-desktop, F-report-pack
- **Source ask:** docs/lifecycle/feature-ask.md
- **Source report:** docs/lifecycle/reports/research-missing-features-2026-08-19.md
- **Wave A:** neighborhood, ui-expert (F-clean-grid), be-expert (F-clean-steps), arch-expert (all DONE)

## Ask / out of scope

Verbatim: lets implement them all

Lane BUILD. Implement every Kind R **PENDING** id from the 2026-08-19 missing-features report. One plan, four features, phased.

**IDs in (PENDING only)**

| Feature | IDs |
|---------|-----|
| F-clean-grid | CLN-02, CLN-03, CLN-08, NEW-07, NEW-08, IDE-02, NEW-04, IDE-12, CLN-06 |
| F-clean-steps | CLN-01, CLN-04, CLN-05, CLN-07, CLN-09, NEW-09, IDE-07, NEW-12 |
| F-ide-desktop | IDE-01, IDE-03, IDE-04, IDE-05, IDE-06, IDE-08, IDE-09, IDE-10, NEW-01, NEW-02, NEW-03, NEW-05, NEW-06 |
| F-report-pack | IDE-14, REP-01, REP-02, REP-03, IDE-11, NEW-11 |

CLN-06, CLN-09, NEW-02, IDE-11, NEW-11 stay in this plan as later P1 chunks. They are not Phase A.

**Out of scope (DEFERRED / skip)**

- SQL-01 SQL drawer
- PAL-01 command palette
- NEW-13 dual-axis well
- NEW-15 local opt-in MCP server
- SKIP: notebooks as home, git projects, Hex apps/Slack, Count canvas, KNIME/Alteryx node canvas, DataGrip-as-home, Electron rewrite, Tableau Stories, org semantic layer, Wikidata reconcile
- New top nav
- Node canvas
- New transform engine
- Extending `data_operations` (`connector_query` load plans) into prep
- Reviving `dataCleanBlocks` / `focusedDataCleanBlockId` / `cleanInProgress`
- Growing `electron/` as the ship path
- Second grid, second table model, second design kit (Tailwind/shadcn)
- Making the agent the only cleaner

## Meaning (four features)

Desktop IDE for analysis, cleaning, and reporting. Agent stays sidecar. Cleaning verbs live on the grid.

- **F-clean-grid:** Analyst right-clicks a column and cleans it without chat. Grid copies and pastes like Excel.
- **F-clean-steps:** Every clean is a named step they can undo, replay, and refresh.
- **F-ide-desktop:** Catalog, grid+chart, and agent stay visible. Desktop File menu, drop, restore.
- **F-report-pack:** Stakeholder report embeds the last chart and table, exports as one pack, warns if data moved.

Who: desktop (and web renderer) analysts already in Datly.

Entry → success: open a table → select cells and copy TSV / paste a spreadsheet as a new table → column menu and profile apply named cleans with no model selected → steps rail shows those cleans, undo and F5 work → catalog + grid+chart + agent stay on screen, File menu / drop / restore on desktop → report inserts last chart and current table, one zip pack, stale if the derive-source closure moved.

## Verdict (SHAPE)

**SHAPE** (logged in feature-ask, neighborhood, ui, be, arch). Fits the product job. IA does not need a user decision. User already named every PENDING Kind R id.

Not FIT: four parallel rewrites would fork a prep engine, a second workbench, or a native-shell rewrite. Live chrome is still agent-first cleaning.

Not ASK: paste policy, apply contract, and later-P1 placement are locked below. No user question.

Not UNFIT if we reuse `DataView` / `SelectableDataGrid`, `DictTable.derive` + signed sandbox, existing sidebar + Allotment + `viewMode`, `desktop.py` pywebview, `ReportView` Tiptap.

**What we slim**

- One plan, four phases. Execute Phase A (F-clean-grid) first after plan-check. B, C, D stay in this file as later chunks.
- No new top nav. No node canvas. No new transform engine. `data_operations` stays load-only (`kind: connector_query`).
- Prep = `DictTable.derive` + signed sandbox Python. Server compile+sign for UI verbs. Never exec client-authored Python. Never mutate `table.rows` in place on virtual tables and call it the file.
- Phase A apply: each verb inserts one `derivedTables` child with templated `derive.code`, `codeSignature`, `source: [parentId]`, `trigger.source: "user"`, `parentNodeId` set. Focus the new table. Replay works before the rail exists.
- Phase B projects a named `CleanStep[]` over that lineage (kind + params + signed code). Rail on the current grid, not a second DataThread and not a KNIME canvas. Join / pivot / group-by are dialogs that emit one derive.
- Phase C tightens the live three panes and pywebview chrome. Do not add a third Allotment column for the agent.
- Phase D extends Tiptap. Pack is a user export, not a second document model.
- Later P1, same plan, not Phase A: CLN-06 cluster-and-merge, CLN-09 sample-then-apply-full, NEW-02 session as OS document, IDE-11 Show Me polish, NEW-11 legend-click filter.
- Paste (NEW-04): Ctrl/Cmd-V of TSV / Excel HTML table creates a **new input table** via existing `createTableFromText` (same parser as the upload paste tab). It does not overwrite the focused table.
- Copy (IDE-02): selected cell range as TSV. Virtual tables bound the copy to the loaded sample (or an explicit export). Do not dump the full file into the clipboard.

## Place / grain

No new route. No Clean tab. No profiler route. No fourth desktop pane.

| Job | Live place | After |
|-----|------------|--------|
| Results grid | `src/views/DataView.tsx` (`FreeDataViewFC`) + `src/views/SelectableDataGrid.tsx` | Selection, TSV copy/paste, column menu, header promote. Inspect sort/filter/search stay. |
| Column inspect | `src/views/ColumnFilterPopover.tsx` + `fetchColumnStats` | Profile actions attach here or as a DataView slide-over. New transform callback. Do not overload `onApply(ColumnFilter)`. |
| Table model | `DictTable` in `src/components/ComponentType.tsx` | Every materializing clean is another `DictTable` with signed `derive`. |
| Apply / replay | sandbox + `POST /api/agent/refresh-derived-data` + HMAC `codeSignature` | Phase A verbs: server compile+sign+run, then `insertDerivedTables`. Phase B: same path for rail replay. |
| Steps rail | none today | Thin strip in current grid chrome (DataView header band or VisualizationView bottom). Not a new Allotment pane. Not DataThread. |
| Thread / agent | `src/views/DataThread.tsx`, `DataThreadCards.tsx` | Analysis timeline + sidecar. Pin/re-run shows signed `derive.code`. Do not hide code behind chat. |
| Workbench | `DataFormulator.tsx` Allotment: sidebar outside, thread \| canvas; `viewMode` editor \| report | Density only. Catalog types. Shelf stays with the chart. Phone Thread/Canvas tabs stay. |
| Desktop shell | `py-src/data_formulator/desktop.py` + `src/app/desktop.ts` | Native File/Edit/View/Help, argv before Flask overwrite, full-path drop, honesty + offline badges. |
| Reports | `ReportView.tsx` + `TiptapReportEditor.tsx` | Insert last chart **and** current table snapshot. Session pack zip. Stale badge on derive-source closure. |
| Load plans | `py-src/data_formulator/data_operations/` | Untouched. Import filters only. |

**Section grain (unique jobs)**

| Surface | Job |
|---------|-----|
| Catalog / sidebar | Sources, sessions, knowledge. Field types (IDE-03). |
| Grid | Inspect + clean verbs + clipboard. |
| Steps rail | Applied transforms on the **focused** table. |
| DataThread | Authored analysis history + sidecar agent. |
| Encoding shelf | Chart encode. Stays with the chart. Not a fourth pane. |
| Report | Stakeholder narrative. `viewMode` only. |

Do not reprint the thread as the rail. Do not reprint the catalog as a new nav section.

**Sacred contracts (do not break)**

1. Inspect filter ops stay `range` | `in` | `contains`. Clean verbs are not new filter ops.
2. Virtual sample vs full table: `virtual.rowCount` is truth. NEW-05 badge must not lie.
3. `derive` is provenance + replay. `parentNodeId` is the thread edge; `trigger.tableId` is data provenance. Do not collapse the two ids.
4. Deleting a table reanchors via existing insert/delete helpers.
5. `viewMode`: `'editor' | 'report'` only. No third top nav.
6. Allotment + `layout.ts` budget. Do not shrink `minChartHeight` 360. Steps rail lives in the grid header band. `MIN_SUPPORTED` 1024x600. `desktop.py` `min_size` must not be "fixed" without the other.
7. Desktop is pywebview, not Electron. `?desktop=1`. Single-instance socket must grow a path payload when Open With lands (NEW-02 later).
8. No node canvas. Join / unpivot / group-by emit one `DictTable`.
9. Agent is sidecar. Grid verbs work with the model offline.
10. Persist + migrations: bump `DF_STATE_VERSION` when Phase B persists `CleanStep[]`. `chartThumbnails` stays transient.
11. i18n: new strings through `t()`. Fill all six locales (`en zh ja ko fr de`). No English stubs.
12. Stack: MUI + Emotion + existing Sass. API via `apiRequest` / `fetchWithIdentity`.
13. Code execution in `LocalSandbox`, not the Flask process.

**Write-set exclusivity (implementers serial on these files)**

| File | Owner |
|------|--------|
| `SelectableDataGrid.tsx`, `DataView.tsx`, `DataView.scss`, `ColumnFilterPopover.tsx` | Phase A only |
| `src/data/types.ts` | A (NEW-07) |
| `ComponentType.tsx` | A+B (derive / CleanStep). Freeze before C/D write. |
| `dfSlice.tsx` | Sequential A then B then C then D. Prefer `src/app/cleanVerbs.ts` + existing add-table in A. |
| `stateMigrations.ts` | Phase that first persists new fields (B). |
| `DataThread.tsx`, `DataThreadCards.tsx` | B |
| `useDataRefresh.tsx` | B (NEW-12) |
| `DataFormulator.tsx`, `layout.ts`, `IslandHeader.tsx`, `WorkspaceMenu.tsx`, `CatalogTree.tsx`, `desktop.py`, `desktop.ts` | C |
| `ReportView.tsx`, `TiptapReportEditor.tsx` | D |
| `data_operations/*` | Do not touch |

A/B/D do not change pane topology. C does not restack the grid. Do not run A and C writers together on `VisualizationView` / `dfSlice`.

**New files allowed:** `src/app/cleanVerbs.ts`, `py-src/data_formulator/clean_steps/` (compile+sign templates), steps rail component, cheat sheet dialog, pack zip helper. Not a new app tree.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-grid-menu | Column menu, arg dialogs, empty/error, one CTA. Profile and report insert reuse the same craft bar. |
| section-grain | C-steps-rail | Rail is the applied-steps job. Must not reprint DataThread or add a Clean nav section. |
| phone-chrome | n/a | This job does not ship new phone chrome. Existing Thread/Canvas tabs stay. No FAB, dock, or notch work. |
| web-layout | C-desk-panes | Web is a ship target. Workbench density on the live split at more than one width. |
| desktop-chrome | C-desk-os | Native File/Edit/View/Help, titlebar, full-path drop, min-size alignment with `layout.ts`. |
| first-run | C-desk-session | IDE-09: after the existing model wall, offer last session / drop / sample. LanguageScreen and the model wall stay. |
| value-slide | n/a | Product has no value-slide art. This job does not add teach slides. |
| app-polish | C-desk-os | Help / About / Preferences via the native (or IslandHeader File) menu. No demo seed. Icons and Legal text are not rewritten. |
| notifications | n/a | No reminders or local alerts. |
| i18n | C-grid-clipboard | First new strings use `t()`. Every later chunk adds keys the same way. All six locales stay equal. No English pasted into ja/ko/fr/de. |
| hardware-back | n/a | No new nested mobile screen. Hardware Back is not in this ship set. |

## Chunks

Phase A is implementable with **no** B/C/D code. First impl chunk is `C-grid-clipboard`.

| ID | Goal | Depends | Acceptance | Feature |
|----|------|---------|------------|---------|
| C-grid-clipboard | IDE-02 copy + NEW-04 paste. Range selection. TSV out. Excel/TSV in as a new table. | none | `SelectableDataGrid` has cell/range selection. Ctrl/Cmd-C copies the **selection** as TSV (not selected-text-only, not always the whole table). Virtual copy is bounded to the loaded sample or an explicit export; never 50M rows into the clipboard. Ctrl/Cmd-V when the grid (or empty canvas) is focused parses TSV first, then Excel HTML table, via `createTableFromText` / the upload paste parser. Paste **creates a new input table**. It does not overwrite the focused table. Hidden paste tab may remain; OS/global paste is first-class. Works with no model selected. New strings `t()` in en zh ja ko fr de. Unit tests: TSV serialize of a range; parse of TSV and HTML table. Do not touch `data_operations`, `desktop.py`, `ReportView`. | F-clean-grid |
| C-grid-menu | CLN-02, CLN-03, CLN-08, NEW-07. Column kebab + row keep/remove + header promote + type cast. Server compile+sign. One derive child per verb. | C-grid-clipboard | Header menu: Rename, Split, Replace, Trim, Fill, Drop, Dedupe. Type submenu from existing `Type` enum (NEW-07). Promote first row as header (CLN-08); disable or warn if already applied. Row keep/remove (CLN-03) is a **table derive**, not a `SAMPLE_TABLE` / inspect filter and not hide-rows CSS. Each verb: server compiles templated pandas/DuckDB Python, signs it, sandbox-runs it, inserts one `derivedTables` node (`derive.source`, `derive.code`, `codeSignature`, `outputVariable`, `trigger.source: "user"`, `parentNodeId`), focuses the new table. No LLM. No unsigned client Python. No in-place mutate of virtual `rows`. Inspect filter vocabulary unchanged. Cast failures visible on the grid. CLN-06 is **not** in this menu. Works with no model. Apply helper lives in `src/app/cleanVerbs.ts` (or `tableThunks`) plus `py-src/data_formulator/clean_steps/` compile+sign route. Derive-code snapshot tests per verb. Filter lock tests still pass. | F-clean-grid |
| C-grid-profile | IDE-12 + NEW-08. Header profile using `fetchColumnStats`. Fill / drop / exclude call the same apply helper. | C-grid-menu | Open profile from the header (popover or DataView slide-over, not a route). Shows nulls, distinct, min/max, and a simple hist when stats exist. Actions: fill, drop, exclude nulls / values. Those actions call the **same** compile+sign apply as C-grid-menu. Do not overload `onApply(ColumnFilter)`. Do not add a Data quality nav item. Six locales. | F-clean-grid |
| C-steps-model | CLN-01 model. Named step projection over the focused table's derive chain. Persist. | C-grid-menu | `CleanStep` record: `id`, `kind`, `label`, `enabled`, `params`, `code`, `codeSignature`, `outputVariable`. Kinds include Phase A verbs plus `source`, `pivot`, `unpivot`, `join`, `union`, `append`, `groupby`, `generated`. Persist on the table or a sibling map. Bump `DF_STATE_VERSION` and migrate; default empty steps without dropping `derive`. Do not revive `dataCleanBlocks`. Do not add kinds to `ConnectorQueryStep`. Server still stores signed code so refresh survives reload. | F-clean-steps |
| C-steps-rail | CLN-01 UI. Steps rail on the current grid. | C-steps-model | Named list for the focused table: see, disable/drop, focus. Lives in the grid header band (or VisualizationView bottom). Not a new Allotment pane. Not a node canvas. Does not steal `minChartHeight` 360. Collapses on `heightClass === 'short'`. Optional cousin chip on `DataThreadCards`. Unique job vs thread. Six locales. | F-clean-steps |
| C-steps-reshape | CLN-04 pivot/unpivot, CLN-05 join/union/append, CLN-07 group-by **to table**. Dialogs only. | C-steps-model | One signed derive step each. Left table = focused `DictTable`. Join/union right table from `getAllTables` (already loaded). `derive.source[]` lists **all** parents. Group-by writes a parquet table; do not reuse `_build_sample_sql` chart agg. Chart shelf agg stays STYLE. No canvas of nodes. Validation: keys exist, join table in workspace, agg allowlist. | F-clean-steps |
| C-steps-undo | IDE-07 undo/redo of clean + encode + thread. | C-steps-model | Session command stack (in-memory + session persist). Undo clean restores the previous signed pipeline and does not orphan parquet (`deleteTablesFromWorkspace`). Undo encode is Redux only. Undo thread uses existing delete/reparent. Cmd/Ctrl+Z does not steal CodeMirror when the editor is focused. Do not fake undo by deleting tables with no stack. | F-clean-steps |
| C-steps-rerun | NEW-09 pin/show/re-run. NEW-12 F5 / menu refresh. | C-steps-model | Pin is the signed `derive.code` artifact. Show + re-run via existing code dialog + `/refresh-derived-data` (verify signature). Export `refreshTable` / `refreshAll` from `useDataRefresh` (or a thunk) that calls the same `performRefresh` path. F5 / header Refresh uses that export. Do not add a parallel fetch. Manual F5 must not rebuild all refresh intervals. CLN-09 is **not** this chunk. | F-clean-steps |
| C-desk-panes | IDE-01, IDE-03, IDE-04, IDE-08. Tighten live panes. Catalog types. Keep shelf. Agent sidecar. | none (run after B in the wave) | Sidebar + thread \| canvas stay. No new top nav. No third Allotment column for the agent. Closing the canvas is allowed; agent is never the only editor. `CatalogTree` surfaces field types. Encoding shelf stays reachable with the chart (Popper OK; permanent strip only if `fitsHeight` still holds). Phone Thread/Canvas tabs unchanged. Do not shrink `minChartHeight`. If native `min_size` is touched, align `layout.ts` `MIN_SUPPORTED` in the same change. Web proof at more than one width (not one desktop width as Done). | F-ide-desktop |
| C-desk-keys | IDE-06 keyboard + cheat sheet. | C-desk-panes | Map + cheat sheet on the existing `keydown` listener (`IslandHeader` already has Ctrl+,). Documents copy/paste, clean undo, F5, File shortcuts. Does not steal CodeMirror or find-in-grid. Six locales. | F-ide-desktop |
| C-desk-session | IDE-05 restore, IDE-10 Save As, IDE-09 after-model last / drop / sample. | none (run after B in the wave) | Last session restores via existing persist / `workspaceService`. Save As writes the existing workspace zip/json (named local session). After the **existing** model wall: offer last session, file drop, or sample. Do not add value slides. Do not rip LanguageScreen or the model wall. | F-ide-desktop |
| C-desk-os | NEW-01 native menu, NEW-03 full-path drop, NEW-05 sample/full/DuckDB badge, NEW-06 offline / data-did-not-leave. | C-desk-session | `desktop.py` `webview.start(menu=...)` File/Edit/View/Help + Preferences. Menu actions call existing dialogs (upload, config, about). Not a second AppBar row of File/Edit/View/Help buttons. Not Electron. NEW-03: pywebview full-path drop, not HTML `FileList` as the only path. NEW-05 badge on the grid: sample vs full vs DuckDB spill, honest to `virtual.rowCount`. NEW-06 badge: model provider + desktop flag ("data did not leave" only when that is true). Parse `sys.argv` **before** Flask overwrite. Titlebar drag/no-drag stays honest. Six locales. | F-ide-desktop |
| C-rep-insert | IDE-14 remainder + REP-01. One click: last chart **and** current table into the report. | none (run after C in the wave) | Snapshot chart + table **at click time** (report `viewMode` steals the live grid). Table-as-figure follows the existing chart embed pattern in Tiptap. PNG/PDF paths stay. Works from explore or a slot that still has focused chart + table ids. Six locales. | F-report-pack |
| C-rep-pack | REP-02 session pack zip. | C-rep-insert | One user export: tables + cached chart PNGs + report. Distinct from workspace autosave (autosave still excludes thumbs). Uses existing zip / export helpers + `workspaceService`. Does not re-query the LLM. Does not replace PNG/PDF download. | F-report-pack |
| C-rep-stale | REP-03 stale badge. | C-rep-insert | Badge when `contentSnapshotHash` disagrees with the triggering table **and** the `derive.source` closure (`contentHash`). Do not compare only `updatedAt`. Hashing only `triggerTableId` is not enough (join source change must stale). | F-report-pack |
| C-cln-cluster | CLN-06 facet similar values / cluster-and-merge. P1. | C-grid-profile, C-steps-rail | Cluster API + merge verb as one signed derive. Not Wikidata reconcile. Not Phase A. Keep out of the Phase A menu until this chunk. | F-clean-grid |
| C-cln-sample-apply | CLN-09 clean on a sample, apply to the full file. P1. | C-steps-rerun, C-desk-os | Preview stamps `previewedOn` (tableId, contentHash, rowCount). Apply runs the same signed code on the full workspace parquet, then returns a display sample. Do not replace full parquet with the preview frame. Join-on-sample warns that missing keys can lie. Honesty badge (NEW-05) already shipped. | F-clean-steps |
| C-desk-document | NEW-02 session as an OS document (Open With / file association). P1. | C-desk-session, C-desk-os | Installer / document types. Single-instance socket carries a path payload (today it only activates). Argv path already parsed in C-desk-os. Not an Electron rewrite. | F-ide-desktop |
| C-rep-showme | IDE-11 Show Me on selected fields. P1. | C-desk-panes | Polish existing `ChartTemplates` + `chartRecommendation.ts`. Do not add a new chooser route or a fourth pane. | F-report-pack |
| C-rep-legend | NEW-11 legend-click filter. P1. | C-rep-insert | Vega-Lite legend bind / selection mapped to existing inspect filters or a chart param. Not a clean step unless the user commits a table filter derive. No parallel filter model. | F-report-pack |

**Implement order (serial on conflict files)**

1. Plan-check on this SHAPE.
2. Phase A: `C-grid-clipboard` → `C-grid-menu` → `C-grid-profile`.
3. Phase B: `C-steps-model` → `C-steps-rail` → `C-steps-reshape` → `C-steps-undo` → `C-steps-rerun`.
4. Phase C: `C-desk-panes` → `C-desk-keys` → `C-desk-session` → `C-desk-os`.
5. Phase D: `C-rep-insert` → `C-rep-pack` → `C-rep-stale`.
6. Later P1: `C-cln-cluster`, `C-cln-sample-apply`, `C-desk-document`, `C-rep-showme`, `C-rep-legend` (respect Depends; do not start in Phase A).

Neighborhood and specialists may plan in parallel. Implementers are serial on the write-set table.

**ID coverage (every PENDING id has a chunk)**

| ID | Chunk | Phase |
|----|-------|-------|
| IDE-02, NEW-04 | C-grid-clipboard | A |
| CLN-02, CLN-03, CLN-08, NEW-07 | C-grid-menu | A |
| IDE-12, NEW-08 | C-grid-profile | A |
| CLN-01 | C-steps-model + C-steps-rail | B |
| CLN-04, CLN-05, CLN-07 | C-steps-reshape | B |
| IDE-07 | C-steps-undo | B |
| NEW-09, NEW-12 | C-steps-rerun | B |
| IDE-01, IDE-03, IDE-04, IDE-08 | C-desk-panes | C |
| IDE-06 | C-desk-keys | C |
| IDE-05, IDE-09, IDE-10 | C-desk-session | C |
| NEW-01, NEW-03, NEW-05, NEW-06 | C-desk-os | C |
| IDE-14, REP-01 | C-rep-insert | D |
| REP-02 | C-rep-pack | D |
| REP-03 | C-rep-stale | D |
| CLN-06 | C-cln-cluster | later P1 |
| CLN-09 | C-cln-sample-apply | later P1 |
| NEW-02 | C-desk-document | later P1 |
| IDE-11 | C-rep-showme | later P1 |
| NEW-11 | C-rep-legend | later P1 |

## Proof

- Campaign / S9: after each feature (not after every chunk). Phase A panel: clipboard range TSV, paste new table, menu verbs write signed derive, profile actions share apply, inspect filters unchanged, no model required, no desktop GUI required. Phase B: rail, reshape dialogs, undo stack, pin/re-run, F5. Phase C: pane topology, cheat sheet, restore/Save As/after-model, native menu + full-path drop + honesty badges. Phase D: insert snapshot, pack zip, stale on source-closure hash. Later P1 has its own panel when started.
- Flags: shipsNotifications false. writesOutput true (clipboard, derived parquet, Save As, report pack zip). siblingFamily F-clean-grid, F-clean-steps, F-ide-desktop, F-report-pack.
- Tests to extend: grid / derive insert-delete / filter vocabulary / workspace / report unit tests. Derive-code snapshot per verb. Migrate when B persists steps. Do not snapshot Allotment pixels. Do not require a running desktop GUI for Phase A.
- i18n: `tests/frontend/unit/app/i18nLocales.test.ts` key equality across six locales stays green.

## User questions

None. SHAPE is logged. BUILD proceeds after Manager plan-check.
