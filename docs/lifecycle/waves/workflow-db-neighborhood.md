# Workflow-on-database neighborhood (F-workflow-db)

Grounded in listed capture/replay files plus how connectors are selected today. Not a plan. Paths are workspace-absolute. Ask: [docs/lifecycle/feature-ask.md](D:\Coding\Main\Datly\docs\lifecycle\feature-ask.md) (F-workflow-db).

`discussion/replayable-experience-workflow.md` is **absent**. Comments in KnowledgePanel and SimpleChartRecBox still cite it.

Verdict from the ask (SHAPE): reuse `distill-workflow` + `df-replay-workflow`. Add an explicit target (loaded tables vs a connector). Do not invent a graph editor. KNIME/node canvas is locked skip.

---

## 1. Chat to workflow document (what exists)

Capture is already a session-scoped distill, not a node graph and not a live recorder.

1. The user chats through `SimpleChartRecBox.exploreFromChat` (`src/views/SimpleChartRecBox.tsx`). Each run writes a `DictTable` with `derive.trigger.interaction` (user/agent messages) and `derive.dialog` (tool-call blobs). Charts attach via `charts[].tableRef`.
2. Knowledge panel "Distill from this session" / "Update from this session" (`src/views/KnowledgePanel.tsx`) is enabled only when there is an active workspace, a selected model, and at least one **leaf derived table** whose chain contains a user message.
3. `SessionDistillDialog` (`src/views/SessionDistill.tsx`) walks live Redux tables, budgets the payload, POSTs `/api/knowledge/distill-workflow`, then fires `knowledge-changed` and `open-knowledge-panel`.
4. `WorkflowDistillAgent` (`py-src/data_formulator/agents/agent_workflow_distill.py`) turns the event log into Markdown with YAML front matter: Goal, optional Parameters (`{{token}}`), Abstract workflow, Concrete workflow, Notes.
5. The route stamps `source_workspace_id` / `source_workspace_name`, upserts one file per workspace, and writes under `knowledge/workflows/` via `KnowledgeStore`.

Distill is **not** the chat agent saving a workflow on its own. Workflows are **not** auto-injected into later analyst prompts (only `alwaysApply` rules are). Replay is a separate user action that pastes the document into a new chat.

### Distill payload assembly

| Step | Where | Behavior |
|------|-------|----------|
| Leaf = derived table with no children | `workflowContext.ts` `isLeafDerivedTable` | Layout-promoted extra leaves with children fail this check. |
| Visible chain, root-first | `walkVisibleChain` | Stops if parent missing or cycle. |
| Events per step | `buildLeafEvents` | User messages, tool calls parsed from `[tool: name]` dialog, agent messages, `create_table` (cols, row_count, 5 sample rows, optional `code`), `create_chart` if mark is not `auto`. Truncates message 500 chars, tool args 600. |
| Drop undriven threads | `buildLeafEvents` returns `null` | No user-originated message in the chain. |
| Session threads | `collectSessionThreads` | Leaves in slice/DataThread order. |
| Budget 60_000 JSON bytes | `trimToBudget` | Drop tool_call events, then shrink samples to 1 row, then drop oldest threads. Notes go in `payload_notes`. |
| POST | `distillSessionWorkflow` in `src/api/knowledgeApi.ts` | `{ workflow_context, model, user_instruction, timeout_seconds }`. |

Backend rejects missing `threads`, `workspace_id`, `workspace_name`, or `model`. LLM output without `---` gets fallback front matter. Soft body target 6000 chars with one condensation retry; hard cap 24000 (`WORKFLOW_HARD_MAX`). Filename slug from LLM `filename` hint; upsert deletes the previous path if the name changed.

---

## 2. Replay today: loaded data only

Yes. v1 replay is a one-shot prompt to the **already focused, already loaded** dataset. It does not take a connector id, does not load tables, and does not talk to a live catalog unless the analyst later chooses `load_skill('data-loading')` on its own (the replay prompt tells it not to: "currently loaded data").

Flow:

1. Play on a workflow item calls `handleReplay` (`KnowledgePanel.tsx`). Button disabled when `getAllTables().length === 0`. Tooltip: load a dataset first.
2. Reads the markdown body, wraps it in `t('knowledge.replayPrompt')` (English in `src/i18n/locales/en/common.json`). Prompt says: reproduce on **currently loaded data**, adapt columns, pause on major mismatch, silent adapt on rename/extra columns. Must keep `{{content}}`.
3. `window.dispatchEvent(new CustomEvent('df-replay-workflow', { detail: { prompt, title } }))`. `title` is unused by the listener.
4. `SimpleChartRecBox` listener: abort if agent busy (`replayBusy`); abort if **no `focusedTableId`** (`replayNoData`); else toast `replayStarted` and `exploreFromChat(prompt)`.
5. `exploreFromChat` streams `POST /api/agent/analyst-streaming` with `input_tables` = current **input** tables (`toAnalystTableRef`: workspace id + snapshot schema, not preview rows). Focused table's sources are `primary_tables`. Thread context (focused + peripheral) is attached as usual.

Chat itself can start with **zero tables** (`emptyWorkspace`): "the agent's first job is then to load some." Replay **cannot**. The listener requires `focusedTableId` even though empty-workspace chat is allowed. The play button uses `tables.length` (all tables, including derived), so a session with tables but nothing focused can show Play and then fail with `replayNoData`.

Send is blocked when `activeWorkspace.readOnly`. The replay listener does **not** check `workspaceReadOnly`.

Replay does not wait for clarify, does not pass parameters as a form, does not pin a connector. The agent is expected to follow the Abstract/Concrete steps as NL.

---

## 3. Point replay at a connected database without a node canvas

No graph editor is needed. Two selection surfaces already exist; replay is not wired to either.

### How connectors/databases are selected today

**Sidebar (human, materialize into the session)** in `src/views/DataSourceSidebar.tsx`:

- Local UI state `expandedConnectorId` (one catalog tree open). Auto-expand only when exactly one connected connector exists.
- Redux `focusedConnectorId` is a **handoff** (upload dialog / front page). Sidebar expands that connector then `clearFocusedConnector`. It is not a durable "active database."
- Multi-select `selection: { connectorId, nodes }` is **one connector at a time**. Checking a table in another connector replaces the selection.
- Preview click: `POST /api/connectors/preview-data`. Load: `loadTable` thunk with `source.type === 'database'`, `source.connectorId`, `source.databaseTable` = catalog path.
- Batch import sequential (Kusto connection is not parallel-safe). Oversized tables divert to data-loading chat instead of wholesale import.
- Refresh uses `POST /api/connectors/refresh-data` for already-imported tables.

**Analyst data-loading skill (chat, no canvas)** in `py-src/data_formulator/analyst/skills/data-loading/skill.py`:

- Discover saved sources: `list_data` / `find_data` / `describe_data` (catalog cache, `source_id` = connector id).
- Probe live: `probe_data` with structured SPJQ (`filters`, `columns`, `group_by`, `aggregates`, `order_by`, `limit`). Compiles per loader; **not** a free SQL string.
- New connection: `list_connectors` (loader **types**, skips `sample_datasets`) then `propose_connection` (form `kind: 'connector'`).
- Load into workspace: `propose_data_operation` with `ConnectorQueryStep` (`source_id`, `table_key`, `LoadQuery`). User confirms plans in the existing data-operation UI.

Loaders fetch by **table identifier**, not raw SQL (`fetch_data_as_arrow` docstring: no raw query strings, security + dialect). SQLite plugin opens `mode=ro`. Probe is documented read-only discovery.

### Shape that fits (no node canvas)

Reuse `df-replay-workflow` + `exploreFromChat`. Add an explicit **target** on Play (sheet or small picker), two modes:

| Target | What to do | Why it already almost works |
|--------|------------|-----------------------------|
| Loaded tables (today) | Keep current prompt and `focusedTableId` gate. | Sacred replay path. |
| A connected connector | Pass `connectorId` (and optional table keys) in the CustomEvent. Allow replay with empty workspace. Change prompt to: use `load_skill('data-loading')`, `list_data`/`find_data` on **this** `source_id`, `propose_data_operation` to pull needed tables (or work from probe), then follow the workflow. Do not invent SQL. | Same agent, same skill, same sidebar catalog. Empty-workspace chat already exists; only the replay gate and prompt block it. |

Do not: KNIME canvas, a second SQL IDE, a new knowledge category, auto-inject workflow markdown into every prompt, or bypass `propose_data_operation` confirmation.

Minimum event shape (additive): `{ prompt, title, target: 'loaded' | 'connector', connectorId?, tableKeys? }`. Keep `prompt` as the NL body so i18n `replayPrompt` can grow a second string for connector mode.

If the user has already loaded the DB tables, target=loaded is enough. "Run on that database" in the ask is the connector target, not a new runtime.

---

## 4. File:line table

| File | Lines | Role |
|------|-------|------|
| `src/views/KnowledgePanel.tsx` | 115-117, 273-283 | `hasTables` / `hasDistillableSession` |
| same | 293-296, 405-435 | Distill vs update action row |
| same | 298-311 | `handleReplay`: read markdown, `df-replay-workflow` |
| same | 349-366 | Play disabled without tables |
| `src/views/SessionDistill.tsx` | 75, 135-159 | Event budget; `collectSessionThreads` |
| same | 171-201 | `buildSessionWorkflowContext` |
| same | 219-268 | Trim ladder |
| same | 323-368 | POST distill, `knowledge-changed`, `open-knowledge-panel` |
| same | 115-121 | `findSessionWorkflow` by `sourceWorkspaceId` |
| `src/views/workflowContext.ts` | 20-25, 36-41 | Limits; leaf predicate |
| same | 208-298 | `buildLeafEvents` (message / tool_call / create_table / create_chart) |
| same | 305-315 | `buildDistillModelConfig` (includes `api_key`) |
| `src/views/SimpleChartRecBox.tsx` | 733-736, 759 | Empty workspace chat allowed |
| same | 836-890 | Analyst request: `input_tables`, `primary_tables`, `focused_thread` |
| same | 1796-1827 | Replay listener: busy + **focused table** required |
| same | 1877-1881 | Send blocked on `readOnly`; replay is not |
| `src/api/knowledgeApi.ts` | 157-188 | `SessionWorkflowContext` + `distillSessionWorkflow` |
| `src/i18n/locales/en/common.json` | 1021-1029 | Replay copy; `replayPrompt` assumes loaded data |
| `py-src/data_formulator/routes/knowledge.py` | 195-300 | `/distill-workflow` validate, run, upsert |
| same | 306-345 | Front matter: title from subtitle, `source: distill`, workspace bind |
| `py-src/data_formulator/agents/agent_workflow_distill.py` | 28-181 | System prompt: abstract vs concrete, parameters |
| same | 213-263 | `run`; payload_notes + thread rendering |
| same | 402-481 | Event renderer |
| `py-src/data_formulator/knowledge/store.py` | 40-57, 495-502 | Depth + `WORKFLOW_HARD_MAX` |
| same | 518-535 | `find_workflow_by_workspace_id` |
| `src/views/DataSourceSidebar.tsx` | 496-499, 1104-1116, 1389-1414, 1421-1442, 1448-1540 | Expand / load / single-connector selection / batch import |
| `src/app/dfSlice.tsx` | 296, 936-940 | `focusedConnectorId` handoff only |
| `src/app/tableResolution.ts` | 18-26 | Analyst table refs |
| `py-src/data_formulator/analyst/skills/data-loading/skill.py` | 26-60, 86-213, 238-277 | list/probe/connect/propose load |
| `py-src/data_formulator/data_operations/models.py` | 109-203 | `LoadQuery` + `ConnectorQueryStep` |
| `py-src/data_formulator/data_loader/external_data_loader.py` | 452-465, 962-984 | No raw SQL fetch; structured probe |
| `py-src/data_formulator/analyst/agent.py` | 1235-1238, 1291-1296 | Always-apply **rules** only; workflows not injected |

---

## Sacred contracts

Do not break these while extending replay-to-connector.

1. **Session distill payload.** `workflow_context.threads` non-empty; each thread `{ thread_id, events[] }`. Required `workspace_id` + `workspace_name`. Optional `payload_notes`, `context_id` (set to workspace id today). Event types only: `message` (`from`/`to`/`role`/`content`, optional `args` on `tool_call`), `create_table`, `create_chart`.
2. **One workflow file per workspace.** Upsert by `source_workspace_id` in YAML. Re-distill overwrites; stale path deleted after successful write. Frontend match: `findSessionWorkflow(items, activeWorkspace.id)`.
3. **Distill only user-driven leaves.** `isLeafDerivedTable` + `buildLeafEvents` null without a user message. Do not distill source-only sessions.
4. **Replay is a window CustomEvent, not a new API.** `df-replay-workflow` detail must keep `prompt: string`. Additive fields only. Listener lives in `SimpleChartRecBox` so it shares `exploreFromChat` (drafts, streaming, clarify).
5. **Analyst request tables are input refs.** `toAnalystTableRef` / `workspaceTableIdOf`. Do not send preview rows as the table body.
6. **Knowledge jail.** `ConfinedDir`; rules flat (1 path part); workflows at most one subdir (2 parts). Body hard cap 24000.
7. **i18n `knowledge.replayPrompt`.** Placeholder `{{content}}` must remain. Loaded-data wording is the v1 contract; connector mode needs a **new** key, not a silent rewrite of this one if loaded replay stays.
8. **No node canvas.** Feature ask out of scope. Capture stays chat timeline; replay stays one agent run.
9. **Connector load is structured.** `ConnectorQueryStep` + `LoadQuery` (filters/columns/order_by/limit). `fetch_data_as_arrow(source_table, import_options)` does not take a raw query string. Agent probe uses SPJQ, not user SQL.
10. **Selection is one connector.** Sidebar batch select cannot span connectors. Replay-to-DB should pick one `connectorId`, same as sidebar.
11. **`focusedConnectorId` is ephemeral.** Do not treat it as the replay target; it is cleared after sidebar expand.
12. **Workflows are not always-apply.** Do not start injecting distilled markdown into every analyst system prompt; that would change token cost and surprise users who only wanted rules.

---

## Risks (destructive SQL on prod DB)

Replay-on-connector is the first path that can point the **same** agent at a live warehouse without the user first importing a copy. Today the damage surface is smaller because replay only sees workspace parquet/DuckDB copies.

| Risk | Why it is real | Mitigation that already exists | Gap |
|------|----------------|--------------------------------|-----|
| Arbitrary SQL on prod | Databricks and other SQL loaders `cur.execute` compiled SELECT. If replay prompt or distilled `create_table.code` contains SQL and a future tool accepts raw strings, a warehouse with write grants can run DML/DDL. | Fetch API forbids raw query strings. Probe compiles SPJQ. SQLite plugin `mode=ro`. Data-loading skill labeled read-only discovery. | No `F-sql-guard`. Replay listener does not force read-only. Credentials may still be read-write on the server. |
| Distilled `code` replayed as-is | `buildLeafEvents` copies `stepDerive.code` into the distill payload; the Concrete section may keep snippets. Replay dumps the whole markdown into the analyst user question. `explore` / `execute_python_script` can run Python (pandas, duckdb, sklearn) in the sandbox. | Distill system prompt: drop mechanics, no secrets, no PII. Sandbox is workspace-local, not the source DB. | Agent may still try to "run the code." Connector mode must say: do not execute Concrete SQL against the source; load via `propose_data_operation`. |
| Write-back via loader params | `import_options` / probe `query` are structured but loaders interpolate identifiers into SQL (`SELECT ... FROM {qualified}`). Identifier injection if table names are not quoted. | Table keys resolved from catalog (`resolve_load_table`), not free text table names from the LLM without catalog lookup. | Quote/escape is loader-specific. Untrusted `table_key` must keep going through catalog resolve. |
| Replay ignores workspace `readOnly` | Send button checks `workspaceReadOnly`; replay event does not. | Flag exists on `activeWorkspace`. | Wire the same guard before `exploreFromChat`. |
| Full-table import of prod | Replay-on-connector that auto-`propose_data_operation` without filters can pull huge tables (sidebar already refuses oversized wholesale import and diverts to chat). | Sidebar `isTableTooLarge` + probe row cap (`PROBE_MAX_ROWS`). | Connector replay should prefer filtered/sampled LoadQuery, same as oversized-table chat. |
| Wrong database | Play is global; target is implicit (whatever is focused). Easy to replay a finance workflow onto the focused sample CSV, or later onto the wrong connector. | Replay prompt asks to pause on major mismatch. | Explicit target picker. Confirm connector display name. |
| Busy / focus races | Play enabled on any tables; run requires focused table. Agent busy rejects with toast. | Toasts exist. | Align disable rules; do not start a second run. |
| Secrets in distill | `buildDistillModelConfig` sends `api_key` to the distill endpoint (same as other agents). Workflow body could leak sample rows (up to 5, or 1 after trim). | Prompt: no raw data/PII/secrets unless essential. | Sample rows still go to the distill LLM. |

**Do not** add a "run this SQL on the connector" replay. That would fight contract 9 and the SQL-guard job in the paused SaaS ask. Connector replay = pick source -> structured load (or probe) -> same analysis agent on **imported** workspace tables.

---

## Missing / confirmed absent

- `discussion/replayable-experience-workflow.md` (cited, not in repo).
- `design-docs/24-session-scoped-distillation.md` (cited in code; `design-docs/` not present at repo root).
- Replay target picker, connector id on the CustomEvent, replay prompt for live sources.
- Workflow parameter UI (`{{token}}` ask/keep is LLM prose only).
- SQL sanity guard (`F-sql-guard` not implemented).
