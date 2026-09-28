# Report - Datly professional data IDE plan

- **Kind:** R
- **Lane:** REPORT
- **Created:** 2026-08-19
- **Mode:** research
- **Map:** docs/lifecycle/project-map.md (CURRENT, brownfield, S8)
- **Research SSOT:** docs/lifecycle/product-research.md (W4)
- **Compare (secondary):** docs/lifecycle/waves/research-compare.md (W5 over-included SQL as P0; ignored)
- **Fallback:** DISPATCH-FALLBACK W6. Plan child stalled on extra reads. Earlier draft that marked SQL as P0 was rejected.

## Status board

Bucket A: data IDE chrome (user ask). Bucket B: friendliness. Bucket C: finish the current app. Bucket D: later / skip.

| ID | Item | Severity | Status |
|----|------|----------|--------|
| IDE-01 | Three-pane daily layout: catalog/fields, chart+grid, agent+thread | P0 | PENDING |
| IDE-02 | Results grid as a tool: sort, filter, search, type icons, copy | P0 | PENDING |
| IDE-03 | Schema / source browser (tables, columns, types) | P0 | PENDING |
| IDE-04 | Encoding shelf always visible with the chart | P0 | PENDING |
| IDE-05 | Desktop session restore (layout, last tables, last thread) | P0 | PENDING |
| IDE-06 | Keyboard for daily actions + short cheat sheet | P0 | PENDING |
| IDE-07 | Undo/redo for encodings and thread steps | P0 | PENDING |
| IDE-08 | Agent sidecar docked and collapsible (never the only editor) | P0 | PENDING |
| IDE-09 | First-run after model: sample data or open last / drop file | P1 | PENDING |
| IDE-10 | Named local sessions (open, save as). Not git repos | P1 | PENDING |
| IDE-11 | Chart chooser / Show Me on selected fields | P1 | PENDING |
| IDE-12 | Grid column profile (nulls, distinct, min/max/hist) | P1 | PENDING |
| IDE-13 | Knowledge panel stays session-local (not Hex Context Studio) | P1 | PENDING |
| IDE-14 | Report view polish (embed last chart, export PDF/PNG) | P1 | PENDING |
| A1 | CI: yarn test + pytest | P1 | DEFERRED |
| A2 | typecheck script + CI | P1 | DEFERRED |
| A3 | Frontend tests on analyst, chart, report, shelf | P1 | DEFERRED |
| A4 | Artifact proofs for zip / PNG / PDF | P1 | DEFERRED |
| A5 | Desktop in-scope + detect-capabilities | P1 | DONE |
| SQL-01 | Optional SQL drawer on current DuckDB/tables | P2 | DEFERRED |
| PAL-01 | Command palette | P2 | DEFERRED |
| SKIP | Notebooks, git projects, Hex apps/Slack, Count canvas, KNIME nodes, DataGrip SQL, Electron rewrite, silent Datly rebrand | - | DEFERRED |

Statuses: PENDING = pick to implement. DEFERRED = later unless you name it. DONE = already done this session.

## Summary

Datly (repo name) ships as Data Formulator: an AI visualization workspace. Load data, encode a chart on a shelf, talk to an agent, follow data threads, export a report. That primary job already works. A professional data IDE here means Positron/RStudio/Tableau chrome around that job: panes, a real grid, a schema tree, keyboard, undo, and a session that comes back. It does not mean notebooks, a SQL workbench as home, Hex data apps, or git projects. W5's SQL-as-P0 row is rejected (D-sql-drawer). Shape is slimmer than Hex, Jupyter, and DataGrip.

## Findings

| ID | Severity | Area | Summary | Evidence | Status |
|----|----------|------|---------|----------|--------|
| IDE-01 | P0 | Layout | Daily driver needs catalog, chart+grid, and agent visible without hunting. | Positron/RStudio/Tableau workspace; Reddit 2025 IDE thread | PENDING |
| IDE-02 | P0 | Grid | DataView is a preview. Professionals live in a grid that sorts, filters, copies. | Positron Data Explorer; DBeaver Data Editor | PENDING |
| IDE-03 | P0 | Catalog | 15+ connectors do not feel real without tables/columns/types in a tree. | Tableau Data pane; DataGrip navigator | PENDING |
| IDE-04 | P0 | Shelf | MSR thesis: encodings + short NL. Do not bury the shelf behind chat. | MSR Data Formulator blog; Tableau Marks card | PENDING |
| IDE-05 | P0 | Desktop | IndexedDB exists. Desktop users expect last session back. | JupyterLab workspaces; Tableau workbooks; user desktop seed | PENDING |
| IDE-06 | P0 | Keyboard | Mouse-only encoding is not professional. | DataGrip keymap; JupyterLab shortcuts | PENDING |
| IDE-07 | P0 | Undo | Tableau users treat unlimited undo as oxygen. | Tableau help; W4 demand synthesis | PENDING |
| IDE-08 | P0 | Agent | Keep the agent as sidecar with inspectable output, not a chat-only app. | Hex/Databricks sidecar pattern; our Data Thread | PENDING |
| IDE-09 | P1 | First-run | Model wall before the job is unfriendly. Keep model pick; land on drop-zone or last session. | Map F6; usability first-run honesty | PENDING |
| IDE-10 | P1 | Sessions | Workbook analogue. Not Hex projects or git. | Tableau/PBI desktop files | PENDING |
| IDE-11 | P1 | Charts | Show Me / templates on selected fields. Low cost. | Tableau Show Me; our ChartTemplates | PENDING |
| IDE-12 | P1 | Grid | Column profile speeds "is this the right table?" | Positron column summary | PENDING |
| IDE-13 | P1 | Knowledge | Keep small and local. Org semantic layer is a different product. | Hex Context Studio (skip); our KnowledgePanel | PENDING |
| IDE-14 | P1 | Reports | Reports live. Polish embed + export path. | Map ReportView; J5 | PENDING |
| A1-A4 | P1 | Quality | Primary job untested in CI. Pick this bucket to finish the current app instead of IDE chrome. | Map F1-F4 | DEFERRED |
| A5 | P1 | Process | detect-capabilities wrote writesFiles=true; desktop inScope=true this session. | project-state.json | DONE |
| SQL-01 | P2 | Analysis | Useful later as a drawer. Not home. Not DataGrip. | W4 later; D-sql-drawer | DEFERRED |

## SHAPE

We can ship the job if we **narrow** "professional data IDE" to IDE chrome around shelf + agent + threads. Drop as headline: notebook cells, first-class SQL, command palette, git, published apps, infinite canvas, wrangling nodes, Electron rewrite.

## Recommended phases (plan, not execute)

1. **Phase 1 (P0):** IDE-01, IDE-02, IDE-03, IDE-04, IDE-08 on desktop (and web parity).
2. **Phase 2:** IDE-05, IDE-06, IDE-07, IDE-09.
3. **Phase 3:** IDE-10, IDE-11, IDE-12, IDE-13, IDE-14.
4. **Not in these phases:** SQL-01, PAL-01, notebooks, git, Hex platform.

## Recommended pick sets

1. **`P0`:** IDE-01 through IDE-08 (data IDE chrome).
2. **Desktop friendliness:** IDE-05, IDE-06, IDE-09, IDE-01, IDE-08.
3. **`all`:** IDE-01 through IDE-14.
4. **Finish the current app instead:** A1-A4 (not data-IDE chrome).
5. **Do not pick** a silent Datly rebrand, Electron, or SQL as the first slice.

## Ease notes - desktop first session

- **Job:** Load data, get a chart, optionally save a report.
- **Steps today:** launch -> model overlay -> find connect -> agent/shelf -> chart.
- **Hardest decision:** model before the job is visible.
- **Brand:** UI says Data Formulator. Repo says Datly. Skip rename until a ship-name decision.

## Notes

- In scope: project map, category research (Hex, Positron, Databricks, Count/Observable, DataGrip/DBeaver, Tableau/PBI, KNIME/Alteryx), demand (Reddit 2025, HN notebooks, Hex review), include table, this plan.
- Not run: live desktop screenshots; G2 HTML (JS-blocked); pywebview docking spike.
- No [impl] until you name IDs (or `all` / `P0`).
