# F-clean-grid — UI expert (W-ide-ui)

Feature: F-clean-grid  
Role: ui-expert  
Scope: Kind R PENDING cleaning-on-grid IDs only  
Place: existing DataView / SelectableDataGrid  
Constraint: verbs on the grid, not a KNIME canvas. Agent stays sidecar. No new nav tab.

## 1. Meaning

Cleaning is a set of table verbs the user runs from the grid (column header, row selection, clipboard, and a column profile pane), each producing a named table transform, not a separate cleaning product or workflow canvas.

Out of scope: new IDE tabs or nav items; KNIME-style node canvas; agent-as-primary-cleaner; clustering (CLN-06, later/P1); new data-source surfaces; replacing the sidecar agent; bulk ETL designer.

## 2. Place / plug-in

All work lands in the existing data surface:

- `SelectableDataGrid` owns selection, copy, paste target, header context menu, and first-row-as-header affordance.
- `DataView` hosts the grid, wires transform dispatch, and hosts the column profile as a side panel of the same view (not a tab).
- Column profile (IDE-12 + NEW-08) is a slide-over or right rail inside DataView, opened from a header action or profile icon.
- Agent remains the existing sidecar. It may propose the same verbs; it does not become a second grid.

Do not add: Clean tab, Transform canvas, Cluster UI, or a standalone profiler route.

## 3. Approach

### Layers

1. **Grid chrome** — header menu (CLN-02), row selection actions (CLN-03), first-row-as-header (CLN-08), type-cast submenu (NEW-07), native copy (IDE-02), TSV/Excel paste (NEW-04).
2. **Profile rail** — per-column stats + fill / drop / exclude (IDE-12, NEW-08). Same verbs as the header menu; profile is discovery, menu is commit.
3. **Transform apply** — every verb is a table transform (history, undo, replay). UI only collects args and calls existing apply path. No silent in-place cell mutation except clipboard paste into a new or staging table if product already treats paste as a transform.
4. **Clipboard** — copy uses real selected cells (TSV). Paste parses Excel/TSV and inserts via the same transform/apply path.

### Likely files

- `apps/desktop` (or renderer) DataView / grid host
- `SelectableDataGrid` (selection, copy, paste, header menu)
- column header context menu component
- column profile panel (new file next to DataView, not a route)
- table transform types / apply command (existing pipeline)
- clipboard parse helper (TSV / Excel HTML table)

### Per-ID UI

| ID | Surface | Commit |
|---|---|---|
| CLN-02 | Column header menu: Rename, Split, Replace, Trim, Fill, Drop, Dedupe | Dialog or inline for rename/split/replace; confirm for drop/dedupe |
| CLN-03 | Row selection toolbar or context: Keep selected / Remove selected | Table transform, not hide-rows CSS |
| CLN-08 | Header or grid toolbar: Use first row as header | One-shot transform |
| NEW-07 | Header menu Type: infer + explicit casts | Cast transform |
| NEW-08 | Profile rail actions: fill / drop / exclude values | Same transforms as CLN-02 where they overlap |
| IDE-02 | Ctrl/Cmd-C on cell/range selection | Real TSV to clipboard |
| NEW-04 | Ctrl/Cmd-V on grid | Parse Excel/TSV; preview if shape is large or mismatched |
| IDE-12 | Open profile from header | Read-only stats + NEW-08 actions |
| CLN-06 | None this wave | Later / P1 |

## 4. Verdict draft

**SHAPE** (placement FIT, product shape already decided)

- FIT: reuse DataView + SelectableDataGrid; no new nav.
- SHAPE: verbs on the grid; profile is a rail; agent stays sidecar. This is the load-bearing rule.
- ASK: none required if transform apply + selection model already exist. ASK only if paste must choose overwrite vs new table and that policy is unset.
- UNFIT: none of these IDs, except CLN-06 which is deferred (not unfit).

Implement now: CLN-02, CLN-03, CLN-08, NEW-07, NEW-08, IDE-02, NEW-04, IDE-12.  
Defer: CLN-06.

## 5. Risks

- Header menu becomes a junk drawer if Split/Replace grow full dialogs; keep menus short, dialogs for args.
- Profile rail vs header menu can fork into two different fill/drop implementations; one transform API, two entry points.
- Fake copy (selected text only, or whole table always) fails IDE-02; must copy the selection range as TSV.
- Excel paste (HTML + TSV) can disagree on types and merged cells; prefer TSV, fall back to HTML table.
- Row keep/remove implemented as filter view instead of transform breaks replay and CLN-03.
- First-row-as-header twice, or after typed columns, can corrupt names; disable or warn when already applied.
- Type cast errors need a visible fail (bad cells) without leaving the grid.
- No new tab pressure: do not park profile under a "Data quality" route.
- CLN-06 scope creep (cluster-and-merge) will try to enter the same menu; keep it out.

## 6. Suggested chunks (ids only)

- CLN-02
- CLN-03
- CLN-08
- NEW-07
- IDE-02
- NEW-04
- IDE-12
- NEW-08
- CLN-06
