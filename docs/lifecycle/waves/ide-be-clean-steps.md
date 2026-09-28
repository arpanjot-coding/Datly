# BE-expert: F-clean-steps (applied steps + join/pivot + undo + refresh)

Feature: F-clean-steps.  
Role: `[be-expert]`. Report only. Do not edit product code.  
Session focus: desktop. Ship: web + desktop.  
Source: `docs/lifecycle/feature-ask.md`, `docs/lifecycle/reports/research-missing-features-2026-08-19.md`.  
Checked: `py-src/data_formulator/data_operations/` (`models.py`, `executor.py`, `repository.py`, `actions.py`, `discovery.py`), `py-src/data_formulator/routes/agents.py` (`/refresh-derived-data`, `/data-operation-preview`), `py-src/data_formulator/routes/tables.py` (sample + DuckDB group-by), `py-src/data_formulator/analyst/skills/core/skill.py`, `py-src/data_formulator/analyst/agent.py` (`_run_visualize_code`), `py-src/data_formulator/sandbox/local_sandbox.py`, `py-src/data_formulator/security/code_signing.py`, `src/app/useDataRefresh.tsx`, `src/components/ComponentType.tsx` (`DictTable.derive`), `src/app/dfSlice.tsx` (`insertDerivedTables` / `promoteDraft`), `src/views/DataThread.tsx`.

IDs in: CLN-01, CLN-04, CLN-05, CLN-07, CLN-09, NEW-09, IDE-07, NEW-12.

No em dashes.

---

## 1. Meaning

Every clean is a named step on the current table. The analyst can see the list, disable or drop a step, replay it, and refresh it when source rows change. Pivot, unpivot, join, union/append, and group-by-to-table are verbs that append steps. Agent-generated Python is pin-able as a step (NEW-09), not a hidden sidecar. Sample-then-apply (CLN-09) means the grid preview can be a sample; Apply writes the full parquet. Undo (IDE-07) covers clean steps plus encode and thread commits, not only CodeMirror and random-sample restore. Refresh (NEW-12) is a visible F5 / menu command on the existing `useDataRefresh` path.

SHAPE constraint: a **steps rail** next to the current grid. Not a node canvas. Not a second transform engine.

### Out of scope

- KNIME / Alteryx / Tableau Prep node canvas.
- F-clean-grid column-menu verbs (CLN-02, CLN-03, CLN-08, NEW-07, NEW-08). Those emit steps into this model; they are not this job.
- F-ide-desktop panes / native File menu.
- SQL-01 drawer, notebooks, git, DataGrip-as-home.
- Extending `data_operations` ConnectorQuery load plans into a prep DAG.
- A new DuckDB/pandas runtime beside the agent sandbox.
- Making DataThread a flow editor.

---

## 2. Place / plug-in

Do not add a second store of executable Python. Load stays `data_operations`. Prep stays signed sandbox code plus workspace parquet, presented as a linear step list on the focused table.

| Layer | Path | Role today | Role for F-clean-steps |
|-------|------|------------|------------------------|
| Load plans | `py-src/data_formulator/data_operations/models.py` | Schema v1, **only** `ConnectorQueryStep` (`kind: connector_query`). `LoadQuery` = import filters / columns / one `order_by` / limit. | Leave as load. Optional: treat a completed load as step 0 provenance, do not add pivot/join kinds here. |
| Load persist | `data_operations/repository.py` | `data_operations.json` under workspace scratch, `WorkspaceLock`, statuses draft → awaiting_selection → running → loaded / failed / superseded. | Do not reuse this JSON as Applied Steps. Different job, different hash (import plan vs prep verbs). |
| Load exec | `data_operations/executor.py` | `fetch_data_as_arrow` + `write_parquet_from_arrow`. Provenance in `import_options.data_operation`. | Stay import-only. |
| Load API | `routes/agents.py` `/api/agent/data-operation-preview`, analyst streaming | User picks a load plan; tables appear as input tables. | First rail entry can *point at* a loaded table id. Execution still this path. |
| Transform exec | sandbox `run_python_code` (`local_sandbox.py`, docker) | pandas / numpy / DuckDB in warm subprocess. No network. | **The** step runner. Compile verbs to Python or re-run pinned `derive.code`. |
| Sign | `security/code_signing.py` `sign_result` / `verify_code` | HMAC on agent-generated code. | Every compiled or generated step that hits `/refresh-derived-data` must be signed. UI-compiled verbs need a **server-side compile+sign**, never unsigned client Python. |
| Re-run | `POST /api/agent/refresh-derived-data` | Requires `code`, `code_signature`, `output_variable`, `input_tables`; optional `virtual` + `output_table_name`. Writes parquet, returns sample rows. | Replay / refresh / sample-then-apply commit. Do not fork a second execute endpoint unless the request shape must carry a step list instead of one code blob. |
| Sample | `POST /api/tables/sample-table` | DuckDB or pandas sample, filters, chart-style aggregate in SQL (`GROUP BY` in `_build_sample_sql`). | CLN-09 preview. Chart agg is **not** a table transform. |
| Create | `POST /api/tables/create-table` | Upload / ingest. | Union/append of **files** is load. Union of **loaded tables** is a prep step. |
| Agent transform | `analyst/skills/core/skill.py` `visualize` → `AnalystAgent._run_visualize_code` | Runs Python, writes `d-{output_variable}` parquet, signs `transform_result`, mints `chart_id`. | NEW-09 pins the signed `code` as a step. Cleaning verbs should not require a chart. Today there is no `transform`-only action; visualize always expects a chart. Either add a thin `transform` action or allow visualize with empty chart (ASK if chart is required in the event contract). |
| Client table | `DictTable.derive` in `ComponentType.tsx` | One code blob: `source[]`, `code`, `codeSignature`, `outputVariable`, `trigger`, `dialog`. | Keep one derived table per **applied pipeline snapshot** (or per step if the rail maps 1:1 to thread children). Prefer **one table + step list** over N thread nodes per rename, or the rail and DataThread both explode. |
| Thread | `dfSlice` `createDraftNode` / `promoteDraft` / `insertDerivedTables`; `DataThread.tsx` | Branching analysis history. | Stay the analysis timeline. The steps rail is **not** a second DataThread. Focusing a thread node shows that table's rail. |
| Refresh hook | `src/app/useDataRefresh.tsx` | Interval timers via `selectRefreshConfigs`; stream/DB refresh; then re-run signed derived code on `contentHash` change. **No exported `refreshNow`.** | NEW-12: export a manual refresh (F5 / menu) that calls the same `performRefresh` / `refreshOneDerivedTable`. Do not add a parallel fetch. |
| Undo today | `DataView` `resetOrderToken`; CodeMirror history | Sample-order restore; editor undo. | Not workspace undo. IDE-07 needs a command stack, mostly client, with server delete/re-apply of parquet when a step is dropped. |

Call path to keep (replay / refresh):

```
signed code + code_signature
  → POST /api/agent/refresh-derived-data
  → verify_code
  → sandbox.run_python_code(workspace, output_variable)
  → workspace.write_parquet (if virtual)
  → sample rows to client
```

Call path **not** to hijack for prep:

```
DataOperationPlan (connector_query steps)
  → DataOperationExecutor.execute
  → ExternalDataLoader.fetch_data_as_arrow
```

---

## 3. Approach + likely files

Layers: step model → compile+sign → sandbox apply → sample vs full → pin agent code → undo commands → surface refresh.

### Step model (CLN-01)

Add a linear `CleanStep[]` owned by the focused table (session + workspace), not by `data_operations.json`.

Suggested step record (client + server agree; names can change in plan-check):

- `id`, `kind`, `label`, `enabled`, `params`, `code`, `codeSignature`, `outputVariable`
- `kind`: `source` | `pivot` | `unpivot` | `join` | `union` | `append` | `groupby` | `generated` | later grid verbs from F-clean-grid
- `source` step points at an existing `tableId` / load operation id; it does not re-fetch unless refresh

Persist next to session state (`derivedTables[].cleanSteps` or a sibling map keyed by table id). Server needs the compiled code on the workspace table metadata so refresh survives reload. Do not put unsandboxed SQL strings in Redux as the only truth.

One output parquet per table id (replace in place on Apply). DataThread still records a **commit** when the user accepts a material change they might branch from; intra-table step edits do not each mint a new thread column.

### Compile + run (do not invent an engine)

Server compiles `kind+params` to pandas/DuckDB Python (same libs as `execute_python_script` / visualize). Sign the compiled source. Run via existing sandbox.

Likely files:

- New: `py-src/data_formulator/clean_steps/models.py` (or `prep_steps/`) with frozen dataclasses, schema version, hash of enabled steps.
- New: `clean_steps/compile.py` mapping verbs to templates.
- New: `routes` under `/api/tables/` or `/api/agent/apply-clean-steps` that: compile, sign, run, write parquet, return sample + signature.
- Reuse: `sandbox.create_sandbox`, `sign_result` / `verify_code`, `workspace.write_parquet`, `SAMPLE_TABLE` for preview.

Templates (illustrative, not a second runtime):

- CLN-04 pivot: `DataFrame.pivot_table` / `melt` (unpivot).
- CLN-05 join: `pandas.merge` or DuckDB `JOIN` on two workspace table names. Union/append: `concat` with column align.
- CLN-07 group-by **to table**: `groupby(...).agg(...).reset_index()` written as parquet. Do **not** reuse `_build_sample_sql` aggregate (that is inspect/chart sample).

Refuse client-supplied raw code unless `kind === generated` and the signature verifies (NEW-09).

### Sample then apply (CLN-09)

1. Preview: run compiled code against a sample (`sample-table` or sandbox on a sampled frame). Stamp `previewedOn: { tableId, contentHash, rowCount }`.
2. Apply: run the same signed code in workspace context so DuckDB/pandas reads the **full** parquet (sandbox already binds workspace tables). Write result parquet. Return a display sample (`max_display_rows`, same as refresh-derived-data).

Virtual tables already distinguish `rows.length` vs `virtual.rowCount`. Keep that badge honest (NEW-05 is another feature; do not lie that the grid is the full file).

Join/union on samples must warn: keys absent from the sample can look like a failed join. Apply is the source of truth.

### Pin / re-run generated transform (NEW-09)

When `visualize` (or a new `transform` action) succeeds, `promoteDraft` already stores `code` + `codeSignature`. Surface that as a `generated` step: show code, re-run via `/refresh-derived-data`, allow disable.

Do not strip `derive.code` into an unsigned UI recipe. The pin **is** the signed artifact.

If cleaning without a chart is required, add `transform` beside `visualize` in `core/skill.py` / `core/tools.json` rather than forcing a dummy Vega spec. That is additive to the analyst action enum; plan-check must confirm the SSE `result` event still works for the client `promoteDraft` path.

### Pivot / join / group-by (CLN-04, CLN-05, CLN-07)

BE owns compile templates + validation (key columns exist, join table is in workspace, agg functions in an allowlist). UI dialogs are F-clean-grid / later UI chunks; this job supplies the API.

Join inputs: two (or more) **already loaded** table ids. Do not call `DataOperationExecutor` to fetch a third catalog table; that is load chat.

Group-by: output is a new (or replaced) table, not a Vega aggregate encoding. Chart shelf agg stays STYLE (`agent_simple.py` DATA vs STYLE). Mixing them would break encode undo.

### Workspace undo (IDE-07)

Client command stack in `dfSlice` (or a sibling slice): `{ type, tableId, beforeSteps, afterSteps, encodingPatch?, threadPatch? }`.

- Undo clean: restore previous signed pipeline, `apply-clean-steps` or refresh-derived-data, do not orphan parquet names (`deleteDerivedTableById` already calls `deleteTablesFromWorkspace`).
- Undo encode: Redux only; no Python.
- Undo thread: existing delete/reparent paths (`deleteDerivedTableById`, `reparents authored children`).

There is **no** server undo log today. Do not add git. Cap stack in memory + session persist. Cmd+Z must not steal CodeMirror when the editor is focused.

### Surface refresh (NEW-12)

`useDataRefresh` already refreshes streams/DBs and then derived tables. It does not export a function.

- Return `refreshTable(id)` / `refreshAll()` from the hook (or a small store thunk).
- Wire F5 in the existing App keydown listener (F-ide-desktop owns the cheat sheet; this feature owns the handler calling the thunk).
- Manual refresh must reuse `CONNECTOR_ACTION_URLS.REFRESH_DATA`, `SAMPLE_TABLE`, `REFRESH_DERIVED_DATA`, gzip `SYNC_TABLE_DATA` for streams.

### Likely files

| Touch | Files |
|-------|--------|
| New model/compile | `py-src/data_formulator/clean_steps/` (models, compile, maybe repository) |
| API | `py-src/data_formulator/routes/tables.py` or `routes/agents.py`; `src/app/utils.tsx` URL map |
| Tests | `tests/backend/` compile + apply + signature; do not execute unsigned code |
| Client types | `src/components/ComponentType.tsx` |
| Client store | `src/app/dfSlice.tsx`, `stateMigrations.ts` |
| Refresh | `src/app/useDataRefresh.tsx` |
| Agent pin | `analyst/skills/core/skill.py`, client promoteDraft |
| Do not treat as prep engine | `data_operations/models.py` `DataOperationStep = ConnectorQueryStep` |

---

## 4. Verdict draft: SHAPE

Not UNFIT: the transform engine already exists (sandbox pandas/DuckDB + signed `derive.code` + `/refresh-derived-data` + workspace parquet). Applied Steps is a **model + rail + compile**, not a new runtime.

Not FIT: there is no step list, no verb compiler, no sample-vs-full Apply, no workspace undo stack, no exported refresh command, and agent transform is coupled to `visualize`+chart. `data_operations` is load plans; using it as prep would be the wrong plug-in.

Not ASK unless plan-check insists on a breaking change to `/refresh-derived-data` (dropping `code_signature`) or a new required visualize-without-chart event. Prefer additive APIs.

SHAPE: extend derived-table + sandbox; keep DataThread as analysis history; steps rail on the grid; do not grow `ConnectorQueryStep`.

---

## 5. Risks / contracts not to break

- **Load vs prep.** `DATA_OPERATION_SCHEMA_VERSION = 1` and `kind == connector_query` only. Adding pivot as a data_operation step changes plan hashes, `to_public_dict` (strips source ids), and executor assumptions (`fetch_data_as_arrow`). Do not.
- **Code signing.** `/refresh-derived-data` rejects missing/invalid HMAC (`agents.py` ~714–724). Compiled verbs must be signed on the server. Never exec client-authored Python.
- **Sandbox.** No network, no ctypes, import denylist (`local_sandbox.py`). Step templates must stay in pandas/numpy/DuckDB.
- **`output_variable` identifier.** Must be a valid Python identifier; default `result_df`.
- **Virtual sample honesty.** `DictTable.virtual.rowCount` vs `rows`. Apply-full then sample-display; do not replace full parquet with the preview frame.
- **Derived graph.** `derive.source[]` drives `useDataRefresh` fan-out. Join steps must list **all** parent table ids or refresh will skip a side.
- **`promoteDraft` / `insertDerivedTables`.** Duplicate id guard. `codeSignature` optional on type but required for refresh. Migrations in `stateMigrations.ts` must default `cleanSteps` without dropping `derive`.
- **Workspace parquet names.** `get_fresh_name("d-...")` on visualize; refresh overwrites `output_table_name`. Undo/delete must call `deleteTablesFromWorkspace`.
- **Chart agg vs table group-by.** `_build_sample_sql` GROUP BY is inspect. CLN-07 must persist a table.
- **STYLE vs DATA.** `agent_simple.py`: pivot/join/new fields are DATA; filter/agg-on-encoded-field is STYLE. Grid clean steps are DATA (new table snapshot). Do not route them through restyle.
- **DataThread branching.** Rail edits on table T must not rewrite sibling branches that share a parent. Commit a new derived table when the user branches; in-place step edit stays on the focused id.
- **SSE / analyst events.** `type: result` + signed `transform_result` is the pin source. Do not require a node-graph event.
- **Refresh hook performance.** `selectRefreshConfigs` exists so row churn does not reset timers. Manual F5 must not rebuild all intervals.
- **F-clean-grid later.** Column verbs should append `CleanStep`s with the same compile API. If this job stores only opaque Python, grid verbs cannot edit params. Keep `kind` + `params` plus signed `code`.

---

## 6. Suggested chunks (ids only)

- C-cln-step-model
- C-cln-compile-sign
- C-cln-apply-api
- C-cln-pivot-unpivot
- C-cln-join-union
- C-cln-groupby-table
- C-cln-sample-apply
- C-cln-pin-rerun
- C-cln-undo-stack
- C-cln-refresh-surface
