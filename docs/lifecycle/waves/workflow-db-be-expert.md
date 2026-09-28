# BE-expert: F-workflow-db (replay distilled workflow on a connected database)

Feature: F-workflow-db.  
Role: `[be-expert]`. Report only. Do not edit product code.  
Session: web + desktop.  
Source: `docs/lifecycle/feature-ask.md` (verbatim: chat a workflow, then run it on that database).  
Checked: `py-src/data_formulator/routes/knowledge.py` (`/distill-workflow`), `py-src/data_formulator/agents/agent_workflow_distill.py`, `src/views/KnowledgePanel.tsx` (`handleReplay` / `df-replay-workflow`), `src/views/SimpleChartRecBox.tsx` (replay listener + `exploreFromChat`), `py-src/data_formulator/analyst/` (core vs data-loading tools), `py-src/data_formulator/agents/agent_utils_sql.py`, `py-src/data_formulator/agents/context.py` (`handle_inspect_source_data`), `py-src/data_formulator/data_operations/` (discovery + executor), `py-src/data_formulator/data_loader/probe_utils.py`, `py-src/data_formulator/sandbox/local_sandbox.py`.

F-sql-guard / read-only: replay must not DROP/DELETE unless the user confirms. Prefer read-only or an explicit write grant.

No em dashes.

---

## 1. Meaning

An analyst chats through an analysis, distills it to a reusable Markdown workflow, then **replays that document against a chosen connected database** (`connector_id`), not only against tables already sitting in the session.

Capture stays the existing distill job. Run-on-db is a **target** on the existing replay prompt path. Results land as workspace parquet + charts, the same way a normal agent turn does.

SHAPE constraint: one distill agent, one data agent, one replay event. Not a second workflow runtime. Not a KNIME canvas. Not a SQL IDE.

### Out of scope

- A `WorkflowReplayAgent` or any second LLM stack beside `WorkflowDistillAgent` + `AnalystAgent`.
- Graph / node editors.
- Notebooks.
- F-sql analysis drawer (SELECT on already-loaded DuckDB views). That is a different job.
- Write-back to the source database as a default. F-data-acl write grant is not built; do not invent it here.
- Compiling distilled Concrete-workflow Python and sending it to Postgres/MySQL/etc.

---

## 2. Place / plug-in

Two query worlds already exist. Replay-on-db must keep them separate.

| Layer | Path | Role today | Role for F-workflow-db |
|-------|------|------------|------------------------|
| Distill API | `POST /api/knowledge/distill-workflow` | Session `workflow_context.threads[]` + `model` → `WorkflowDistillAgent.run` → KnowledgeStore `workflows/` upsert by `source_workspace_id`. | **Keep.** Optional: stamp original `source_ids` in front matter so replay can default a connector. Do not add a second distill route. |
| Distill agent | `agents/agent_workflow_distill.py` | One LLM call. Abstract + Concrete steps, `{{token}}` parameters, YAML front matter. | **Keep.** Do not teach it to emit SQL. Concrete steps name fields/encodings, not JDBC. |
| Distill client | `src/views/SessionDistill.tsx`, `src/views/workflowContext.ts`, `src/api/knowledgeApi.ts` | Builds the session payload. | Unchanged for run-on-db. Provenance stamp is a small server-side extra if we have connector ids from loaded tables. |
| Replay client | `KnowledgePanel.handleReplay` | `store.read('workflows')` → `t('knowledge.replayPrompt')` → `window` event `df-replay-workflow` `{prompt, title}`. Play is **disabled** unless `hasTables`. | Extend the event with `target: { kind: 'tables' \| 'connector', connector_id?: string }`. Allow Play when a connector is chosen even if the grid is empty. |
| Replay listener | `SimpleChartRecBox` `df-replay-workflow` handler | Requires `focusedTableId`; then `exploreFromChat(prompt)`. Empty-workspace chat is already allowed for load, but **replay is not**. | Same `exploreFromChat`. If target is connector and no matching parquet yet, still send the prompt (agent loads `data-loading`). Do not add a new `/api/workflow/replay` route. |
| Replay copy | `knowledge.replayPrompt` (en: "currently loaded data") | Instructs the data agent to reproduce the Markdown on **session tables**. | Keep this string for `kind: 'tables'`. Add a connector variant (or interpolate `connector_id`) that says: bind to that source, load analog tables via data-loading, then follow the same steps. Do not mint a new agent id. |
| Analysis tools | `analyst/skills/core` | `inspect_source_data` (workspace parquet via `generate_data_summary`), `execute_python_script` / `visualize` (sandbox, **no network**). DuckDB parquet views: `create_duckdb_conn_with_parquet_views`. | **The** analysis runner after data is in the workspace. Never point these at a live connector. |
| Connector tools | `analyst/skills/data-loading` (`always_on: false`) | `list_data` / `find_data` / `describe_data` (catalog cache). `probe_data` → `loader.probe` (bounded read-only SPJQ). `propose_data_operation` pauses for user pick. | **The** live-DB path. Replay-on-db must `load_skill("data-loading")` and scope discovery with `source_id = connector_id`. Core SKILL.md already tells the agent to do this when workspace tables are missing. |
| Load exec | `data_operations/executor.py` | `ConnectorQueryStep` → `fetch_data_as_arrow` → `write_parquet_from_arrow`. Provenance in `import_options.data_operation.source_id` / `table_key`. | Materialize analog tables **before or during** replay. Prefer reuse if a workspace table already has that `source_id`. |
| Probe SQL | `data_loader/probe_utils.compile_probe_sql` | Compiles SPJQ to a **single SELECT**. Identifiers quoted; `;` / `--` / `/*` rejected. Row cap `PROBE_MAX_ROWS` (500). | Guard for live reads. Do not add a raw-SQL tool for replay. |
| Load SQL | e.g. `postgresql_data_loader.fetch_data_as_arrow` | Builds `SELECT … FROM schema.table WHERE … ORDER BY … LIMIT n`. Same structured filters as probe. | Same. Workflow code must not become `source_table`. |
| Sandbox | `sandbox/local_sandbox.py` | Audit hook blocks `socket.*`, `requests`, `urllib`. Workspace dir only. | Keep as the wall between analysis Python and the database. If replay "on a database" tried to open a DB driver from visualize code, it must fail. |

Call path to keep (capture):

```
session threads/events
  → POST /api/knowledge/distill-workflow
  → WorkflowDistillAgent
  → KnowledgeStore.write("workflows", …)
```

Call path to keep (replay on loaded tables, v1 today):

```
KnowledgePanel.handleReplay
  → CustomEvent df-replay-workflow { prompt }
  → exploreFromChat(prompt)
  → AnalystAgent core tools on workspace parquet
```

Call path to add (replay on connector; same agent):

```
df-replay-workflow { prompt, target: { kind: "connector", connector_id } }
  → exploreFromChat(prompt)
  → load_skill("data-loading")
  → list/find/describe/probe scoped to connector_id
  → propose_data_operation (user confirms)
  → DataOperationExecutor → parquet
  → same core inspect / visualize path as v1 replay
```

Call path **not** to add:

```
workflow.md → new ReplayAgent → raw SQL / DROP / DELETE on connector
workflow.md Python → loader.execute(sql)
sandbox DuckDB → ATTACH live Postgres
```

### Connector vs parquet (what the agent actually hits)

- **Parquet views:** `inspect_source_data` and sandbox DuckDB only see tables already published in the workspace. `create_duckdb_conn_with_parquet_views` is `CREATE VIEW … AS SELECT * FROM read_parquet(workspace path)`. In-memory DuckDB. No connector credentials.
- **Connectors:** `probe_data` and load go through `resolve_live_loader(source_id)` then the loader's native API. The model never writes SQL; the server compiles SPJQ. Probe results are evidence, not workspace inputs (`SKILL.md`). Analysis starts only after the user-selected load writes parquet.

That split is the F-sql-guard shape for this feature. Replay-on-db is "load then analyze," not "run the workflow inside the warehouse."

---

## 3. Approach

Layers: target on the existing event → prompt variant → data-loading bind → user-confirmed load → existing analyze. Distill stays as-is except optional provenance.

### Target (`connector_id`)

1. Replay event detail today: `{ prompt, title }`. Add `target`.
2. `kind: 'tables'` is today's behavior (require focused/loaded data).
3. `kind: 'connector'` requires a public `connector_id` the identity can already resolve (`data_connector._resolve_connector_with_key`). Unknown / other-user / admin-only ids fail before the LLM call, same as other connector routes.
4. UI sheet for picking the connector is a frontend job. Backend only needs the id on the prompt (and later, optional distill front matter).

Do not add `POST /api/knowledge/replay-workflow`. The Flask knowledge blueprint is capture + CRUD. Execution is already the analyst stream.

### Prompt (reuse, do not fork the agent)

v1 English `knowledge.replayPrompt` is correct for loaded tables: follow the Markdown, adapt columns, pause on major mismatch.

Connector variant should add, in this order:

1. You are bound to connected source `{{connector_id}}`. Do not probe other sources.
2. Workspace tables are not the database. If analog data is missing, `load_skill("data-loading")`, discover with that `source_id`, then `propose_data_operation`. Wait for the user. Do not invent table keys.
3. After tables are in the workspace, follow the same Abstract/Concrete steps as today's prompt.
4. Prefer Concrete when shapes match; fall back to Abstract + `{{token}}` ask/keep parameters.
5. Never emit DROP, DELETE, UPDATE, INSERT, TRUNCATE, ALTER, COPY, ATTACH, or GRANT against the source. Reads only. If a later write grant exists, stop and ask.

Keep `ask_user` for parameter `ask` knobs and for schema mismatch. That is already the pause tool.

### Load then replay (no silent warehouse writes)

`propose_data_operation` is already the confirm gate. Replay-on-db must use it unless matching parquet is already present (`import_options.data_operation.source_id === connector_id` and table_key / grain is close enough).

Do **not** auto-execute `DataOperationExecutor` from the Play button. Load is a write to the **workspace** (parquet), which is fine after confirm; it is still not a write to the source.

If the distilled file later stores `source_ids` / `table_keys` from the original session, pass those as hints in the prompt. Still require discovery to ground columns (`SKILL.md`: never invent table keys).

### Distill (small optional stamp)

`_apply_session_front_matter` already forces `source: distill`, `source_workspace_id`, `source_workspace_name`. A later chunk may copy connector ids from the session's loaded-table provenance into front matter (`source_connector_ids: […]`). That is lookup metadata, not a new agent. Skip if the session was file-only.

Do not change Abstract vs Concrete generation for this feature.

### F-sql-guard for replay

Default: **read-only on the source.**

| Mechanism | Already true | Gap for this job |
|-----------|--------------|------------------|
| Probe compiles SELECT only | Yes | Keep; never add a free-SQL replay tool |
| Load compiles SELECT + LIMIT | Yes | Keep |
| Sandbox cannot open sockets | Yes | Keep; do not whitelist DB drivers |
| ClickHouse session `readonly=1`; SQLite plugin `mode=ro` | Yes | Postgres/MySQL/MSSQL connections are **not** session-readonly today |
| Destructive SQL confirm | No product confirm dialog for agent SQL | Do not generate those statements. If a write path is ever added, require explicit user confirm **and** a grant; until F-data-acl, refuse |
| Datly repo / workspace tree | Sandbox cannot write outside workspace | Do not ATTACH host files from probe SQL |

Cheap hardening (same loaders, not a new guard service): prefer read-only sessions/transactions on SQL loaders used by probe + fetch (SET TRANSACTION READ ONLY / equivalent). That is F-sql-guard adjacent and belongs in a replay-on-db chunk if it is small. Do not block SHAPE on a full SQL parser.

Agent-written SQL in `execute_python_script` only hits in-memory DuckDB parquet views. That is analysis SQL, not source SQL. F-sql drawer is still out of scope.

---

## 4. Verdict

**SHAPE**

Neighborhood already has distill + `df-replay-workflow`. The missing piece is an explicit target (`loaded tables` vs `connector_id`) and a prompt that routes the **same** analyst through data-loading, then core visualize. No second agent stack. No new execute endpoint. Guard by keeping live-DB access on SPJQ SELECT + user-confirmed load.

Not ASK: connector picker UX is UI-owned; meaning of "run on that database" is load-into-workspace then replay, which matches existing loaders.

Not FIT: Play-on-db is not wired (`hasTables` / `focusedTableId` / "currently loaded data" copy). Postgres-family sessions are not forced read-only. Distill does not stamp `connector_id`. Those are the SHAPE deltas, not a new product category.

Hard stop: do not implement a warehouse SQL runner for workflows. Do not DROP/DELETE/UPDATE on the source without a later explicit grant plus confirm.

---

## 5. Risks

- **Gating.** Replay Play is disabled with no tables. Connector target must lift that, or the feature is unreachable on a fresh session.
- **Empty-workspace vs replay.** `exploreFromChat` already allows empty workspace for first load. The replay listener does not. Align them for `kind: 'connector'` only; keep the no-data error for `kind: 'tables'`.
- **Agent skip of data-loading.** If the prompt is weak, the model may `visualize` against the wrong session table. Bind `connector_id` in the prompt and, if needed, a system hint on that turn only (still AnalystAgent).
- **Silent load.** Auto-running `DataOperationExecutor` on Play would surprise (row caps, warehouse scan cost, extra parquet). Stay on `propose_data_operation`.
- **Schema drift.** Concrete field names from the original DB will not match. Existing mismatch paragraph in `replayPrompt` plus Abstract workflow + `ask_user` is the recovery. Do not fail the whole replay in Flask.
- **SQL injection / DDL.** Only if someone later pipes workflow text into `execute(sql)`. Forbidden. Keep compilers.
- **Write-capable SQL loaders.** Postgres/MySQL/MSSQL use the same credentials as interactive use. Replay must not add a write API. Session-readonly on probe/fetch is the residual risk mitigator.
- **Size.** `MAX_IMPORT_ROWS` and probe caps mean "run on the database" is still a bounded import, not a full warehouse scan. Prompt should not promise "all rows."
- **Disable flag.** `CLI_ARGS.disable_data_connectors` makes data-loading a dead end. Replay-on-db should error clearly, same note as `propose_connection`.
- **Confusion with F-sql.** A SELECT drawer on parquet is not this job. Do not share an `execute_sql` route.

---

## 6. Chunks

| id | What | Files (likely) |
|----|------|----------------|
| `C-wf-replay-target` | Extend `df-replay-workflow` with `target.kind` + `connector_id`. Validate id on the client against listed connectors. Lift `hasTables` / `focusedTableId` only for connector kind. | `KnowledgePanel.tsx`, `SimpleChartRecBox.tsx` |
| `C-wf-replay-prompt` | Keep current `replayPrompt` for tables. Add connector interpolations (`connector_id`, read-only / no DDL, load_skill data-loading). No new agent class. | `src/i18n/locales/*/common.json` (knowledge.*), replay handler |
| `C-wf-load-then-replay` | Prompt + existing propose/execute path: discover on that `source_id`, user picks a plan, parquet appears, core replay continues in the same thread. Reuse tables that already carry that `source_id`. | `analyst/skills/data-loading/SKILL.md` (short replay note if needed), no new executor |
| `C-wf-sql-readonly` | Document and keep SELECT-only compilers. Optional: read-only session/tx on SQL loaders for probe + fetch. Never accept workflow SQL as `source_table`. Confirm required if a write is ever requested; default refuse. | `probe_utils.py`, SQL loaders (`postgresql_data_loader.py` et al.) |
| `C-wf-distill-source-stamp` | Optional front matter `source_connector_ids` from loaded-table provenance at distill time. Replay uses it as a default target, user can override. | `routes/knowledge.py` `_apply_session_front_matter`, `knowledgeApi.ts` types |

Suggested first impl slice: `C-wf-replay-target` + `C-wf-replay-prompt`. Load and guard already exist; the gap is the target and the copy.

Do not spawn: `C-wf-replay-agent`, `C-wf-execute-sql`, `C-wf-canvas`.
