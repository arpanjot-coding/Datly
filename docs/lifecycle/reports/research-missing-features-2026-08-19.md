# Report - Missing features for a data analysis, cleaning, and reporting IDE

- **Kind:** R
- **Lane:** REPORT
- **Created:** 2026-08-19
- **Updated:** 2026-08-19 (re-check)
- **Mode:** research
- **Product (user lock this turn):** a desktop IDE for **analysis**, **cleaning**, and **reporting**. Not a viz toy. Not a SQL workbench as home. Not a KNIME node canvas.
- **Session focus:** desktop (pywebview). Ship: web + desktop.
- **Wave 1:** `docs/lifecycle/waves/gap-us-inventory.md`, `gap-rivals.md`, `gap-demand.md`, `gap-desktop.md`
- **Code re-check:** `DataView` / `SelectableDataGrid`, `ReportView`, `agent_simple.py` STYLE vs DATA, `data_operations/` (load plans, not prep UI)

The earlier pass skipped join, unpivot, fill, and applied steps because they looked like KNIME. That skip is withdrawn. Cleaning is a core job. The skip is the **node canvas**, not the verbs.

## Status board

PENDING = pick to implement. DEFERRED = later unless you name it.

### Cleaning (was under-weighted)

| ID | Item | Severity | We have | Status |
|----|------|----------|---------|--------|
| CLN-01 | Applied steps: named, replayable, refreshable transform history | P0 | Threads + generated code, not a step list you can edit/replay | PENDING |
| CLN-02 | Column menu: rename, split, replace, trim, fill, drop, dedupe | P0 | Agent-only. Grid has sort/filter, not clean verbs | PENDING |
| CLN-03 | Row keep/remove as a table transform (not only a chart filter) | P0 | `nl_to_filter` and grid column filters are inspect/viz | PENDING |
| CLN-04 | Pivot / unpivot from the grid | P0 | Agent DATA prompt can reshape. No grid verb | PENDING |
| CLN-05 | Join / union / append on tables already loaded | P0 | Agent "bring in a field from another table". No dialog | PENDING |
| NEW-07 | One-click type cast on the field / column icon | P0 | Types shown. No cast | PENDING |
| NEW-08 | Profile actions: fill / drop / exclude nulls | P0 | No column profile actions | PENDING |
| CLN-08 | Promote first row as header; treat CSV junk headers | P0 | Loaders guess. No user fix | PENDING |
| IDE-07 | Undo/redo of clean + encode + thread steps | P0 | Sample-undo and CodeMirror only | PENDING |
| NEW-09 | Pin / show / re-run the generated transform | P0 | Threads exist; code is not a first-class artifact | PENDING |
| CLN-07 | Group by / aggregate to a **table** (not only a chart agg) | P1 | Chart aggregation on the shelf | PENDING |
| CLN-06 | Facet similar values / cluster-and-merge (OpenRefine) | P1 | Missing | PENDING |
| CLN-09 | Clean on a sample, apply to the full file | P1 | Virtual sample exists for inspect | PENDING |

### Analysis

| ID | Item | Severity | We have | Status |
|----|------|----------|---------|--------|
| IDE-01 | Three-pane: catalog, grid+chart, agent | P0 | Sidebar + views, not a workbench | PENDING |
| IDE-02 | Results grid as a tool: sort, filter, search, copy | P0 | Sample grid + column filter. No copy | PENDING |
| IDE-03 | Schema / field browser with types | P0 | CatalogTree, thin | PENDING |
| IDE-04 | Encoding shelf always visible with the chart | P0 | Live. Keep it | PENDING |
| IDE-06 | Keyboard + cheat sheet | P0 | keydown listener, no map | PENDING |
| IDE-08 | Agent sidecar, never the only editor | P0 | DataThread live | PENDING |
| IDE-11 | Chart chooser / Show Me on selected fields | P1 | Partial templates | PENDING |
| IDE-12 | Column profile (nulls, distinct, min/max/hist) | P1 | Missing | PENDING |
| NEW-11 | Legend-click filter | P1 | Missing | PENDING |
| NEW-05 | Large-file honesty (sample vs full vs DuckDB spill) | P0 | Virtual sample; no badge/contract | PENDING |

### Reporting

| ID | Item | Severity | We have | Status |
|----|------|----------|---------|--------|
| IDE-14 | Report: narrative + embed charts + PNG/PDF | P1 | Live Tiptap, copy, PNG, PDF print | PENDING |
| REP-01 | Insert last chart **and** current table into the report in one click | P1 | Chart embed exists; table-as-figure is weak | PENDING |
| REP-02 | Export a session pack (tables + charts + report) as one zip | P1 | CSV/zip/PNG/PDF exist as separate paths | PENDING |
| REP-03 | Report stays tied to the last clean/analysis thread (stale badge) | P1 | View-mode on session; no "data moved" warning | PENDING |
| REP-04 | Pages / named views for a stakeholder walkthrough | P2 | Missing | DEFERRED |

### Desktop shell (still required)

| ID | Item | Severity | Status |
|----|------|----------|--------|
| IDE-05 | Session restore | P0 | PENDING |
| NEW-01 | Native File/Edit/View/Help + Preferences | P0 | PENDING |
| NEW-03 | OS drag-drop with full path | P0 | PENDING |
| NEW-04 | Paste Excel table in; copy TSV out | P0 | PENDING |
| NEW-02 | Session as an OS document | P1 | PENDING |
| NEW-06 | Offline / data-did-not-leave badge | P1 | PENDING |
| NEW-12 | Surface refresh (F5) on `useDataRefresh` | P1 | PENDING |
| IDE-09 | After model: last session / drop / sample | P1 | PENDING |
| IDE-10 | Named local sessions (Save As) | P1 | PENDING |

### Later / skip

| ID | Item | Status |
|----|------|--------|
| SQL-01 | SQL drawer on current tables | DEFERRED |
| PAL-01 | Command palette | DEFERRED |
| NEW-13 | Dual-axis well | DEFERRED |
| NEW-15 | Local opt-in MCP server | DEFERRED |
| SKIP | Notebooks as home, git projects, Hex apps/Slack, Count canvas, **KNIME/Alteryx node canvas**, DataGrip-as-home, Electron rewrite, Tableau Stories, org semantic layer, Wikidata reconcile | DEFERRED |

## Summary

Datly is already an AI viz workspace: load, shelf, agent, threads, Tiptap reports. That is **analysis + a report view**. It is not yet an IDE for **cleaning**. Cleaning today is "ask the agent to write Python." That is a sidecar, not the job. Power Query, OpenRefine, and Tableau Prep all treat cleaning as: see the table, apply a named step, undo it, refresh it. OpenRefine's homepage is facets, clustering, and infinite undo, on your machine. Microsoft documents Power Query as the thing people spend 80% of time on before analysis. If this product is analysis **and** cleaning **and** reporting, the missing P0 is a first-class clean surface on the grid (column menu + applied steps + join/unpivot/cast), not more chart chrome.

SHAPE: keep the agent for messy NL. Add the daily clean verbs on the table. Do not add a node canvas.

## What we already have (re-checked in code)

| Job | Live | Partial | Missing |
|-----|------|---------|---------|
| **Load** | 15+ connectors, upload dialog, loading chat, catalogs | Paste is a hidden tab; OS drop is HTML-only | Native drop, Open With |
| **Analysis** | Encoding shelf, Vega-Lite charts, agent, data threads, `nl_to_filter`, STYLE vs DATA routing | Grid sort/filter/search, catalog tree | Workbench panes, keymap, Show Me polish, column profile, legend filter |
| **Cleaning** | Agent can pivot/join/derive via generated sandbox Python; `data_operations` is **load** plans (filters on import), not prep | Grid inspect, virtual sample | Applied steps, column clean menu, row transforms, unpivot UI, join dialog, type cast, fill/dedupe, header promote, cluster |
| **Reporting** | Explore vs Reports viewMode, Tiptap, embed charts, copy, PNG, PDF print | Chart embed sizing | One-click table insert, stale-data badge, session pack export |
| **Desktop** | pywebview + PyInstaller, workspaces on disk, Ollama, `useDataRefresh` | Session list | Native menu, argv/Open With, full-path drop, grid copy |

## Why the last report was wrong

| Last report said | Reality for this product |
|------------------|--------------------------|
| Cleaning join/unpivot is later (looks like KNIME) | Cleaning is a **named job**. Skip the canvas. Keep join, unpivot, split, replace. |
| NEW-08 fill/drop is P1 | P0. Nulls are the first clean action after open. |
| NEW-14 join is P2 | P0/P1. Two tables is normal analysis, not a wrangling platform. |
| NEW-09 pin transform is P1 | P0. That **is** applied steps for an agent-first cleaner. |
| "Do not become a wrangling desktop" | Do not become KNIME. Do become Power Query + OpenRefine **verbs** next to the shelf. |

## Compare (three jobs)

| Capability | They have | We have | Users want? | Include? | Why |
|------------|-----------|---------|-------------|----------|-----|
| Applied steps / query history | Power Query Applied Steps; OpenRefine infinite history; Tableau Prep flow | Threads, not editable steps | Yes. Repeatable clean is the PQ pitch ([MS Learn](https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query)) | yes | CLN-01, NEW-09, IDE-07. This is the cleaning IDE. |
| Column clean verbs | PQ: split, replace, trim, fill, type, remove dupes ([Expertrain 2025](https://www.expertrain.co.uk/how-to/how-to-clean-data-using-power-query-in-excel)) | Agent only | Yes, daily | yes | CLN-02. |
| Type cast | Tableau Change Data Type; PQ Change Type | Display only | Yes (CSV / gene-name hate) | yes | NEW-07. |
| Pivot / unpivot | Tableau pivot; PQ Unpivot | Agent DATA prompt | Yes for Excel-shaped files | yes | CLN-04. |
| Join / union | Tableau Data Source; PQ merge/append | Agent "field from another table" | Yes | yes | CLN-05. Was wrongly skipped. |
| Facet / cluster | OpenRefine ([openrefine.org](https://openrefine.org/)) | No | Yes for messy categories | later | CLN-06. P1. Not Wikidata. |
| Grid as tool | Positron, DBeaver, PQ preview | Partial | Yes | yes | IDE-02, NEW-05. |
| Encoding + chart | Tableau, PBI | Live | Yes | yes | IDE-04, IDE-11. Differentiator. Keep. |
| Agent | Hex, Tableau Agent, PBI Copilot | Live sidecar | Yes, with audit | yes | IDE-08, NEW-10. Not the only cleaner. |
| Reports | PBI pages; Quarto; our Tiptap | Live | Yes | yes | IDE-14, REP-01..03. |
| Node canvas | KNIME, Alteryx, Tableau Prep | No | Prep specialists | no | Different UX. Verbs yes, canvas no. |
| Notebooks / git / DataGrip / Electron / Hex apps | various | No | Mixed | no | Still skip. |

## What we should have next

**P0 cleaning (the hole):** CLN-01, CLN-02, CLN-03, CLN-04, CLN-05, CLN-08, NEW-07, NEW-08, NEW-09, IDE-07.

**P0 analysis + desktop (still true):** IDE-01, IDE-02, IDE-03, IDE-04, IDE-05, IDE-06, IDE-08, NEW-01, NEW-03, NEW-04, NEW-05.

**P1 reporting:** IDE-14, REP-01, REP-02, REP-03.

**P1 rest:** CLN-06, CLN-07, CLN-09, IDE-09..13, NEW-02, NEW-06, NEW-10..12.

**Suggested phases (plan, not execute):**

1. **Clean on the table:** CLN-02, NEW-07, NEW-08, CLN-03, CLN-08, IDE-02, NEW-04 (grid you can trust, then verbs).
2. **Steps you can replay:** CLN-01, NEW-09, IDE-07, CLN-04, CLN-05, NEW-12.
3. **Workbench + desktop:** IDE-01, IDE-03, IDE-04, IDE-06, IDE-08, NEW-01, NEW-03, IDE-05, NEW-05.
4. **Report the result:** IDE-14, REP-01, REP-02, REP-03, IDE-11, IDE-12.

## Notes

- Analysis and reporting were already in the last report. Cleaning was the miss.
- `data_operations` is connector load/query (import filters), not a prep engine. Do not confuse it with Applied Steps.
- Agent STYLE vs DATA already knows pivot/join/derive. The gap is a **user-facing** clean UI plus a step list, not a new model.
- Still skip: notebooks, git, Hex Slack/apps, Count canvas, KNIME nodes, DataGrip home, Electron, org semantic layer.
- Do not implement until IDs are named (or `P0` / `all` / `cleaning`).
