# BE-expert: F-pipeline (structure focused tables)

Feature: F-pipeline.  
Role: `[be-expert]`. Report only. Do not edit product code.  
Session: web + desktop.  
Source: `docs/lifecycle/feature-ask-scraper.md`.  
Neighbors only: F-scraper (tables must already be workspace parquet), F-warehouse (session persist of those tables). Do not plan those jobs here.

Checked: `routes/pipeline.py` (`POST /api/pipeline/run`, default PROFILE then CLEAN `auto_safe_only`), `pipeline/executor.py` (PROFILE, CLEAN, REFRESH, WORKFLOW), `pipeline/models.py`, `pipeline/repository.py`, `data_quality/profiler.py`, `data_quality/suggestions.py` (`SAFE_AUTO_VERBS` = trim, dedupe), `clean_steps/compiler.py` + `templates.py` + `api.py` (`POST /api/agent/compile-clean-step`), `src/app/pipelineApi.ts`, `src/app/tableThunks.ts` (`runPipeline` after virtual load), `src/app/cleanVerbs.ts` (`applyCleanVerb`), `src/views/DataHealthCard.tsx`, `src/views/CleanSuggestionsPanel.tsx`, `src/views/SelectableDataGrid.tsx` + `ColumnFilterPopover.tsx` kebab, `src/views/PipelineRunsPanel.tsx` (Knowledge log), `src/i18n/locales/en/pipeline.json` + `zh`, `tests/backend/pipeline/test_routes.py` + `test_pipeline_repository.py`, `tests/backend/data_quality/test_profiler.py`. `data_operations/` is the agent ingest planner, not this job.

Sacred: no KNIME, no Spark, no SQL as home. One orchestrator: `PipelineExecutor`. Explore health card + kebab stay the editor. Knowledge `PipelineRunsPanel` stays a run log.

No em dashes.

---

## 1. Meaning

After a scrape-loaded (or any) table exists as workspace parquet, Datly profiles it and applies transform / validate / type steps on the focused Explore table so the analyst sees a structured table as accurate as a CSV or connector load, then Distill / Play / charts as today.

### Out of scope

- KNIME canvas, Spark, SQL as home, a second pipeline product, a Pipeline nav tab.
- A second orchestrator (do not merge with `data_operations`, do not add `/api/scrape/transform`).
- Implementing unused step types `load`, `derive`, `visualize`, `report` (Distill / Play already own derive and charts).
- F-scraper ingest (neighbor: loader must land parquet + `virtual.tableId` so this path fires).
- F-warehouse design (neighbor: session persist of the same tables).
- Crawl farm, selector studio, schedule farm (`PipelineTrigger.SCHEDULE` stays unused here).
- Silent Home tile, warehouse screen, or moving edit into Knowledge runs.

---

## 2. Place / plug-in

Do not add `/api/pipeline/structure` or a scrape-only runner. Plug accuracy into the existing run + clean + Explore chrome. F-scraper only needs to land a virtual workspace table; this job owns what happens after.

| Layer | Path | Role today | Role for F-pipeline |
|-------|------|------------|---------------------|
| Load trigger | `src/app/tableThunks.ts` `loadTable` | After `addTableToStore`, if `finalTable.virtual`, fire-and-forget `runPipeline({ trigger: 'load', table_name })` | Keep this single trigger. Await it. Hydrate CLEAN outputs into Redux. Do not add a scrape-only second call. |
| Run API | `POST /api/pipeline/run` | Empty `steps` + `table_name` → `_default_load_pipeline`: PROFILE then CLEAN `auto_safe_only` | **The** orchestrator entry. Manual Apply-safe already posts CLEAN here. |
| Profile API | `POST /api/pipeline/profile`, `GET .../profile/<name>`, `POST /suggestions` | Health card rescans independently | Keep. Extend issue codes, not a new route. |
| Refresh cascade | `POST /api/pipeline/trigger-refresh` | REFRESH + PROFILE + optional CLEAN + bound WORKFLOW | Neighbor refresh (F-scraper connector). Same hydrate rule if CLEAN writes. |
| Executor | `pipeline/executor.py` | PROFILE → `analyze_table_statistics` + `build_table_profile` + `suggest_clean_steps`. CLEAN → `compile_and_sign` + sandbox + `write_parquet` chain. REFRESH / WORKFLOW stubs | **The only** step runner. Add no scrape `if loader_type`. Accuracy lives in profiler + suggestions + verb params. |
| Clean compile | `clean_steps/templates.py` | Verbs: rename, split, replace, trim, fill, drop, dedupe, cast, first_row_header, keep_rows, remove_rows | Reuse. Type step = `cast`. Header step = `first_row_header`. Do not invent new Python from the client. |
| Grid apply | `POST /api/agent/compile-clean-step` + `applyCleanVerb` | One verb, insert derived table, focus it | Keep for kebab and per-suggestion Apply. Apply-safe must use the same hydrate helper as load. |
| Explore editor | `DataHealthCard` + `CleanSuggestionsPanel` above `FreeDataViewFC`; kebab trim / fill / dedupe | UI place already locked (`scrape-ui-expert.md`) | Structure UI. Add cast / first_row_header on kebab only if suggestions emit them. No steps rail (F-clean-steps later). |
| Run log | Knowledge `PipelineRunsPanel` | Lists trigger + status + step types | Log only. Do not edit scrape or clean here. |
| Stats source | `routes/tables.py` `analyze_table_statistics` | DuckDB or pandas count / null / unique / levels | Extend with sample signals (whitespace, header-like first row, parseable number/date). Shared by PROFILE and health. |
| Types (existing, do not fork) | `fetchFieldSemanticType` (LLM, 15 rows); `inferTypeFromValueArray` (FE) | Semantics for encoding, not parquet dtype | Pipeline `cast` must not fight encoding. Semantic fetch stays on load. Do not make PROFILE an LLM step. |
| Agent ingest planner | `data_operations/` | Connector query plans for chat Load | Neighbor. Not a transform pipeline. Do not route F-pipeline through it. |

Call path to keep (every virtual load, including scrape after F-scraper):

```
loadTable (virtual.tableId)
  → POST /api/pipeline/run trigger=load table_name=...
  → PipelineExecutor PROFILE + CLEAN(auto_safe_only)
  → hydrate applied output_table into Redux (same as applyCleanVerb)
  → DataHealthCard profiles the focused table
  → kebab / suggestions → compile-clean-step or CLEAN run
```

Call path **not** to add:

```
/api/scrape/transform → second executor
data_operations.execute → clean verbs
browser-only reshape of scrape rows
KNIME / SQL warehouse step
```

---

## 3. Approach

Layers: profile signals → suggestions → existing CLEAN verbs → one executor → FE hydrate. Prefer extending profiler / suggestions / hydrate. Path-safe writes stay `workspace.write_parquet`. No second orchestrator.

### Why this is not FIT yet (accuracy holes)

1. **Ghost CLEAN.** `_step_clean` writes `source_table_verb_<hex>` parquet and returns `output_table`. `loadTable` ignores the run (`.catch(() => undefined)`). `CleanSuggestionsPanel.applyAllSafe` also ignores it. The grid still shows the dirty source. Kebab Apply works because `applyCleanVerb` calls `insertDerivedTables` + `setFocused`. Scrape-loaded tables are not as structured as a kebab-cleaned CSV.

2. **Trim spam.** `suggest_clean_steps` emits auto-safe `trim` for every object/string/varchar column, with no whitespace evidence. A 20-column HTML table can write 20 intermediate parquet files on every load.

3. **Missing type / header structure.** Templates already have `cast` and `first_row_header`. Suggestions never emit them. Profiler never flags header-as-first-row, `Unnamed` columns, or string columns that parse as number/date. Scrapes are usually all-string. Encoding LLM types do not change parquet.

4. **Kebab subset.** Grid kebab only wires trim / fill / dedupe. Cast and first_row_header exist but are unreachable from the column menu.

5. **Issue chips are English literals.** `DataHealthCard` renders `issue.message` from the profiler (`"42% null values"`). New codes must be codes + FE `t('pipeline.issue.*')` (en + zh), not more hardcoded chips.

6. **Tests.** Routes + repository + thin profiler tests exist. No `PipelineExecutor` CLEAN test. No `clean_steps` template tests in `tests/backend`. No FE test that `runPipeline` hydrates.

### What to implement (same path for scrape and every other load)

**A. Hydrate CLEAN (shared helper)**  
New small FE helper next to `pipelineApi.ts` / `cleanVerbs.ts` (do not fork `applyCleanVerb`):

- Input: `PipelineRun` + source `tableId`.
- If CLEAN `result.skipped`, stay on source.
- If `result.applied` and `output_table`, list or read that workspace table, `insertDerivedTables` (or `buildDictTableFromWorkspace` + lineage), `addConceptItems`, `setFocused` to the output, then `fetchColumnStats` / `fetchFieldSemanticType` on the new table.
- Use from `loadTable` (await, do not swallow) and `applyAllSafe`.
- Lineage: `derive.trigger.tableId` = source, `virtual.tableId` = written name, same as kebab. Unref-derived GC in `dfSlice` must not delete a just-focused structured table. Plan must treat pipeline output like a kebab derive, not a silent sibling `inputTable`.

**B. Profile signals (generic, not `loader_type == web`)**  
Extend `analyze_table_statistics` or `build_table_profile` with cheap sample checks:

- `leading_trailing_space` on text columns (only then suggest trim).
- `header_in_first_row` when first row looks like names and current names are `0`/`1`/`Unnamed`/`c0`.
- `string_typed_numeric` / `string_typed_date` when parse rate is high (then suggest `cast`, `auto_safe=false`).
- Keep null / duplicate / schema_drift.

Do not special-case scrape in the executor. A pasted HTML table and a `web` connector table share the same issues.

**C. Suggestions**  
Keep `SAFE_AUTO_VERBS` conservative (`trim`, `dedupe`). Add:

- `first_row_header` (`auto_safe=false`) from header signal.
- `cast` (`auto_safe=false`) with `params.type` in `CAST_TYPES`.
- Optional `rename` for `Unnamed` (`auto_safe=false`).
- One trim per column only when whitespace is real. Prefer chaining inside one CLEAN step (executor already chains on `current_table`) over N isolated Apply clicks.

Do not auto-cast or auto-promote headers on load. Wrong header/type is worse than messy text.

**D. Kebab**  
Wire existing verbs the suggestions emit (`cast`, `first_row_header`) through `runCleanVerb` / `ColumnFilterPopover`. i18n `pipeline.grid.*` en + zh in the same chunk. No new dialog family.

**E. Executor**  
Do not add VALIDATE or TYPE step types. Validate = profile issues. Type = `cast` verb. Leave `LOAD` / `DERIVE` / `VISUALIZE` / `REPORT` unimplemented. Do not implement WORKFLOW replay here.

**F. Tests (TDD)**  

- `tests/backend/pipeline/test_executor.py`: PROFILE then CLEAN writes parquet; `auto_safe_only` skips `cast` / `fill`; skip when no verbs; chain updates `context.table_name`.
- `tests/backend/data_quality/test_profiler.py` / new suggestions tests: no blanket trim; header + cast cases on all-string fixtures (scrape-shaped, not loader-mocked).
- `tests/backend/clean_steps/` compile tests for `cast` and `first_row_header` (templates exist, untested).
- `tests/frontend/unit/app/` hydrate helper + `applyAllSafe` inserts derived and focuses output.
- Do not weaken existing `test_routes.py` default load pipeline.

---

## 4. Verdict

**SHAPE**

The orchestrator, default PROFILE + CLEAN, clean verb templates, Explore health card, kebab, and Knowledge run log already exist. F-pipeline is making that path actually structure the focused table (hydrate + scrape-typical profile signals), not a new product.

Not FIT: load CLEAN is a ghost write; suggestions miss header and type; kebab cannot reach `cast` / `first_row_header`; executor and templates lack tests; health chips are raw English.

Not ASK: locked slim already says transform / validate / type on the focused table, not a canvas, reuse `runPipeline` + `clean_steps` + `cleanVerbs`.

Not UNFIT: the job is Datly's existing clean loop. It does not need KNIME, Spark, or SQL as home.

Hard stop: do not invent a second orchestrator. Do not implement scrape ingest or a warehouse store in this job.

---

## 5. Risks / what the unified plan must not break

- **Second orchestrator.** Routing clean through `data_operations` or a scrape microservice splits run history and sandbox signing. Unified plan names `PipelineExecutor` + `compile_and_sign` only.
- **Ghost parquet / disk orphans.** CLEAN on load without hydrate leaves unused `*_trim_*` files. Hydrate without kebab lineage lets `dfSlice` unref-GC delete the structured table. Plan must reuse `insertDerivedTables` + focus.
- **Unexpected auto-tables.** Neighborhood already warned. Keep `auto_safe_only` on load. Do not auto-apply `cast`, `fill`, or `first_row_header`.
- **Trim fan-out.** Blanket string trim on every load is inefficient and noisy. Suggestions must be evidence-based before load CLEAN stays on.
- **Double-fire.** Health card `profileTable` after load PROFILE is extra I/O, acceptable. Do not call `runPipeline` again from F-scraper ingest. Do not fire load pipeline on gzip-only tables that F-scraper is supposed to stop using (neighbor).
- **F-scraper neighbor.** If scrape Load stays `CREATE_TABLE` raw gzip without `virtual` or without `connectorId`, this job never runs and refresh provenance dies. Plan must require scrape tables to take the same `loadTable` virtual branch as other loads.
- **F-warehouse neighbor.** Do not add a warehouse object. Session save already persists `derivedTables`. Hydrated CLEAN outputs must be in that list or they vanish on reopen.
- **F-clean-steps.** Do not ship a second applied-steps UI. Health + kebab now; rail later on the same grid.
- **PipelineRunsPanel.** Must stay a Knowledge footer log. Fail if it becomes the editor or a second Distill.
- **Distill / Play.** Do not implement executor `DERIVE` / `VISUALIZE` / `REPORT`. Do not hide Explore / Reports pills.
- **Encoding vs parquet types.** LLM `fetchFieldSemanticType` must keep running on load. Pipeline `cast` changes stored values. Do not replace semantic types with PROFILE dtypes.
- **Sandbox wall.** CLEAN stays signed templates. Do not send client Python. Do not whitelist `requests` in the sandbox.
- **SQL as home.** `analyze_table_statistics` may use DuckDB internally. Do not surface `/api/sql/query` as the pipeline.
- **Language first.** New issue chips and kebab labels go through `t()` en + zh. Prefer `issue.code` + params over interpolating English `issue.message`.
- **DISABLE_DATA_CONNECTORS.** Pipeline must still run on agent-loaded virtual tables when connectors are off.
- **i18n / error protocol.** New routes are not required. If errors grow, keep `AppError` + `json_ok` (HTTP 200 + `status: error` for validation).

---

## 6. Suggested chunks (ids only)

`C-pipe-hydrate`  
`C-pipe-suggest-types`  
`C-pipe-safe-verbs`  
`C-pipe-exec-tests`  
`C-pipe-kebab-types`  
`C-pipe-i18n-issues`

Already named (UI place, do not duplicate): `W-pipe-place`.

Do not spawn: `C-pipe-canvas`, `C-pipe-spark`, `C-pipe-sql`, `C-pipe-orchestrator`, `C-scrape-*`, `C-warehouse-*`.

First impl slice: `C-pipe-exec-tests` + `C-pipe-hydrate`. Suggestion and kebab type verbs follow once CLEAN is visible on the focused table.
