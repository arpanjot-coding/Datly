# Scrape neighborhood: ingest, pipeline, warehouse

Exploration for F-scraper, F-pipeline, F-warehouse. Read-only map of existing Datly paths. No second stack.

Source ask: `docs/lifecycle/feature-ask-scraper.md`.

---

## Reuse (must)

### Connectors and load UI

| Layer | Path | Role |
|-------|------|------|
| Load menu | `src/views/UnifiedDataUploadDialog.tsx` (`DataLoadMenu`, `UnifiedDataUploadDialog`) | Entry surface: connector cards, upload, paste, URL tab, extract/agent chat |
| Sidebar catalog | `src/views/DataSourceSidebar.tsx` | Connected sources, catalog tree, preview, drag-import, workspace picker |
| Agent ingest chat | `src/views/DataLoadingChat.tsx` | Extract tab; loads tables via `loadTable` with `source.type: 'extract'` |
| Unified load thunk | `src/app/tableThunks.ts` (`loadTable`) | Single path for file, paste, URL, connector, extract; writes parquet, updates Redux, triggers pipeline |
| Loader registry | `py-src/data_formulator/data_loader/__init__.py` | Built-in loaders + `*_data_loader.py` plugins via `ExternalDataLoader` |
| Loader contract | `py-src/data_formulator/data_loader/external_data_loader.py` | `ingest_to_workspace`, catalog, preview, auth; `MAX_IMPORT_ROWS = 2_000_000` |
| Connector HTTP | `py-src/data_formulator/data_connector.py` | Auto blueprints: `/api/connectors/import-data`, `preview-data`, `refresh-data`, catalog |
| Connector URLs (FE) | `src/app/utils.tsx` (`CONNECTOR_URLS`, `CONNECTOR_ACTION_URLS`) | List/create/update connectors; per-loader action URLs |
| DB form | `src/views/DBTableManager.tsx` (`DataLoaderForm`) | Parameter forms for connector instances |

Built-in loader keys today: `mysql`, `postgresql`, `mssql`, `clickhouse`, `kusto`, `databricks`, `s3`, `azure_blob`, `mongodb`, `cosmosdb`, `bigquery`, `athena`, `superset`, `local_folder`, `sample_datasets`. Plugins load from `DATA_FORMULATOR_HOME/plugins` or `DF_PLUGIN_DIR` (local mode only unless `DF_ALLOW_PLUGINS=1`).

### Table / dataframe store (warehouse)

| Layer | Path | Role |
|-------|------|------|
| Workspace (parquet home) | `py-src/data_formulator/datalake/workspace.py` | Per-identity dir; `write_parquet`, `workspace.yaml` metadata, table listing |
| Workspace factory | `py-src/data_formulator/workspace_factory.py` | Resolves active workspace from identity + `X-Workspace-Id` |
| Tables API | `py-src/data_formulator/routes/tables.py` | Upload, list, read, delete; DuckDB for large parquet |
| Sessions / workspaces API | `py-src/data_formulator/routes/sessions.py` | CRUD, export/import zip; URL prefix kept as `/api/sessions` |
| Redux table state | `src/app/dfSlice.tsx` | `DictTable` list, `focusedId`, `activeWorkspace`, `derivedTables`, session persist |
| Workspace service (FE) | `src/app/workspaceService.ts` | List/load/create/delete/export/import workspaces |

After load, tables are **workspace parquet** referenced by `virtual.tableId` in Redux. Sessions are workspaces. There is no separate warehouse product; persisted workspace tables are the warehouse.

### Clean / transform (pipeline)

| Layer | Path | Role |
|-------|------|------|
| Auto pipeline on load | `src/app/tableThunks.ts` | `runPipeline({ trigger: 'load', table_name })` after virtual table added |
| Pipeline API | `py-src/data_formulator/routes/pipeline.py` | `POST /api/pipeline/run`; default steps: PROFILE then CLEAN (`auto_safe_only`) |
| Pipeline executor | `py-src/data_formulator/pipeline/executor.py` | Steps: PROFILE, CLEAN, REFRESH, WORKFLOW; writes derived parquet |
| Clean step API | `py-src/data_formulator/clean_steps/api.py` | `POST /api/agent/compile-clean-step`; sandbox-run verb, write parquet |
| Grid clean verbs (FE) | `src/app/cleanVerbs.ts`, `src/views/SelectableDataGrid.tsx`, `src/views/CleanSuggestionsPanel.tsx` | Interactive clean: rename, split, trim, cast, dedupe, etc. |
| Pipeline UI | `src/views/PipelineRunsPanel.tsx`, `src/app/pipelineApi.ts` | Run history, profiles, suggestions |
| Chart encoding | `src/app/dfSlice.tsx` (`conceptShelfItems`), `src/i18n/locales/en/encoding.json` | Vega field encoding for charts, not data cleaning |

Pipeline step types in models: `load`, `profile`, `clean`, `derive`, `visualize`, `report`, `workflow`, `refresh`. Executor implements profile + clean + refresh + workflow today.

### Existing scrape / URL / fetch paths

| Path | What it does | Warehouse-grade? |
|------|--------------|-------------------|
| `py-src/data_formulator/agents/web_utils.py` | SSRF-safe HTTP fetch, Playwright render, challenge detection | Agent-only; saves to scratch |
| `py-src/data_formulator/agents/agent_data_loading_chat.py` | `fetch_url` tool; agent parses HTML/JSON/CSV in sandbox | Ad-hoc; not connector catalog |
| `UnifiedDataUploadDialog` URL tab | Browser `fetch` of public URL; parse JSON/JSONL/CSV client-side | Loads via `loadTable`; no HTML scrape |
| `sample_datasets_loader.py` | Fetches static public dataset URLs into connector flow | Pattern for URL-backed loader |
| `local_folder_data_loader.py` | Watches folder; re-import on change | Pattern for refreshable source |

No dedicated scraper connector, crawl scheduler, or HTML-to-table loader in the tree.

### Sacred contracts (observed)

- **No KNIME**: No node-canvas ETL UI in codebase.
- **No Spark**: Processing is pandas/pyarrow, DuckDB for large parquet reads, sandbox Python.
- **No SQL as home**: `py-src/data_formulator/routes/sql_query.py` exposes read-only `/api/sql/query` against workspace parquet views; not a primary navigation surface.
- **Distill / Play**: Analyst loop unchanged; scraped data should land as normal workspace tables and flow through existing clean + chart paths.
- **Language first**: i18n on all UI strings; agent uses `Accept-Language`.

---

## Plug-in points (route / store / component / API)

### Recommended scraper integration (reuse, do not fork)

1. **New loader (backend)**  
   - Implement `ScraperDataLoader(ExternalDataLoader)` in `py-src/data_formulator/data_loader/` or as plugin `scraper_data_loader.py`.  
   - Implement `list_catalog`, `preview_data`, `ingest_to_workspace`; reuse `web_utils` for fetch/SSRF guards.  
   - Register via `_LOADER_SPECS` or plugin dir; `DataConnector.from_loader` picks it up automatically.

2. **Connector instance (backend)**  
   - User saves scrape config (URL, selectors, schedule) as connector instance via existing `/api/connectors` CRUD in `data_connector.py`.

3. **Load UI (frontend)**  
   - New row in `DataLoadMenu` connector cards (`UnifiedDataUploadDialog.tsx`); no new Home tile.  
   - Optional parameter form extending `DataLoaderForm` / connector tab pattern (`UploadTabType = connector:${string}`).  
   - Import path: sidebar preview + drag, or import button, calling `CONNECTOR_ACTION_URLS.IMPORT_DATA` then `loadTable` with `sourceTableRef` + `connectorId`.

4. **Persist (warehouse)**  
   - `loader.ingest_to_workspace()` writes parquet + metadata (same as DB/S3 import).  
   - `loadTable` adds to Redux; session auto-save via `/api/sessions/save`.

5. **Structure (pipeline)**  
   - Existing auto `runPipeline` on load handles profile + safe clean.  
   - Custom scrape post-processing: add WORKFLOW step or extend CLEAN params; do not build parallel orchestrator.  
   - Manual clean: `compile-clean-step` / grid verbs unchanged.

6. **Refresh (optional)**  
   - `CatalogCachePolicy` on loader + `/api/connectors/refresh-data` + pipeline `REFRESH` step for re-scrape.

7. **Agent fallback (already exists)**  
   - `DataLoadingChat` + `fetch_url` for one-off messy pages; not the primary product path for F-scraper.

---

## Missing (honest)

- No `ExternalDataLoader` for web scrape / HTML table extraction / paginated crawl.
- No first-class scrape job scheduler (pipeline has `PipelineTrigger.SCHEDULE` in models; scheduling UX/backend completeness unclear from neighborhood read).
- URL tab only handles structured JSON/JSONL/CSV; no HTML parsing in load UI.
- Agent `fetch_url` is powerful but not cataloged, not refreshable, not in connector sidebar.
- No scrape-specific i18n keys or connector guide markdown yet.
- Row caps: `MAX_IMPORT_ROWS` (2M backend), `frontendRowLimit` (2M default FE) may truncate large scrapes silently unless surfaced.

---

## Risks to neighbors

| Neighbor | Risk if scraper built wrong |
|----------|----------------------------|
| F-connectors | Bypassing `ExternalDataLoader` creates a second import path; breaks sidebar preview/refresh/import symmetry. |
| F-workspace | Writing outside `ingest_to_workspace` / `write_parquet` desyncs Redux `virtual.tableId` from disk. |
| F-clean-steps / F-pipeline | Replacing pipeline with ad-hoc transforms skips profiles, suggestions, and run history. |
| F-clean-grid | Client-side scrape-then-paste bypasses server sandbox and duplicate detection in `loadTable`. |
| Security | Fetch without `web_utils._validate_url_for_ssrf` opens SSRF; Playwright render adds server load. |
| Plugin registry | Misnamed plugin file overriding built-in keys is blocked but confusing; document scraper key clearly. |
| UI leakage / Home | New top-level tile or duplicate "Load data" entry fails sacred "silent second Home" rule. |
| Agent chat | Overloading `fetch_url` as the only scrape path duplicates connector UX and is not refreshable. |
| Sessions | Loading before `ensureActiveWorkspace()` (already handled in `DataLoadMenu`) loses tables on wrong workspace. |

### What a new scraper would mess up if not reusing

- Duplicate ingest: agent scratch files vs connector import vs URL tab client fetch (three semantics today).
- `loadTable` duplicate hash skip vs `replaceSource` refresh behavior.
- Connector auth vault and `SENSITIVE_PARAMS` handling if scrape configs contain tokens.
- Pipeline auto-clean creating extra derived tables users did not expect on every scrape load.
- Multi-user mode: `local_folder` disabled pattern may apply to local scrape caches; plugin policy differs from local.

---

## Suggested verdict draft (family)

**SHAPE** -- Datly already ingests via connectors into workspace parquet, auto-profiles and safe-cleans on load, and persists in sessions; a scraper should be a new `ExternalDataLoader` connector row (optionally plugin), reusing `web_utils` fetch guards and the existing pipeline/warehouse path, not a second stack or agent-only shortcut.

---

## Reuse list (compact)

- `ExternalDataLoader` + `DataConnector` + `/api/connectors/import-data`
- `DataLoadMenu` / `UnifiedDataUploadDialog` connector card row
- `DataSourceSidebar` catalog + import
- `loadTable` thunk + `dfSlice` + workspace parquet
- `/api/sessions/*` workspace CRUD
- `runPipeline` (PROFILE + CLEAN on load)
- `clean_steps` / `cleanVerbs` / grid + suggestions
- `web_utils.py` + agent `fetch_url` (reference only, not primary)
- `sample_datasets_loader.py` (URL fetch pattern)
