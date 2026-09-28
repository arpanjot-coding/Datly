# Work package - F-workflow-db

- **Status:** ACCEPTED
- **Kind:** W
- **Session focus:** web, desktop
- **Ship targets:** web, desktop (same Knowledge tab, no fork)
- **Features:** F-workflow-db
- **Wave A:** W-wf-nb, W-wf-ui, W-wf-be all DONE
- **Source:** `docs/lifecycle/feature-ask.md` (F-workflow-db current) plus Wave A reports `workflow-db-neighborhood.md`, `workflow-db-ui-expert.md`, `workflow-db-be-expert.md`
- **Lane:** BUILD
- **Blast:** small (overlay + event `target` + prompt; no new runtime)

## Ask / out of scope

**Verbatim:** we need to be able to make workflow like we chat and make the work flow so they can run those flow on that data base

Chat a workflow, then run those flows on that database.

**Locked SHAPE.** Reuse distill-workflow + df-replay-workflow. Add an explicit run target: loaded session tables vs a connected connector. Replay-on-db is load via the data-loading skill, then analyze on workspace parquet. Not a warehouse SQL runner.

**Out of scope**

- KNIME / node canvas / DAG editor (locked skip)
- Notebooks
- SQL IDE as home, F-sql analysis drawer, a workbench, or SQL-as-home
- A second Knowledge route or `/workflows` page
- A second workflow runtime, `WorkflowReplayAgent`, or new `POST /api/workflow/replay` / `/api/knowledge/replay-workflow`
- Raw SQL on the source; workflow Concrete SQL as `source_table`
- Auto-inject distilled markdown into every analyst prompt (workflows are not always-apply)
- Auto-execute `DataOperationExecutor` from Play
- Catalog tree, SQL editor, or load-plan UI inside the run sheet
- SaaS leftover this job: auth, Stripe, share, billing portal, F-data-acl write grant
- Parameter form for `{{token}}` (stays LLM prose + `ask_user`)

Do not spawn: `C-wf-replay-agent`, `C-wf-execute-sql`, `C-wf-canvas`.

## Meaning

An analyst chats through an analysis, distills it into a reusable Markdown workflow, then replays that workflow against a chosen data target: the tables already in this session, or one connected database/connector.

Who: analyst already in a workspace, Knowledge sidebar open.

Entry -> steps -> success:

1. Chat in the thread until there is a distillable leaf.
2. Knowledge -> Workflows -> Distill from this session (or Update from this session). Capture stays as today.
3. Later: pick a workflow in the same list -> Play opens a run-target sheet -> choose session tables or one connected connector -> Run on this data / Run on database.
4. Agent replays in the existing composer (`exploreFromChat`). Connector kind binds `source_id`, loads analog tables via data-loading + `propose_data_operation` (user confirms), then follows Abstract/Concrete on workspace parquet.
5. Success is a started replay (toast + thread activity), not a graph of nodes.

## Verdict

**SHAPE** (logged). Neighborhood already has distill + `df-replay-workflow`. The missing piece is an explicit target and a connector prompt on the same analyst.

Not FIT: Play is tables-only (`tables.length === 0` disables Play; listener requires `focusedTableId`; copy says currently loaded data).

Not ASK: place is locked (Knowledge list + run-target sheet). Meaning is locked (chat -> distill -> run on session tables or one connector). Canvas is a locked skip.

## Place / grain

No new route. No new sidebar tab. Knowledge stays the third rail tab (`sources | sessions | knowledge`) in `DataSourceSidebar.tsx`. Run-target is an MUI `Dialog` (same language as `SessionDistillDialog`: `maxWidth="sm"`, `fullWidth`, Cancel + one contained primary). The repo has no Drawer; do not add a bottom-sheet library.

| Job | Live plug-in | After |
|-----|----------------|-------|
| Capture | `SessionDistillDialog` + Workflows ActionRow | Unchanged. Do not merge distill and run. |
| List | Workflows section in `KnowledgePanel` | Same list and markdown editor. Play no longer fires replay immediately. |
| Run | Play `IconButton` -> `handleReplay` -> `df-replay-workflow` (disabled when `!hasTables`) | Play always visible; click opens the run-target sheet even when `tables.length === 0`. |
| Target: session tables | Implicit focused table | Explicit option: current session tables. Disabled with why if none loaded. |
| Target: database | None | Same sheet: list saved connectors (`GET /api/connectors`). Pick one connected source. No catalog tree. |
| Agent run | `SimpleChartRecBox` listener needs `focusedTableId` | Same event. Detail gains `target`. Lift focused-table gate only for `kind: 'connector'`. |
| Add connector | Sources tab + `UnifiedDataUploadDialog` | Sheet empty/disconnected points there. Do not duplicate the add-connector form. |

Sheet sketch:

```text
Title:  Run workflow
Hint:   Choose data this workflow should run on.
Body:   ( ) Current tables in this session     n tables, names
        ( ) Database connector
            [connector rows: icon, display_name, connected|not]
Footer: Cancel    [Run on this data | Run on database]
```

Default: current tables if `hasTables`, else first connected connector, else connector option selected but CTA disabled.

### Sacred contracts (do not break)

1. Distill payload: `workflow_context.threads` non-empty; required `workspace_id` + `workspace_name`. Event types only `message` / `create_table` / `create_chart`.
2. One workflow file per workspace. Upsert by `source_workspace_id`. Frontend match: `findSessionWorkflow`.
3. Distill only user-driven leaves (`isLeafDerivedTable` + user message).
4. Replay is window CustomEvent `df-replay-workflow`. Detail must keep `prompt: string`. Additive fields only. Listener stays in `SimpleChartRecBox` so it shares `exploreFromChat`.
5. Analyst request tables are input refs (`toAnalystTableRef`). Do not send preview rows as the table body.
6. Knowledge jail: `ConfinedDir`; workflows at most one subdir; body hard cap 24000.
7. `knowledge.replayPrompt` keeps `{{content}}`. Loaded-data wording stays the tables-kind contract. Connector mode is a new key, not a silent rewrite.
8. No node canvas. Capture stays chat timeline; replay stays one agent run.
9. Connector load is structured: `ConnectorQueryStep` + `LoadQuery`. `fetch_data_as_arrow` does not take a raw query string. Probe uses SPJQ, not user SQL.
10. Selection is one connector. Replay-to-DB picks one `connectorId`, same as sidebar.
11. `focusedConnectorId` is ephemeral. Do not treat it as the replay target.
12. Workflows are not always-apply. Do not inject distilled markdown into every analyst system prompt.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-wf-replay-target | Run sheet P0 states, one contained primary, honest disabled why. |
| section-grain | n/a | No new Home grain. Knowledge tab stays. |
| phone-chrome | n/a | android/ios not in this ship set. |
| web-layout | C-wf-replay-target | Web ships the same Knowledge tab + sm Dialog. Narrow sidebar wrap. |
| desktop-chrome | C-wf-replay-target | Dialog in renderer, not a native window. Keyboard + Esc. Existing `df-no-drag` on buttons. Titlebar insets unchanged. |
| first-run | n/a | LanguageScreen gate unchanged. |
| value-slide | n/a | No value slides. |
| app-polish | n/a | Icons and legal are not this job. |
| notifications | n/a | Replay toasts are existing system messages, not reminders. shipsNotifications false. |
| i18n | C-wf-replay-prompt | New keys in all 21 locale common.json leaves. Keep `{{content}}`. |
| hardware-back | n/a | No android. |

## Chunks

Wave A names unified here. UI `W-wf-sheet` + `W-wf-cta` + `W-wf-states` collapse into `C-wf-replay-target` (sheet, one primary, P0 states) with copy keys owned by `C-wf-replay-prompt`. BE ids already match.

| ID | Goal | Depends | Acceptance | Likely files |
|----|------|---------|------------|--------------|
| C-wf-replay-target | KnowledgePanel run-target Dialog: session tables vs one connector. Play opens the sheet even when `tables.length === 0`. Extend `df-replay-workflow` detail with `target { kind: 'tables' \| 'connector', connectorId?, displayName? }`. Keep `prompt` and `title`. `SimpleChartRecBox`: lift `focusedTableId` / hasTables gate only for connector kind; tables kind still errors `replayNoData` without focused data. Validate connector id against listed connectors (`GET /api/connectors`, same `ConnectorInstance` as Sources). Connected only for the primary. Busy: keep sheet open with inline `replayBusy`; do not close-then-toast; listener still refuses a second run. Honor workspace `readOnly` the same as Send before `exploreFromChat`. Do not auto-execute `DataOperationExecutor`. Do not use `focusedConnectorId` as the target. One contained primary in the sheet; list Play stays an icon that opens the overlay. Default: tables if any loaded, else first connected connector. Empty/disconnected/loading states on the chosen option, not by hiding Play. Label connectors by `display_name` / `type_name` (sample_datasets is a source, not a fake SQL server). Quiet "Add connection" is not a second primary. | - | Play with zero tables opens the sheet. Tables option disabled with why when empty. Connector run with empty workspace reaches `exploreFromChat`. Unknown / disconnected / other-list id does not fire. Agent busy keeps the sheet open. Confirm dispatches additive `target` and does not start a load executor. Distill ActionRow unchanged. No catalog tree in the sheet. | `src/views/KnowledgePanel.tsx`; `src/views/SimpleChartRecBox.tsx`; `src/app/utils.tsx` (`CONNECTOR_URLS.LIST`); `src/components/ComponentType.tsx` (`ConnectorInstance`) |
| C-wf-replay-prompt | Keep `knowledge.replayPrompt` for tables kind (must keep `{{content}}`). Add connector interpolations: bind `source_id` / `{{connector_id}}`; workspace tables are not the database; `load_skill('data-loading')`; `list_data` / `find_data` / `describe_data` / `probe_data` scoped to that source; `propose_data_operation` and wait; do not invent table keys; do not emit DROP/DELETE/UPDATE/INSERT/TRUNCATE/ALTER/COPY/ATTACH/GRANT against the source; after parquet, follow Abstract/Concrete as today; pause on major mismatch via `ask_user`. One sheet primary label: Run on this data / Run on database. New i18n keys in all 21 locale common.json leaves (en meaning SSOT, then every `src/i18n/locales/*/common.json`). Adapt `replayStarted` / play `aria-label` so Play is not labeled `replayNoData` while a connector could work. | C-wf-replay-target | Tables replay still uses current `replayPrompt` with `{{content}}`. Connector replay does not tell the agent to use currently loaded data. Sheet CTA text follows selection. No English-only P0 CTAs. No new agent class. | `src/i18n/locales/*/common.json`; `src/views/KnowledgePanel.tsx`; `src/views/SimpleChartRecBox.tsx` |
| C-wf-load-then-replay | Prompt + existing propose/execute. Scope discovery to `connector_id`. Reuse workspace parquet that already carries that `source_id` (skip a second propose when provenance matches). Optional short note in data-loading `SKILL.md` that a replay-on-connector turn is the same load-then-analyze path. No new executor. Prefer filtered/sampled `LoadQuery` (do not promise all rows). If `CLI_ARGS.disable_data_connectors` makes loading a dead end, fail clearly. Core inspect/visualize stay on parquet, never on a live connector. | C-wf-replay-prompt | Connector replay calls data-loading scoped to the chosen id, pauses on `propose_data_operation`, then continues the same thread after user confirm. Matching `source_id` parquet is reused. No `DataOperationExecutor` call from Play. No new `/api/workflow/replay`. | `py-src/data_formulator/analyst/skills/data-loading/SKILL.md`; existing `skill.py` / `data_operations/executor.py` (read, no new class) |
| C-wf-sql-readonly | Keep SELECT-only compilers (`compile_probe_sql`, structured load SQL). Optional read-only session/tx on SQL loaders for probe + fetch (Postgres/MySQL/MSSQL equivalent of ClickHouse `readonly=1` / SQLite `mode=ro`). Never accept workflow SQL as `source_table`. Default refuse writes. Do not add a free-SQL replay tool. Do not share an `execute_sql` route with F-sql. Sandbox stays the wall (no DB drivers, no ATTACH live). Confirm required if a write is ever requested; until F-data-acl, refuse. | - | Probe and fetch remain single SELECT. A distilled Concrete snippet cannot become `source_table`. Write verbs against the source are refused by default. Optional session-readonly is a hardening, not a full SQL parser. | `py-src/data_formulator/data_loader/probe_utils.py`; `postgresql_data_loader.py`; `mysql_data_loader.py`; `mssql_data_loader.py`; `external_data_loader.py` |
| C-wf-distill-source-stamp | Optional later. Front matter `source_connector_ids` from loaded-table provenance at distill time. Replay uses it as a default target only; the user can override in the sheet. Skip if the session was file-only. Do not change Abstract vs Concrete generation. Lookup metadata, not a new agent. | C-wf-replay-target | Distill YAML may list original connector ids. Sheet can preselect that connector when still connected. User can still pick tables or another connector. File-only sessions stamp nothing extra. | `py-src/data_formulator/routes/knowledge.py` (`_apply_session_front_matter`); `py-src/data_formulator/knowledge/store.py`; `src/api/knowledgeApi.ts` |

**Order:** C-wf-replay-target (first impl), then C-wf-replay-prompt, then C-wf-load-then-replay. C-wf-sql-readonly may run parallel to load-then-replay (disjoint files). C-wf-distill-source-stamp is optional later after the sheet exists.

First impl slice: C-wf-replay-target. Load and SELECT compilers already exist; the gap is the target picker, the event field, and the lifted connector gate. Prompt copy is the immediate follow-on.

## Proof

- Lite S9 later (after chunks Accepted): `[wf]` + `[ui-vis]` + `[connect]` + `[arch-fit]`
- Flags: shipsNotifications false. writesOutput false. siblingFamily false.
- Suggested later shots (not this wave): `web-knowledge-wf-empty-w375`, `web-knowledge-wf-run-sheet-w1280`, `desktop-knowledge-wf-run-sheet` with chrome.
- Do not break distill payload/budget, `findSessionWorkflow`, `open-knowledge-panel`, markdown editor, `{{content}}`, or empty-workspace chat for non-replay turns.

## User questions

None. SHAPE is logged.
