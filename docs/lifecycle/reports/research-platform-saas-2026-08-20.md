# Report - Datly as a big-data SaaS solution (not a viz tool)

- **Kind:** R
- **Lane:** REPORT
- **Created:** 2026-08-20
- **Mode:** research
- **Triggered by:** "analyse … what agents are doing what features a SAAS solution might need we are not making a tool we are making a solution like making easy working with big data like databrick"
- **Wave 1:** DISPATCH-FALLBACK. Hosts `01a01e10-*` not_found after compaction; no named files. Manager merged code inventory + live web. Inputs: `docs/lifecycle/waves/saas-platform-us.md`, `saas-platform-agents.md`, `saas-platform-rivals.md`, `saas-platform-demand.md`.
- **Do not implement** until the user names IDs (or `all` / `P0`).

## Status board

| ID | Item | Severity | Include | Status |
|----|------|----------|---------|--------|
| PLAT-00 | Category correction: analysis workspace on warehouses, not a second Databricks | P0 | yes (decision) | PENDING |
| PLAT-01 | Query-in-place / bounded load (stop copy-as-the-platform) | P0 | yes | PENDING |
| PLAT-02 | Catalog-first browse without ingest | P0 | yes | PENDING |
| PLAT-03 | Connector read vs write ACL | P0 | yes | PENDING |
| PLAT-04 | SQL sanity guard + read-only default | P0 | yes | PENDING |
| PLAT-05 | Hosted accounts (signup, login, logout) | P0 | yes | PENDING |
| PLAT-06 | Workspace history + live share | P0 | yes | PENDING |
| PLAT-07 | Chat workflow replay on a chosen database | P0 | yes | PENDING |
| PLAT-08 | Keep AnalystAgent as the way people work (no notebooks) | P0 | yes (keep) | PENDING |
| PLAT-09 | Billing / usage / enterprise portal (Datly-Web) | P1 | yes | PENDING |
| PLAT-10 | Query and LLM usage metering | P1 | yes | PENDING |
| PLAT-11 | SQL analysis drawer (not home) | P1 | later | PENDING |
| PLAT-12 | Long-context graph for agent tokens | P2 | later | PENDING |
| PLAT-13 | Scheduled refresh / jobs | P2 | later | PENDING |
| SKIP-01 | Host Spark / Datly-owned clusters | - | no | DEFERRED |
| SKIP-02 | Notebook cells as home | - | no | DEFERRED |
| SKIP-03 | KNIME / node canvas | - | no | DEFERRED |
| SKIP-04 | SQL workbench as home | - | no | DEFERRED |
| SKIP-05 | Second chart app on the portal | - | no | DEFERRED |
| SKIP-06 | Clone Unity Catalog / Delta storage | - | no | DEFERRED |
| DEFER-UI | Header chrome, model-card, cicada leftover | - | later | DEFERRED |

## Summary

Datly is already a strong **analysis solution**: connect many sources, land a bounded parquet workspace, let an analyst agent chart and report. It is not a **lakehouse**. "Like Databricks" in the market means store + elastic compute + Unity Catalog + jobs + sharing + a billing console. Cloning that would make Datly a worse Databricks. The winning SaaS shape is the Hex-class job on the customer's warehouse: nothing has to move, grants carry over, the agent does the hard work, read-only by default, no cluster babysitting. Product LLM agents today only analyze tables **already copied** into the workspace (AnalystAgent core skill says so). Software Bus agents this week were building login, a billing site, and chrome. Those are real SaaS pieces. They are not the data plane. P0 is query-in-place + catalog + ACL + guard + hosted identity + share + workflow-on-db, with the analyst agent kept as the UX.

## 1. What "like Databricks" means

Official lakehouse page: unify BI, AI, ETL, streaming; Unity Catalog; Lakeflow Jobs; Delta Sharing; serverless SQL; usage billing.
https://www.databricks.com/product/databricks-lakehouse

| Layer | Databricks ships | Datly today |
|-------|------------------|-------------|
| Storage | Delta lakehouse | Local/blob parquet after import (`MAX_IMPORT_ROWS` 2e6) |
| Compute | SQL warehouse / clusters (serverless 2-6s, classic ~4 min) | Flask process + DuckDB `:memory:` views |
| Governance | Unity Catalog grants | Per-user folder; F-data-acl not shipped |
| Work | Notebooks + SQL editor + Genie | Encoding shelf + AnalystAgent + threads |
| Orchestrate | Lakeflow | Distill/replay in knowledge (session) |
| Share | Delta Sharing + dashboards | Report export; no live table share |
| Pay | DBU account console | Datly-Web portal planned, not live |

Snowflake is the SQL-warehouse twin. Fabric is the Microsoft one-stop. Hex is explicit: **built for the warehouse, data does not move** (https://hex.tech/). Datly's Databricks loader already talks to a SQL warehouse and Unity namespace. That is the correct dependency direction.

**Locked shape (do not silently change):** SQL is a drawer not home (`D-sql-drawer`). Portal is not a second analysis app (`D-portal-separate`). No KNIME canvas. Language before paywall. No Stripe inside Flask/DuckDB.

**New recommended lock if you pick PLAT-00:** Datly does not host Spark. Datly makes the customer's warehouse easy to work with.

## 2. What product agents do

User-facing loop: **AnalystAgent** (`/api/agent/analyst-streaming`).

| Skill | Tools / actions | Job |
|-------|-----------------|-----|
| core (always on) | execute_python_script, inspect_source_data, visualize, ask_user | Chart and answer on **loaded** parquet. DuckDB allowed when the table is large. No network, no `os`. |
| data-loading | list/find/describe/probe, list_connectors, propose_connection, propose_data_operation | Discover sources. User must confirm load. **Do not generate source SQL.** |
| report | inspect_chart, write_report | Markdown report with `chart://` embeds |

Helpers (not the product): data_load types, data_loading_chat, nl-to-filter, sort, starter questions, chart restyle, code explanation, workspace name, workflow_distill. Language injection is i18n, not analytics.

**Gap in one sentence:** agents help you work with a **sample you imported**. They do not yet run the analysis on the big table where it lives.

## 3. What Software Bus agents were doing

| Bus tag | Recent assignment | Fits a big-data **solution**? |
|---------|-------------------|------------------------------|
| [impl] C-auth-user-store / session | Password + CSRF + migrate | Yes, hosted SaaS identity |
| [impl] C-auth-screens | Login UI (paused) | Yes, wrapping |
| [impl] C-bill-scaffold | Datly-Web Vite shell (CHILD-KILL this beat) | Yes, account console, not data plane |
| [impl] C-wf-sheet | Replay-on-db sheet (CHILD-KILL) | Yes, data-plane adjacent |
| [ui/be/security] F-saas-W | Accounts, share, portal, SQL drawer | Wrapping + safety. Did not add compute |
| [explore/research] this report | Platform vs tool | This file |
| Leftover chrome (header, loader, models) | Visual tool polish | Not the solution P0 |

The bus was not idle. It was solving **professional hosted app**. The user correction is: the app must also be how people **work with large data**, which the wrapping does not provide.

## 4. Demand (why not clone Databricks)

- People cannot explain Databricks without a course (r/dataengineering ELI5).
- DBU + idle warehouses scare leadership. Classic start ~4 minutes causes teams to leave compute on (Revefi 2026; Reddit SQL warehouse cost thread).
- Cluster start can stick on "Delayed" (Databricks Community 2026-06).
- Governance is wanted and also too heavy for a 30-person shop.
- Winning thinner product: NL on **their** warehouse, inherit permissions, no migration, no cluster UI, read-only default, share a report not a kernel.

## 5. Compare → include

| Capability | They | We | Users want | Include | Why |
|------------|------|----|------------|---------|-----|
| Hosted lakehouse storage | Databricks, Fabric, Snowflake | parquet workspace | Platform teams | **no** | We connect; we do not become Spark/Delta |
| Elastic compute we operate | SQL warehouse | in-process DuckDB | Mixed; they hate waiting | **no** | Use theirs; skip SKIP-01 |
| Query-in-place / federation | Lakehouse Federation, Hex native | Import then DuckDB | Yes, loudly | **yes PLAT-01** | This is "easy big data" |
| Catalog browse | Unity, Snowflake, Hex browser | catalog_cache + loaders | Yes | **yes PLAT-02** | Honest connectors |
| Grants read vs write | Unity / RBAC | missing | Yes + user ask | **yes PLAT-03** | F-data-acl |
| SQL guard / no destroy | warehouse RBAC | missing | Yes + user ask | **yes PLAT-04** | F-sql-guard |
| AI analyst on data | Genie, Hex agent, Cortex | AnalystAgent live | Yes | **yes PLAT-08 keep** | Differentiator |
| Notebooks | Databricks, Hex, Fabric | no | Mixed; many hate state | **no** | Threads already |
| SQL as home | Databricks SQL, Snowflake | no | Subset | **later PLAT-11** | Drawer only |
| Live workspace share | Hex, Databricks | local sessions | Teams | **yes PLAT-06** | F-workspace |
| Chat workflow on DB | weak elsewhere | distill exists | User ask | **yes PLAT-07** | F-workflow-db |
| Jobs / streaming | Lakeflow, DLT | no | Engineers | **later PLAT-13** | Not first hire |
| Identity SSO + password | all SaaS | OIDC + password store partial | Yes | **yes PLAT-05** | F-auth |
| Account / billing console | all SaaS | Datly-Web empty/scaffold | Finance | **yes PLAT-09** | F-billing, portal only |
| Usage metering | DBU, credits | no | Leadership | **yes PLAT-10** | Else hosted is a cost surprise |
| Org Unity clone | Databricks | browse only | Enterprise | **no SKIP-06** | Inherit source catalog |
| Node wrangling | KNIME, Alteryx | no | Prep shops | **no** | Locked skip |

## 6. Agent ownership (who does what if you pick IDs)

Two layers stay distinct. Product agents **run in the app**. Bus agents **build the app**.

| ID | Product agent that will use it | Bus tags to implement | Reuse |
|----|--------------------------------|------------------------|-------|
| PLAT-00 | n/a (lock) | Manager decision record only | `docs/lifecycle/decisions.md` |
| PLAT-01 | Analyst core + data-loading (allow source SQL/pushdown under guard) | `[arch-expert]` then `[be-expert]` `[impl]` | `probe_data`, loaders, `agent_utils_sql.py` |
| PLAT-02 | data-loading `list_data` / `find_data` | `[ui-expert]` catalog pane `[be-expert]` cache | DataSourceSidebar, catalog_cache |
| PLAT-03 | data-loading propose_connection | `[security-expert]` `[be-expert]` | F-data-acl, connector params |
| PLAT-04 | any SQL/Python commit | `[security-expert]` `[be-expert]` | F-sql-guard, sandbox, path-safety |
| PLAT-05 | none (gate) | `[ui-expert]` `[be-expert]` `[security-expert]` | F-auth (store already on disk) |
| PLAT-06 | none (session) | `[ui-expert]` `[be-expert]` | F-workspace, sessions |
| PLAT-07 | workflow_distill + analyst replay | `[ui-expert]` `[be-expert]` | F-workflow-db-W ACCEPTED |
| PLAT-08 | AnalystAgent | no new impl; do not replace with cells | `analyst/agent.py` |
| PLAT-09 | none | `[impl]` in Datly-Web | F-billing-W |
| PLAT-10 | analyst + loaders emit usage events | `[be-expert]` portal UI | sessions, model_registry |
| PLAT-11 | none (user SQL) | `[ui-expert]` drawer | F-sql SHAPE |
| PLAT-12 | analyst context | `[be-expert]` | F-context-graph |
| PLAT-13 | data-loading schedule | later `[be-expert]` | not now |

Chrome leftovers (F-header-chrome, F-model-card, F-cicada-ui) stay **DEFERRED** relative to this solution report. They do not make big data easier.

## 7. Flows

### Primary (solution we should hire for)

1. Sign in (after language). Land on last workspace or connect.
2. Browse the customer's warehouse catalog. Do not copy the lake.
3. Ask in language. Agent probes or pushdown-aggregates. User confirms any load over a bound.
4. Chart on the encoding shelf. Thread is the audit trail.
5. Optional: distill workflow, replay on another catalog/table.
6. Share the workspace or export a report. Writes back to the source stay denied unless ACL says write.
7. Admins see seats and usage on Datly-Web, not on the canvas.

### Secondary (later)

SQL drawer on current DuckDB/views. Scheduled refresh of a saved probe.

### Do not hire

Spin Datly clusters. Design a star schema in Unity. Draw a 30-node wrangler. Publish a Hex-style app store. Make SQL the home screen.

## 8. Already-tracked F-ids vs this report

| Existing F-id | Maps to | Keep in run if user says P0? |
|---------------|---------|------------------------------|
| F-auth | PLAT-05 | yes |
| F-workspace | PLAT-06 | yes |
| F-data-acl | PLAT-03 | yes |
| F-sql-guard | PLAT-04 | yes |
| F-workflow-db | PLAT-07 | yes |
| F-billing | PLAT-09 | P1 (yes if hosted) |
| F-sql | PLAT-11 | later |
| F-context-graph | PLAT-12 | later |
| F-data-ide / clean-grid / ide-desktop | tool chrome | only if you still want the IDE report |
| (new) | PLAT-01, PLAT-02, PLAT-10 | **new jobs**, not in F-saas-W |

## Findings (dedup)

| ID | Severity | Area | Summary | Evidence | Status |
|----|----------|------|---------|----------|--------|
| PLAT-00 | P0 | product | We are the analysis solution on big data, not a lakehouse clone | User ask + Hex vs Databricks split | PENDING |
| PLAT-01 | P0 | data plane | Analysis copies into parquet (2M cap). Big data stays behind a loader | `MAX_IMPORT_ROWS`, Analyst core SKILL.md | PENDING |
| PLAT-02 | P0 | catalog | Browse exists for loaders; not the daily home vs ingest | `catalog_cache`, DataSourceSidebar | PENDING |
| PLAT-03 | P0 | security | No workspace-level read/write on connectors | F-data-acl not_started | PENDING |
| PLAT-04 | P0 | security | No SQL/Python destroy guard on sources | User ask; sandbox forbids os but loaders can write if asked | PENDING |
| PLAT-05 | P0 | saas | Hosted identity incomplete (store yes, screens/gate no) | F-auth | PENDING |
| PLAT-06 | P0 | saas | History/share not live | F-workspace | PENDING |
| PLAT-07 | P0 | workflow | Distill exists; run-on-db not shipped | F-workflow-db-W; CHILD-KILL sheet | PENDING |
| PLAT-08 | P0 | agent | Keep AnalystAgent; do not add notebooks | `analyst/agent.py`; demand vs Jupyter | PENDING |
| PLAT-09 | P1 | portal | Need account console separate from canvas | D-portal-separate; Datly-Web | PENDING |
| PLAT-10 | P1 | portal | No query/LLM metering | Databricks DBU pain | PENDING |
| PLAT-11 | P1 | sql | Drawer only | D-sql-drawer | PENDING |
| PLAT-12 | P2 | agent | Context graph | F-context-graph | PENDING |
| PLAT-13 | P2 | jobs | Schedule later | Lakeflow comparison | PENDING |

## Notes

- In scope: category, agents, SaaS feature set vs Databricks-class.
- Not run: live Databricks cluster, Stripe, UI capture, plan-check, [impl].
- Prior lite SaaS research (`reports/research-saas-2026-08-20.md`) covered login/portal only. This file supersedes it for **what the product is**.
- Prior IDE research (`product-research.md`) still holds for chrome (grid, panes). Lakehouse compute was already **no** there (IDE-22). This report keeps that no, and adds query-in-place as the missing yes.
- Confidence: high on Datly inventory (code). High on Databricks/Hex official pages. Medium on Fabric/Snowflake (roundups, not every product page).
- Locks unchanged until you pick PLAT-00.
