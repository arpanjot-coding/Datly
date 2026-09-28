# BE-expert: F-warehouse (persist workspace parquet for reopen)

Feature: F-warehouse.  
Role: `[be-expert]`. Report only. Do not edit product code.  
Session: web + desktop.  
Source: `docs/lifecycle/feature-ask-scraper.md`.  
Neighbors only: F-scraper (how tables first land), F-pipeline (structure after parquet exists). Do not plan fetch or pipeline steps here.

Checked: `datalake/workspace.py` (`write_parquet`, `write_parquet_from_arrow`, `refresh_parquet_from_arrow`, `export_session_zip`), `datalake/workspace_metadata.py` (`TableMetadata`, `workspace.yaml`), `datalake/workspace_manager.py` (`save_session_state`, `session_state.json`), `routes/sessions.py` (`/api/sessions/save|load|list|export|import`), `routes/tables.py` (`create-table` file vs gzip `raw_data`, `list-tables` `source_metadata`), `data_loader/external_data_loader.py` (`ingest_to_workspace` `source_info`), `data_connector.py` (`import-data`, `refresh-data`), `workspace_factory.py`, `src/app/tableThunks.ts` (`loadTable` connector vs gzip), `src/app/dfSlice.tsx` (`toInputTable`, `addTableToStore`), `src/app/useAutoSave.tsx` (excludes `tables`), `src/app/workspaceService.ts` (`SESSION_SAVE`, `SAMPLE_TABLE` hydrate), `src/app/useDataRefresh.tsx` (`connectorId` + `REFRESH_DATA`), `src/views/DataLoadingChat.tsx` (plan = connector; pending extract = gzip), `src/views/UnifiedDataUploadDialog.tsx` (URL tab gzip).

Locked slim: warehouse = persisted workspace parquet the session / History / analyst path already reopens. Not a second warehouse product. Not Spark. Not SQL as home. Success = `ingest_to_workspace` + session save + refresh provenance (`connectorId`).

No em dashes.

---

## 1. Meaning

An analyst's scraped tables stay as this workspace's parquet (plus `workspace.yaml` provenance) so landing History / Sessions and the analyst loop reopen the same tables, and refresh still finds the connector.

### Out of scope

- A warehouse product, warehouse screen, Spark cluster, or SQL-as-home store.
- KNIME, a second Home tile, live share, Stripe, History / free-SaaS C-hist-* rebuild.
- F-scraper fetch / HTML extract / `web` loader (neighbor).
- F-pipeline PROFILE / CLEAN / workflow steps (neighbor; already writes derived parquet after load).
- New Flask `/api/warehouse`, new Redux slice, or storing full table rows in `session_state.json`.

---

## 2. Place / plug-in

Do not add a warehouse API. The seat is the active workspace dir (or Azure blob twin). Sessions are workspaces. URL prefix stays `/api/sessions`.

| Layer | Path | Role today | Role for F-warehouse |
|-------|------|------------|----------------------|
| Parquet write | `Workspace.write_parquet` / `write_parquet_from_arrow` | Writes `data/<name>.parquet`, stamps `TableMetadata` | **The** warehouse write. Pass `source_info` or refresh dies. |
| Provenance | `TableMetadata` in `workspace.yaml` | `loader_type`, `loader_params` (safe), `source_table`, `import_options`, `last_synced` | Disk half of refresh. `list-tables` maps this to `source_metadata`. None of those fields → not refreshable. |
| Ingest | `ExternalDataLoader.ingest_to_workspace` | Arrow → parquet + `source_info` (`loader_type` = **class name**, not registry key) | Required path for scrape tables. Do not override unless adding `url` / `final_url` into `loader_params` via `get_safe_params`. |
| Import / refresh | `POST /api/connectors/import-data`, `refresh-data` | Import calls ingest. Refresh requires `meta.source_table`, then `refresh_parquet_from_arrow` (copies old `source_info`) | Keep. No third poller. |
| Gzip leftover | `POST /api/tables/create-table` `raw_data` | Decompress gzip JSON → `write_parquet` **without** `source_info`. Default `source_type="data_loader"` anyway | Gap. Paste / URL tab / agent extract still use this. Parquet exists; provenance does not. |
| File leftover | `create-table` `file` | Parquet + `source_type="upload"` + `source_file` | Not scrape. Do not route scrape here. |
| Session persist | `POST /api/sessions/save` → `WorkspaceManager.save_session_state` | Writes `session_state.json`. FE `getSerializableState` **drops `tables`**. `inputTables` is saved | Session half of warehouse. `toInputTable` stores `source.kind: 'connector'` only if `table.source.connectorId` is set. |
| Session reopen | `POST /api/sessions/load` + `workspaceService.prepareInputTablePreviews` | Restores Redux; hydrates rows via `SAMPLE_TABLE` + `X-Workspace-Id` | Success path. Analyst / Distill / Play read `virtual.tableId` → parquet. |
| FE source | `DataSourceConfig.connectorId` + `InputTableSource` | Sidebar / DataThread / agent **plan** set `type: 'database'` + `connectorId` and call `loadTable` connector branch | Must survive save/load. Materialize uses `sourceConfig`. |
| Refresh FE | `useDataRefresh.refreshDatabaseTable` | Needs `virtual` + `source.type === 'database'` + `canRefresh` + `connectorId` | Fail message if `connectorId` missing after gzip dump. |
| List hydrate | `buildDictTableFromWorkspace` | `canRefresh: source_metadata != null` | Gzip list rows look like tables but `source_metadata` is null. |
| Connectors (outside workspace) | user connector JSON + vault | Instance id (`web:slug`) lives in identity home, not in the workspace zip | Refresh after reopen needs that instance still present. Zip has parquet + yaml + state, not credentials. |
| Factory | `workspace_factory.get_workspace` | Active ws from identity + `X-Workspace-Id` | Scrape ingest must hit the same ws the session will save. |

Call path that **is** warehouse success:

```
F-scraper neighbor: import-data
  → ingest_to_workspace → write_parquet_from_arrow(source_info)
  → loadTable(sourceType=database, connectorId, sourceTableRef)
  → toInputTable kind=connector + sourceConfig.connectorId
  → useAutoSave → /api/sessions/save
  → later /api/sessions/load → SAMPLE_TABLE
  → optional REFRESH_DATA(connector_id, table_name) using yaml source_table
```

Call path that **looks** warehoused but fails the slim:

```
URL tab / agent handleLoadPending extract
  → loadTable gzip raw_data
  → create-table write_parquet (no source_info)
  → toInputTable kind=workspace (no connectorId)
  → session save + reopen of rows works
  → refresh provenance missing
```

Call path **not** to add:

```
/api/warehouse → Spark / SQL warehouse
session_state.json full row dump
second yaml or DuckDB file as the store
```

---

## 3. Approach

Layers: existing parquet write → `source_info` on yaml → `connectorId` on `inputTables` → `/api/sessions` save/load. Prefer `write_parquet` / `write_parquet_from_arrow` + `/api/sessions`. No new store.

### Disk (already FIT)

`Workspace` (local) and `AzureBlobWorkspace` already accept `source_info` and persist it on `TableMetadata`. `ingest_to_workspace` already fills:

- `loader_type`: class name (e.g. future `WebDataLoader`)
- `loader_params`: `get_safe_params()` only
- `source_table`: identifier (HTML node `table_0`, file stem)
- `import_options`

`refresh_parquet_from_arrow` copies those fields. Tests already cover import_options survival (`tests/backend/data/test_source_metadata.py`). Do not invent a warehouse writer.

### Session (already FIT for data, SHAPE for scrape provenance)

- Auto-save: `useAutoSave` → `saveWorkspaceState` → `POST /api/sessions/save`.
- Payload: `inputTables` (snapshot + `source` + `sourceConfig`), charts, chat. Not `tables` rows.
- Reopen: `loadWorkspace` → `migrateState` → `SAMPLE_TABLE` per `workspaceTableIdOf`.
- Connector tables: `source.kind === 'connector'` and `workspaceTableId` = parquet stem.
- Gzip / paste tables: `source.kind === 'workspace'`. Data reopens. Slim refresh success does not.

`workspace_meta.json` `table_count` still reads `state.tables` (FE no longer sends it). Leave it. Not a warehouse product.

### Gzip gap (the only warehouse-shaped hole)

`loadTable` else branch (no `database`+`connectorId`, no `file`) posts gzip `raw_data` to `create-table`. Backend writes parquet with **empty** loader fields. `_table_metadata_to_source_metadata` returns `None` if both `loader_type` and `loader_params` are missing.

Still on this branch today:

- Agent extract Load (`DataLoadingChat.handleLoadPending`, `source.type: 'extract'`).
- URL tab (`type: 'url'` / `'stream'`) in `UnifiedDataUploadDialog`. Stream refresh is a **browser** `fetchStreamData` + `sync-table-data` gzip, not connector refresh.

F-scraper neighbor owns moving new scrape ingest off this branch. F-warehouse owns the contract: a scrape table that is meant to be warehoused must not take gzip. Old `url`/`stream` sessions stay until the user reloads. Do not silent-migrate.

### What F-warehouse implements (thin)

1. Contract tests, not a new API: ingest writes `source_info`; session save keeps `connectorId`; load hydrates parquet; `refresh-data` works after reopen.
2. Optional tiny bind: if agent/URL Load is still gzip when scrape ships, fail the warehouse slice until neighbor bind (`C-scrape-url-tab` / `C-scrape-agent-bind`) exists. Do not add `source_info` onto gzip JSON as a fake connector.
3. Do not put `connectorId` into `workspace.yaml`. Connector identity is the FE/session field. Disk identity is `source_table` + loader class + safe params. Refresh joins them at request time.

### Tests (TDD)

- `tests/backend/data/test_warehouse_scrape_contract.py` (name flexible): `ingest_to_workspace` → yaml has `source_table`; `create-table` raw_data does **not**; `refresh-data` 400 without `source_table`.
- Session: extend `test_workspace_manager.py` / `test_session_export_import.py` so saved `inputTables` with `kind: connector` + `sourceConfig.connectorId` round-trip; zip has parquet + `workspace.yaml`, not vault secrets.
- FE (focused): `toInputTable` without `connectorId` is `kind: workspace`; with `connectorId` is `kind: connector`. Do not rewrite passing session tests to greenwash gzip.

---

## 4. Verdict

**SHAPE**

The warehouse seat is already workspace parquet + `/api/sessions`. The scrape job is not a new store. The slim is not FIT yet because leftover scrape loads still dump gzip `raw_data` and drop `connectorId` / `source_info`, so refresh provenance fails after History reopen.

- Not FIT: gzip extract/URL path writes parquet without `source_info`; `toInputTable` then stores `kind: workspace`. Connector import path is already correct and is the template.
- Not ASK: locked slim already says workspace tables, session save, `connectorId`.
- Not UNFIT: no Spark / SQL warehouse / second product required.

Hard stop: do not implement a warehouse service, DuckDB-as-home, or SQL lake. F-scraper fetch and F-pipeline stay neighbors.

---

## 5. Risks / what the unified plan must not break

- **Gzip as "good enough."** Parquet-without-provenance is not warehouse success. Plan must require `ingest_to_workspace` + `connectorId` for new scrape tables.
- **Fake provenance on gzip.** Stamping `loader_type` onto `create-table` JSON without a connector instance makes `canRefresh` true and refresh 400. Bind or leave unrefreshable.
- **Silent Home / warehouse screen.** UI place is History / Sessions + `SourceTableShelf`. No `/warehouse`, no Warehouses strip.
- **Row dump in session_state.** Re-including `tables` in auto-save blows size and desyncs from parquet. Keep `virtual.tableId` + SAMPLE_TABLE.
- **Wrong workspace.** Ingest without the active `X-Workspace-Id` / `ensureActiveWorkspace` saves tables the session list will not reopen.
- **Connector vs workspace lifetime.** Deleting a `web:` instance leaves parquet; refresh asks to reconnect. Export zip does not copy vault. Do not claim portable live refresh.
- **Secrets in yaml.** `loader_params` must stay `get_safe_params`. Authorization never in `workspace.yaml` or `list-tables`.
- **Existing url/stream.** Browser refresh + `sync-table-data` must keep working for old sessions. Do not force-migrate.
- **File uploads.** `source_type="upload"` + `source_file` is a different provenance. Do not overwrite with scrape `source_info`.
- **Pipeline derived parquet.** CLEAN / compile-clean-step `write_parquet` without scrape `source_info` is correct. Do not copy scrape refresh onto derived tables. Do not double-fire `runPipeline`.
- **Azure blob.** Same `source_info` contract. Do not add a blob-only warehouse.
- **Ephemeral recovery.** `workspaceDB` read-only leftovers are not the warehouse. Do not treat them as refreshable scrape sources.
- **DISABLE_DATA_CONNECTORS.** Hosted demo: no new connector tables; do not fake `canRefresh`.
- **SQL / Spark.** `run_parquet_sql` and `/api/sql/query` stay read helpers. Not the warehouse home.
- **F-workspace History.** Landing session list is reopen. Do not add a scrape warehouse list beside it.
- **i18n.** This job has no new user-facing strings if it stays contract + bind. If a "reconnect to refresh" path is surfaced, en + zh in the same chunk.

---

## 6. Suggested chunks (ids only)

`C-wh-ingest-contract`  
`C-wh-source-info`  
`C-wh-session-reopen`  
`C-wh-refresh-provenance`  
`C-wh-gzip-bind`

Do not spawn: `C-wh-sql`, `C-wh-spark`, `C-warehouse-page`, `C-pipeline-*`, `C-scrape-*` (neighbor owns fetch / loader / URL tab / agent bind).

First impl slice: `C-wh-ingest-contract` + `C-wh-source-info` (tests against existing `ingest_to_workspace`). Session reopen and refresh after those pass. Gzip bind waits on F-scraper import provenance, then this job asserts the leftover path is not the scrape warehouse path.

UI place (neighbor, not this write-set): `W-wh-place`.
