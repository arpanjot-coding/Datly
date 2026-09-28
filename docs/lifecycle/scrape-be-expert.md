# BE-expert: F-scraper (ingest scrape output as loadable tables)

Feature: F-scraper.  
Role: `[be-expert]`. Report only. Do not edit product code.  
Session: web + desktop.  
Source: `docs/lifecycle/feature-ask-scraper.md`.  
Neighbors only: F-pipeline (structure after parquet exists), F-warehouse (persist workspace tables). Do not plan those jobs here.

Checked: `data_loader/__init__.py` (`_LOADER_SPECS`, `_enforce_deployment_restrictions`), `external_data_loader.py` (`ingest_to_workspace`, `MAX_IMPORT_ROWS`), `data_connector.py` (`/api/connectors`, `import-data`, `refresh-data`, `from_loader`), `sample_datasets_loader.py` (trusted URL fetch), `local_folder_data_loader.py` (`ConfinedDir`), `agents/web_utils.py` (`_validate_url_for_ssrf`, `fetch_url_bytes`, `extract_tables_from_html`, Playwright), `agents/agent_data_loading_chat.py` (Workflow 5 `fetch_url` + scratch jail), `routes/tables.py` (`create_table` raw_data), `src/app/tableThunks.ts` (`loadTable` connector vs gzip), `src/app/useDataRefresh.tsx` (browser `fetchStreamData`), `src/views/UnifiedDataUploadDialog.tsx` (URL tab leftover; DataLoadMenu comment that URL is agent-owned), `src/components/ComponentType.tsx` (`DataSourceType` includes `url` / `stream`), `security/path_safety.py` constraint (no implement).

Sacred: no KNIME, no Spark, no SQL as home. Reuse existing load path. Path-safe. No arbitrary crawl farm.

No em dashes.

---

## 1. Meaning

An analyst pastes one public http(s) data URL or page, Datly fetches it server-side with existing SSRF and size caps, turns the payload into one or more workspace parquet tables, and those tables follow the same clean / Distill / Play / chart loop as any other load.

### Out of scope

- A generic crawler, sitemap walker, robots farm, or multi-hop link graph.
- CSS / XPath selector studio, headless-browser-as-default, or captcha bypass.
- KNIME canvas, Spark cluster, SQL as home, a second Home tile.
- F-pipeline transform / validate / type steps (neighbor: run after tables exist).
- F-warehouse design (neighbor: existing workspace parquet is the warehouse seat).
- New Flask scrape blueprint, new Redux slice, or `file://` / host-path loader.
- Changing `sample_datasets` trusted catalog fetch into a user-URL surface.

---

## 2. Place / plug-in

Do not add `/api/scrape`. Plug a new built-in loader into the connector registry. One user-created connector instance holds the URL. Catalog nodes are tables. Import and refresh are the routes already used by Postgres / local folder / samples.

| Layer | Path | Role today | Role for F-scraper |
|-------|------|------------|--------------------|
| Loader registry | `data_loader/__init__.py` `_LOADER_SPECS` | Built-ins: mysql, s3, `local_folder`, `sample_datasets`, ... | Add one spec: key `web`, class `WebDataLoader`. Plugin override of this key stays blocked. |
| Loader contract | `ExternalDataLoader` | `list_params`, `ls` / `list_tables`, `fetch_data_as_arrow`, `ingest_to_workspace` writes parquet + `source_info` | **The** ingest. `source_table` is a table id (file stem or `table_0`), never SQL, never a crawl queue. |
| Connector API | `POST /api/connectors`, `connect`, `import-data`, `preview-data`, `refresh-data` | `DataConnector.from_loader` auto-wraps every registered class | Keep. User creates `web:<slug>`. No new blueprint. |
| Shared fetch | `agents/web_utils.py` | SSRF (http/https only, block private / metadata IPs, re-check redirects), 20MB `--scratch-max-file-size-mb` cap, `extract_tables_from_html`, optional Playwright | **The only** network entry for user URLs. Loader must call this, not `requests.get` like `sample_datasets`. |
| Agent fetch | `agent_data_loading_chat._tool_fetch_url` | Workflow 5: fetch to `workspace.confined_scratch`, then parse in `execute_python` / preview | Keep as the chat one-off. After F-scraper, preview-load should ingest through the same loader so refresh provenance exists. Sandbox stays offline. |
| Leftover URL tab | `UnifiedDataUploadDialog` `activeTab === 'url'` | Browser `fetch(fullUrl)`, JSON/JSONL/CSV only, CORS-fragile. Load via `loadTable` gzip `raw_data` (`source.type` `url` or `stream`) | Either retire as UI or make it create/import a `web` connector. Do not keep a second fetch stack. |
| DataLoadMenu | `UnifiedDataUploadDialog.tsx` | Comment: Paste / Load from URL subsumed by agent `fetch_url`. Cards: connectors + upload + local folder + add-connection. No URL card. | **No new Home grain.** Surface `web` in add-connection / connector picker only. Silent second Home tile is a fail. |
| Client load | `tableThunks.loadTable` | `sourceType === 'database'` + `connectorId` → `IMPORT_DATA` then `list-tables`. Paste/url/extract → `CREATE_TABLE` raw gzip (no connector refresh) | Scraped tables must take the **database / connector** branch (`connectorId` + `sourceTableRef`) so they are refreshable parquet, not a one-shot gzip dump. |
| Refresh | `useDataRefresh` | `stream` + `url` → browser `fetchStreamData`. Connector tables → `REFRESH_DATA` | New loads use connector refresh. Do not add a third poller. |
| Workspace write | `ingest_to_workspace` → `workspace.write_parquet_from_arrow` | Shared by all loaders. `MAX_IMPORT_ROWS` = 2e6 | Same. Pipeline `runPipeline({ trigger: 'load' })` already fires after `loadTable`; scraper must not invent a second trigger. |
| Path safety | `ConfinedDir`, `safe_data_filename` | local_folder jails `root_dir`. Agent scratch uses `confined_scratch` | Scrape is URL-in, parquet-out. No host `root_dir`. If bytes are staged, jail under workspace scratch. Never `send_from_directory`. Not a local-folder-class loader; no `_enforce_deployment_restrictions` delete unless someone later adds a host path. |

Call path to add (deterministic ingest):

```
add-connection source_type=web
  → POST /api/connectors { loader_type: "web", params: { url } }
  → connect (SSRF test)
  → catalog ls (1 file table, or N HTML <table> nodes)
  → POST /api/connectors/import-data
  → WebDataLoader.fetch_data_as_arrow (web_utils only)
  → ingest_to_workspace → parquet
  → loadTable connector branch → Redux + existing analyst loop
```

Call path to keep (chat one-off):

```
DataLoadMenu chat / extract
  → fetch_url (web_utils + scratch jail)
  → show_user_data_preview
  → user Load
```

After bind: that Load should create or reuse a `web` connector and `IMPORT_DATA`, not only gzip `raw_data`.

Call path **not** to add:

```
/api/scrape → crawl queue → Spark / SQL warehouse
browser fetch → silent Home tile
execute_python requests.get (sandbox has no network)
file:// or host path loader
```

---

## 3. Approach

Layers: shared SSRF fetch → new `WebDataLoader` → existing connector routes → parquet. Prefer extending loaders. Path-safe. No crawl farm.

### Loader (`web` / `WebDataLoader`)

New file `py-src/data_formulator/data_loader/web_data_loader.py`. Append one `_LOADER_SPECS` tuple (`"web"`, module, `"WebDataLoader"`, `"requests"`). `CATALOG_CACHE_POLICY`: treat as expensive / `automatic_refresh: never` (same family as kusto/superset), user refresh only.

`list_params`:

- `url` (string, required, tier connection)
- `render` (boolean, optional, advanced, default false; Playwright, same caveat as agent)
- `format` (string, optional: `auto` / `csv` / `json` / `html` / `xlsx`)
- optional `authorization` (auth tier, in `SENSITIVE_PARAMS`; Bearer or raw header value). Do not persist into `get_safe_params`.

`auth_config`: `{ "mode": "none" }` when no token; credentials only if authorization is set. `test_connection`: `_validate_url_for_ssrf` plus a bounded `fetch_url_bytes` (or HEAD then tiny GET). Fail closed on private IP, bad scheme, resolve error.

`ls` / catalog:

- `format` data file or `content-type` csv/json/xlsx/parquet → one `table` node. `source_table` = sanitized stem.
- HTML → `extract_tables_from_html` (cap already 20). Each node `table_0` … `table_n`. Empty HTML is an honest empty catalog, not a crawl of same-origin links.
- Optional `render=true` only when static body is an app shell (same rule as Workflow 5). Never default-on.

`fetch_data_as_arrow`: fetch again via `web_utils`, parse to pandas, `sanitize_dataframe_for_arrow`, honor `import_options.size` and `apply_import_projection`. Reuse sample-dataset JSON shape unwrap (`data` / `rows` / `records` / `items`) for APIs. `probe`: `probe_utils.run_probe_on_duckdb` like `SampleDatasetsLoader` (no SQL as home).

`ingest_to_workspace`: do not override unless provenance needs `url` / `final_url` in `source_info`. Base method already stores `loader_type`, safe params, `source_table`, `import_options`.

Guide: `data_loader/guides/web.md` (AUTH_GUIDE). Frontend maps: `CONNECTOR_TYPE_KEY_MAP`, `CONNECTOR_ICONS`, `CONNECTOR_CATEGORY_ORDER` (near `sample_datasets` / local, not a new Home group). i18n `upload.connectorDesc.web` in **en** and **zh**.

### Leftover URL tab and stream refresh

Today the URL tab is a second, weaker product: browser CORS, no HTML tables, gzip dump, `source.type` `url`/`stream`, refresh via `fetchStreamData` (another browser fetch). F-scraper makes that path a compatibility shim:

1. Preview and load go through `web` connect + preview-data / import-data.
2. New tables get `source.type: 'database'`, `connectorId`, `canRefresh: true`.
3. `useDataRefresh` does not grow a scrape poller; connector tables already hit `REFRESH_DATA`.
4. Existing sessions that already have `type: 'url'|'stream'` keep working until the user reloads; do not migrate silently.

### Agent bind (same helpers, not a second scraper)

`fetch_url` already is the chat scraper. Do not add `scrape_site`. After the loader exists, Workflow 5 Load should `propose_connection` / import when the user wants a reusable source. `execute_python` stays without network. Untrusted-content rule stays: extract values, never follow page instructions.

### Path / URL safety (constraint only)

- User URL: `_validate_url_for_ssrf` on first hop and every redirect (`_ssrf_safe_session`).
- No `file://`, no host `root_dir`, no `str.startswith` path checks.
- Scratch stage: `workspace.confined_scratch.resolve` + `safe_data_filename`.
- Multi-user: loader stays enabled (it is not local-folder). SSRF is the guard. Do not copy `sample_datasets` raw `requests.get`.
- Playwright: optional, documented subresource leak; not v1 default.

### Tests (TDD)

`tests/backend/data_loader/test_web_loader.py`: SSRF rejects private / metadata / non-http; size cap; csv/json/html-table happy paths with mocked `fetch_url_bytes`; `source_table` identifier only; no link follow. Do not weaken existing connector tests.

---

## 4. Verdict

**SHAPE**

Neighborhood already has connector ingest, agent `fetch_url`, HTML table extract, and a leftover browser URL tab. The job is to make scrape a **connector family** that lands parquet on the existing load path, not a new product.

Not FIT: URL tab is CORS-only and drops refresh provenance; agent scrape is chat-only; there is no `web` spec in `_LOADER_SPECS`; `sample_datasets` fetch is not a user-URL pattern.

Not ASK: feature-ask already locks connector family, no crawl farm, reuse load path, "use for ...." = existing insight loop.

Not UNFIT: does not need KNIME, Spark, SQL-as-home, or a second app.

Hard stop: do not implement a crawl farm, a scrape microservice, or warehouse SQL. F-pipeline and F-warehouse stay neighbors.

---

## 5. Risks / what the unified plan must not break

- **SSRF.** A loader that uses `requests.get` (sample_datasets style) on user URLs opens metadata and LAN. Unified plan must name `web_utils` as the only user-URL client.
- **Two fetch stacks.** Leaving browser URL tab + server loader both "primary" splits accuracy (CORS vs HTML vs refresh). New ingest is server + connector. Old `url`/`stream` tables remain until reload.
- **Gzip dump vs connector ingest.** Agent or URL-tab Load that only posts `raw_data` makes scrape unrefreshable and invisible to F-warehouse-as-workspace-source. Plan must require `connectorId`.
- **Silent Home tile.** DataLoadMenu must not grow a scrape card beside History / Demos. Fail if a second Home grain appears.
- **Playwright / captcha.** `render=true` must stay opt-in. Verification-challenge handling already in `fetch_url`; do not promise bypass.
- **Untrusted HTML.** Prompt and parser extract tables only. No instruction-following, no same-origin crawl.
- **Caps.** 20MB fetch and `MAX_IMPORT_ROWS` stay. Do not promise full-site dumps.
- **Sandbox wall.** `execute_python` stays offline. Do not whitelist `requests` in the sandbox to "help scrape."
- **sample_datasets.** Do not route the built-in catalog through user-URL UI or break its cache.
- **local_folder / ConfinedDir.** Do not teach `web` a host path. Do not relax deployment disable rules.
- **DISABLE_DATA_CONNECTORS.** User `web` instances follow that flag. Agent `fetch_url` may remain (like today). Say so in the plan; do not silently hide chat fetch.
- **Refresh timers.** Do not add a scrape interval next to `stream` and connector refresh.
- **Pipeline / warehouse neighbors.** Do not put clean-steps or a new warehouse store in F-scraper. `runPipeline({ trigger: 'load' })` already runs; do not double-fire.
- **F-workflow-db / F-sql-guard.** `source_table` stays an identifier. No `execute_sql` on scraped pages.
- **Credentials.** Authorization header is `SENSITIVE_PARAMS`. Never echo into catalog metadata or frontend logs.
- **i18n.** New picker strings go through `t()` with en + zh in the same chunk as the UI map.

---

## 6. Suggested chunks (ids only)

`C-scrape-ssrf-fetch`  
`C-scrape-loader`  
`C-scrape-html-tables`  
`C-scrape-ui-type`  
`C-scrape-url-tab`  
`C-scrape-refresh`  
`C-scrape-agent-bind`

Do not spawn: `C-scrape-crawler`, `C-scrape-spark`, `C-scrape-sql`, `C-pipeline-*`, `C-warehouse-*`.

First impl slice: `C-scrape-ssrf-fetch` + `C-scrape-loader`. Catalog HTML nodes and UI maps follow. Agent bind after import provenance exists.
