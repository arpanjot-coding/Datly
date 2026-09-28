# Work package - F-scraper + F-pipeline + F-warehouse

- **Status:** IN_PROGRESS
- **Kind:** W
- **Plan gate:** APPROVED (user: finish). plan-check PASS. First impl: C-scrape-ssrf-fetch.
- **Session:** web, desktop. Same renderer. No desktop-only fork. android/ios not in this ship set.
- **Features:** F-scraper (ingest), F-pipeline (structure), F-warehouse (persist). One family, one package.
- **Wave A+2 sources (merged, not reopened slim):** `docs/lifecycle/scrape-neighborhood.md`, `scrape-be-expert.md`, `scrape-ui-expert.md`, `scrape-pipeline-be.md`, `scrape-warehouse-be.md`.
- **Research skip:** W-scrape-res was CHILD-KILL (stalled; no `scrape-research.md`). Do not invent rival URLs. Decisions rest on specialists + neighborhood, not a clone study.
- **Lane:** BUILD
- **Ask:** `docs/lifecycle/feature-ask-scraper.md`
- **Blast:** new `web` loader + Explore hydrate + workspace provenance contract. No new Home grain. No second orchestrator. No warehouse product.

## Ask / out of scope

**Verbatim:** I think we should also focus on a feature that we can integrate data scrapers which can bring the data in the app which the user can clean get the insights and actually make that scraped data usable and structure it with the help of the pipeline which we are going to make. Should be strong and efficient and accurate to help to warehouse that scraped data to use for ....

**User job:** Bring scraped data into Datly, structure it with an accurate pipeline, warehouse those tables, then clean and get insights on the existing analyst loop.

**Locked SHAPE (must not drift)**

- **Scrapers** = new `web` `ExternalDataLoader` on existing `/api/connectors` + `ingest_to_workspace`. SSRF via `web_utils` only. No crawl farm. No `/api/scrape`. No Home tile.
- **Pipeline** = existing `POST /api/pipeline/run` + PROFILE / CLEAN. Explore health + kebab. Hydrate CLEAN into Redux (ghost CLEAN is the accuracy hole). No KNIME. No second orchestrator.
- **Warehouse** = workspace parquet + `/api/sessions`. Success needs `connectorId` + `source_info`. Gzip `raw_data` Load is the provenance gap. No `/api/warehouse`. No Spark. No SQL as home.

**Out of scope**

- KNIME node canvas, Spark cluster, SQL as home, a generic crawler / sitemap / robots farm
- CSS / XPath selector studio, Playwright as default, captcha bypass
- `/api/scrape`, `/api/warehouse`, `/api/pipeline/structure`, a second pipeline executor
- Silent second Home tile, landing Scrapers section, warehouse screen, fourth sidebar rail
- UI leakage restyle, History / free SaaS `C-hist-*`, Night theme, Stripe, live share
- Implementing unused executor steps `load` / `derive` / `visualize` / `report`; Knowledge runs as the editor
- Fake `source_info` stamped onto gzip `create-table` JSON
- Rival-product clone list (research skipped)

Do not spawn: `C-scrape-crawler`, `C-scrape-spark`, `C-scrape-sql`, `C-pipe-canvas`, `C-pipe-spark`, `C-pipe-sql`, `C-pipe-orchestrator`, `C-wh-sql`, `C-wh-spark`, `C-warehouse-page`.

## Meaning

An analyst pastes one public http(s) URL or page. Datly fetches it server-side with existing SSRF and size caps, lands one or more workspace parquet tables through a `web` connector, profiles and safe-cleans the focused Explore table so it is as structured as a CSV or DB load, then History / Sessions reopen those tables with refresh provenance. Distill / Play / charts stay as today.

Who: an analyst who already scrapes (or will scrape) sites, APIs, or files and needs that data inside Datly, not in a second ETL app.

Entry -> steps -> success:

1. Add-connection (or Sources +) picks loader type `web`, or the leftover URL tab / agent `fetch_url` bind to the same connector.
2. `POST /api/connectors` then `import-data` -> `WebDataLoader` -> `ingest_to_workspace` -> parquet + `source_info`.
3. `loadTable` connector branch (`connectorId` + `sourceTableRef`) -> Redux virtual table.
4. `POST /api/pipeline/run` trigger=load (PROFILE then CLEAN `auto_safe_only`) -> hydrate CLEAN output into Redux and focus it.
5. Explore `DataHealthCard` + kebab for further structure. Knowledge `PipelineRunsPanel` is a run log only.
6. `POST /api/sessions/save` keeps `inputTables` with `kind: connector` + `connectorId`. Reopen via landing History / Sessions. Refresh uses `/api/connectors/refresh-data`.

"Use for ...." = existing insight job (clean, Distill, Play, charts). Not a new downstream product.

## Verdict

**SHAPE** (logged slim). Neighborhood already ingests via connectors into workspace parquet, auto-profiles on load, and persists in sessions. The family is a `web` connector row + making PROFILE/CLEAN actually structure the focused table + requiring `connectorId` / `source_info` so warehouse reopen can refresh. Not a second stack.

**Logged slim (do not reopen):** scrapers = connector family. Pipeline = Explore table chrome (plus existing Knowledge run log). Warehouse = workspace tables. Drop canvas, drop warehouse page, drop Home scrape tile.

- **Not FIT:** no `web` spec in `_LOADER_SPECS`; leftover URL tab is CORS-only gzip; agent scrape is chat-only; load CLEAN is a ghost write; suggestions miss header/type; kebab cannot reach `cast` / `first_row_header`; gzip extract/URL writes parquet without `source_info`.
- **Not ASK:** feature-ask already locks connector family, no crawl farm, transform on the focused table, warehouse = session tables, "use for ...." = existing insight loop.
- **Not UNFIT:** the job is load -> clean -> insights. That is Datly.

Research W-scrape-res CHILD-KILL: no `docs/lifecycle/scrape-research.md`. This verdict does not rest on invented competitor URLs. It rests on Wave A+2 specialists + `scrape-neighborhood.md`.

Hard stop: no crawl farm, no scrape microservice, no Spark / SQL lake, no second Home grain.

## Place / grain

No new route. No new Home tile. Same renderer on web and desktop.

| Job | Live plug-in | After |
|-----|----------------|-------|
| F-scraper create | Add-connection (`UploadTabType` `add-connection`) + `DataLoaderForm` | Loader type `web` in that list. Same form chrome as MySQL / S3 / local folder. |
| F-scraper start | `DataLoadMenu` connector cards after an instance exists | Instance is one card among `connectionSources`. Do not add a fourth action next to Upload / Link folder / Connect databases. |
| F-scraper one-off | Data Loading Agent (`extract` / `fetch_url`) | Keep as chat one-off. Persistent scrape is the connector. Bind Load to import, not gzip. |
| F-scraper browse | Sources tab catalog (`DataSourceSidebar`) | Same row + tree as other connectors. |
| F-scraper leftover URL | `UnifiedDataUploadDialog` `url` tab | Compatibility shim: create/import `web`. Do not keep a second fetch stack as primary. |
| F-pipeline structure | Explore: `DataHealthCard` + `CleanSuggestionsPanel` + column kebab | That is the editor. No Pipeline tab. No canvas. Knowledge `PipelineRunsPanel` stays a run log. |
| F-warehouse later | Workspace parquet + `/api/sessions` + landing History / Sessions | No warehouse object and no warehouse screen. |

### Grain

| Place | Unique job | Must not reprint |
|-------|------------|------------------|
| Landing `DataLoadMenu` | Start ingest / agent | History, Distill, Play, warehouse list |
| Add-connection + `connector:${id}` | Create / edit a `web` source | Catalog tree, clean steps |
| Sources tab | Browse and load tables from connected sources | Landing History, Knowledge workflows |
| Explore focused table | Structure / clean this table | Dashboard tiles, Knowledge Distill |
| Knowledge | Distill / Play; pipeline **run log** only | Scrape form, table catalog |
| Sessions / landing History | Reopen the warehoused project | Connector list |

### Sacred (must not break)

- Language first. New user-visible strings use `t()` with **en and zh in the same chunk**.
- Distill / Play stay. Do not hide Explore / Reports pills. Do not replace Knowledge with pipeline runs.
- No silent second Home tile. Fail if a landing Scrapers section or extra DataLoadMenu hero appears.
- No KNIME. No Spark. No SQL as home.
- One network entry for user URLs: `agents/web_utils.py`. Do not copy `sample_datasets` `requests.get`.
- One orchestrator: `PipelineExecutor` via `POST /api/pipeline/run`. Do not route clean through `data_operations`.
- One warehouse write: `Workspace.write_parquet` / `write_parquet_from_arrow` with `source_info`. URL prefix stays `/api/sessions`.
- `DISABLE_DATA_CONNECTORS`: `web` instances follow that flag. Agent `fetch_url` may remain. Do not fake a connected scrape card.
- Old `url` / `stream` sessions keep working until the user reloads. Do not silent-migrate.
- `execute_python` stays offline. Do not whitelist `requests` in the sandbox.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-scrape-ui-type | |
| section-grain | C-scrape-ui-type | |
| phone-chrome | n/a | no android/ios phone chrome (web+desktop only) |
| web-layout | C-scrape-ui-type | |
| desktop-chrome | C-scrape-ui-type | |
| first-run | n/a | no first-run / runtime grant change |
| value-slide | n/a | no value-slide art |
| app-polish | n/a | no icon / empty-start / About and Legal work |
| notifications | n/a | no reminders or local alerts |
| store-review | n/a | no in-app or store rating ask |
| shareability | n/a | no OS share of a visual artifact |
| i18n | C-scrape-ui-type | |
| hardware-back | n/a | no android hardware Back |

i18n follow-ons in later chunks (same rule, not a second house-law row): `C-pipe-kebab-types` (`pipeline.grid.*` en+zh), `C-pipe-i18n-issues` (`pipeline.issue.*` en+zh). `C-wh-*` stays contract-only unless a reconnect-to-refresh string appears (then en+zh in that chunk).

## Chunks

Keep these jobs. First `[impl]` is **loader + hydrate + ingest contract**, not this whole list.

**First impl slice (shard; do not batch the rest)**

| Family | Chunks this slice | Why first |
|--------|-------------------|-----------|
| F-scraper | `C-scrape-ssrf-fetch` then `C-scrape-loader` | Ingest seat. HTML catalog and UI maps wait. |
| F-pipeline | `C-pipe-hydrate` (`C-pipe-exec-tests` may run parallel, disjoint tests) | Ghost CLEAN is the accuracy hole. Suggestions wait until output is visible. |
| F-warehouse | `C-wh-ingest-contract` | Locks parquet + `source_info` vs gzip. Session/refresh wait. |

File-disjoint enough to run as three writers after `C-scrape-ssrf-fetch` if the Manager shards.

| ID | Goal | Depends | Acceptance | Status | Why (if not DONE) |
|----|------|---------|------------|--------|-------------------|
| C-scrape-ssrf-fetch | Shared user-URL client is `web_utils` only (`_validate_url_for_ssrf`, `fetch_url_bytes`, redirect re-check). Size cap stays. No `requests.get` on user URLs. No `file://` / host `root_dir`. Pytest: reject private / metadata / non-http. | - | `tests/backend/data_loader/test_web_loader.py` (or split SSRF module) fails closed on SSRF cases. `sample_datasets` catalog fetch unchanged. | DONE | |
| C-scrape-loader | New built-in `web` / `WebDataLoader` in `_LOADER_SPECS`. Params: `url` required; `render` default false; `format` auto/csv/json/html/xlsx; optional `authorization` in `SENSITIVE_PARAMS`. `ingest_to_workspace` for data files (one catalog node). `CATALOG_CACHE_POLICY` expensive / never auto. `test_connection` uses `web_utils`. Guide `data_loader/guides/web.md`. | C-scrape-ssrf-fetch | `POST /api/connectors` + `import-data` writes parquet. `source_table` is an identifier, never SQL, never a crawl queue. Plugin override of key `web` stays blocked. `DISABLE_DATA_CONNECTORS` still gates instances. | DONE | |
| C-wh-ingest-contract | Contract tests only (no `/api/warehouse`). `ingest_to_workspace` writes `source_info`. `create-table` `raw_data` does not. `refresh-data` 400 without `source_table`. Do not weaken `test_source_metadata.py`. | - | New backend pytest (name flexible, e.g. `tests/backend/data/test_warehouse_scrape_contract.py`) proves ingest vs gzip provenance. | DONE | |
| C-pipe-hydrate | Shared FE helper next to `pipelineApi.ts` / `cleanVerbs.ts`: if CLEAN `applied` + `output_table`, insert derived + `setFocused` + stats/semantics; if `skipped`, stay on source. `loadTable` **awaits** `runPipeline` (do not swallow). `applyAllSafe` uses the same helper. Lineage matches kebab (`derive.trigger.tableId`). Do not fork `applyCleanVerb`. | - | After a virtual load, focused table is the CLEAN output when applied. FE unit test that hydrate + `applyAllSafe` insert and focus. Unref-GC must not delete the just-focused table. | DONE | |
| C-pipe-exec-tests | TDD for `PipelineExecutor`: PROFILE then CLEAN writes parquet; `auto_safe_only` skips `cast` / `fill`; skip when no verbs; chain updates `context.table_name`. Compile tests for existing `cast` and `first_row_header` templates. | - | `tests/backend/pipeline/test_executor.py` green. Do not weaken `test_routes.py` default load pipeline. | PENDING | Waiting for your approve |
| C-scrape-html-tables | HTML catalog via `extract_tables_from_html` (cap 20). Nodes `table_0` .. `table_n`. Empty HTML is an honest empty catalog. No same-origin link follow. `render=true` opt-in only. | C-scrape-loader | Mocked HTML happy path in loader tests. No crawl. Untrusted HTML extracts tables only. | DONE | |
| C-scrape-ui-type | Register `web` in `CONNECTOR_TYPE_KEY_MAP`, icons, category (near samples / local). `upload.connectorDesc.web` **en and zh** in this chunk. Add-connection lists it. Connected instance is a DataLoadMenu card. Empty catalog uses existing Sources empty + why. No new Home grain. No fourth menu action. Same chrome on web 375/1280 and desktop titlebar. | C-scrape-loader | Add-connection shows `web`. Landing has no Scrapers tile. Hosted connectors-off is honest. Frontend tests if UI maps change. | DONE | |
| C-wh-source-info | Web ingest stores safe `url` / `final_url` via `get_safe_params` if needed. `loader_type` stays class name. Authorization never in `workspace.yaml` or `list-tables`. Do not put `connectorId` in yaml. | C-wh-ingest-contract, C-scrape-loader | Yaml has `source_table` + safe params after import. Secrets absent. File-upload `source_type=upload` untouched. | DONE | |
| C-pipe-suggest-types | Generic profile signals (not `loader_type == web`): `leading_trailing_space`, `header_in_first_row`, `string_typed_numeric` / `string_typed_date`. Suggestions emit `first_row_header` and `cast` with `auto_safe=false`. Optional `rename` for `Unnamed` (`auto_safe=false`). No auto-cast or auto-header on load. | C-pipe-hydrate | All-string scrape-shaped fixtures suggest header/type. Load CLEAN still `auto_safe_only`. Profiler/suggestions pytest. | PENDING | Waiting for your approve |
| C-pipe-safe-verbs | Evidence-based trim only. Keep `SAFE_AUTO_VERBS` = trim, dedupe. Prefer one CLEAN chain over N intermediate parquet files. | C-pipe-suggest-types | No whitespace evidence => no trim suggestion. A 20-column all-string table does not write 20 trim files on load. | PENDING | Waiting for your approve |
| C-pipe-kebab-types | Wire `cast` and `first_row_header` on column kebab (`runCleanVerb` / `ColumnFilterPopover`). `pipeline.grid.*` **en and zh** in this chunk. No new dialog family. | C-pipe-suggest-types | Kebab can apply those verbs. Frontend tests if the menu map changes. | PENDING | Waiting for your approve |
| C-pipe-i18n-issues | Health chips use `issue.code` + `t('pipeline.issue.*')` with params. New codes get **en and zh** in this chunk. No new English profiler literals in the card. | C-pipe-suggest-types | `DataHealthCard` does not render raw English for new issue codes. | PENDING | Waiting for your approve |
| C-scrape-url-tab | Leftover URL tab preview/load goes through `web` connect + preview-data / import-data. New tables: `source.type: 'database'`, `connectorId`, `canRefresh: true`. Do not grow a scrape poller. Old `url`/`stream` sessions unchanged until reload. | C-scrape-ui-type | New URL ingest is the connector path. Browser `fetch` is not the primary. FE test if the tab map changes. | DONE | |
| C-scrape-refresh | Refresh uses existing `/api/connectors/refresh-data` + `useDataRefresh` connector branch. Re-fetch via `web_utils`. No scrape interval next to stream. Pipeline `trigger-refresh` hydrate rule if CLEAN writes. | C-scrape-loader, C-wh-source-info | Refresh updates parquet and keeps `source_info`. No third poller. | DONE | |
| C-scrape-agent-bind | After loader exists, Workflow 5 Load `propose_connection` / `IMPORT_DATA` for a reusable source. Keep `fetch_url` as the chat one-off. No `scrape_site` tool. `execute_python` stays without network. Untrusted-content rule stays. | C-scrape-url-tab | Agent Load of a fetched preview creates or reuses a `web` connector. Gzip-only Load is not the new scrape warehouse path. | DONE | |
| C-wh-session-reopen | Session save keeps `toInputTable` `kind: connector` when `connectorId` is set. Load hydrates via `SAMPLE_TABLE` + `X-Workspace-Id`. Zip has parquet + `workspace.yaml`, not vault secrets. Ingest uses the active workspace (`ensureActiveWorkspace`). | C-wh-source-info | History / Sessions reopen shows the tables. `connectorId` survives save/load. FE: `toInputTable` without `connectorId` stays `kind: workspace`. | DONE | |
| C-wh-refresh-provenance | After reopen, `REFRESH_DATA` works when the `web:` instance still exists. Missing instance is reconnect, not fake `canRefresh`. Derived CLEAN parquet does not inherit scrape refresh. | C-wh-session-reopen, C-scrape-refresh | Refresh after `loadWorkspace` succeeds with live connector. Deleted instance does not look connected. | DONE | |
| C-wh-gzip-bind | Assert leftover gzip extract/URL is not the scrape warehouse path. Fail this slice until URL-tab + agent bind exist. Do not stamp fake `source_info` onto gzip JSON. Old `url`/`stream` remain until reload. | C-scrape-url-tab, C-scrape-agent-bind, C-wh-ingest-contract | New scrape loads have `source_info` + `connectorId`. Gzip leftover is documented only for old sessions. | IN PROGRESS | Writer live, wave 16 |

**Order:** SSRF -> loader. Ingest-contract, hydrate, and executor tests may start in parallel with loader (disjoint files). HTML tables and UI type after loader. Source-info after ingest-contract + loader. Suggest/safe/kebab/issue after hydrate. URL tab after UI type. Refresh after loader + source-info. Agent bind after URL tab. Session reopen after source-info. Refresh-provenance after session reopen + scrape refresh. Gzip bind last.

## Proof

- Campaign / S9 (after chunks Accepted): lite `[wf]` + `[ui-vis]` + `[connect]` + `[arch-fit]` on add-connection `web` -> import -> Explore focused CLEAN table -> kebab -> History reopen -> refresh. Distill / Play still reachable. No Home scrape tile. No warehouse page. No KNIME canvas.
- Tests (Datly TDD): backend pytest for loader + pipeline executor/profiler; warehouse contract pytest; frontend unit tests when UI maps or hydrate helper change. Run `python -m pytest tests/backend/ -q` for touched backend; `yarn test` for touched FE.
- Flags: shipsNotifications false. writesOutput false. siblingFamily true (F-scraper + F-pipeline + F-warehouse).
- Do not break: `sample_datasets` cache, `local_folder` / `ConfinedDir`, Distill payload, Play sheet, F-workspace History grain, file-upload provenance, old `url`/`stream` refresh, sandbox offline wall.

## User questions

None.
