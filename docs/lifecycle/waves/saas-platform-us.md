# W-us - Datly inventory vs lakehouse (DISPATCH-FALLBACK)

- **Status:** COMPLETE (Manager fallback). Wave 1 hosts not_found after compaction; no sidecar.
- **Date:** 2026-08-20

## Thesis from code

Datly (shipping name; Python `data_formulator`) is an AI visualization workspace. Analysts load tables into a per-user parquet workspace, chat with an AnalystAgent that runs Python/DuckDB in a sandbox, and encode charts. It is not a lakehouse, not a Spark runtime, and not Unity Catalog. A Databricks *loader* exists: Datly is a client of Databricks SQL warehouses.

Evidence: `docs/lifecycle/project-map.md`, `py-src/data_formulator/datalake/workspace.py`, `data_loader/databricks_data_loader.py`.

## Data plane

| Piece | What it is | Evidence |
|-------|------------|----------|
| Workspace | Per-identity directory + parquet + workspace.yaml | `datalake/workspace.py` |
| Query engine | In-memory DuckDB views over parquet | `agents/agent_utils_sql.py` |
| Import cap | `MAX_IMPORT_ROWS = 2_000_000` then local parquet | `data_loader/external_data_loader.py` |
| Preview | Agent preview 50 rows | `routes/agents.py` PREVIEW_ROW_LIMIT |
| Sandbox | Local Python sandbox (Docker optional) | `sandbox/` |
| Azure blob workspace | Optional remote workspace backend | `datalake/azure_blob_workspace.py` |

There is no cluster, SQL warehouse of our own, Lakeflow/Jobs scheduler, Delta Lake table format, or Photon. Compute is the Flask process plus DuckDB plus the user's LLM.

## Connectors (built-in registry)

`data_loader/__init__.py` `_LOADER_SPECS`: mysql, clickhouse, mssql, postgresql, kusto, **databricks**, s3, azure_blob, mongodb, cosmosdb, bigquery, athena, superset, local_folder, sample_datasets. Plugins only in local single-user mode.

Databricks loader: PAT (OAuth U2M TODO), browses Unity Catalog `catalog.schema.table`, fetches Arrow into Datly. Hidden system catalogs. Max browse 10 catalogs / 500 tables. This is **connect-to-Databricks**, not Datly-is-Databricks.

## Catalog / collab / auth

- Catalog cache for connected sources: `datalake/catalog_cache.py`
- Sessions: local disk / Flask session, not live CRDT share
- Auth: OIDC/GitHub/EasyAuth config-gated; password store + CSRF landed in F-auth Phase A; hosted required-login not Done
- Billing: sibling `Datly - Web` (portal SHAPE). Stripe not in Flask
- SQL UI: none as home. Agent uses DuckDB SQL inside Python. F-sql is a planned drawer
- Workflows: `agent_workflow_distill` + knowledge replay. Not KNIME

## Module class

| Module | Class | Platform gap |
|--------|-------|--------------|
| Analyst chat | live | Runs on copied parquet, not warehouse compute |
| Connectors | live (Databricks OAuth TODO) | Import-then-analyze, not query-in-place |
| Charts / shelf | live | Fine for the analysis layer |
| Reports | live | Share document, not live data share |
| Knowledge / distill | live | Session knowledge, not org catalog |
| DuckDB parquet | live | Caps at import; not lakehouse storage |
| Auth / tenancy | partial | SaaS wrapping in progress |
| Jobs / streaming / Unity | missing | Not this product's storage plane |
