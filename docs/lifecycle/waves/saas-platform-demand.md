# W-demand - easy big-data SaaS (DISPATCH-FALLBACK)

- **Status:** COMPLETE (Manager fallback + live web 2026-08-20)

## Who hires what

| Buyer | Hires Databricks/Snowflake/Fabric for | Would hire a thinner Datly-like solution for |
|-------|----------------------------------------|-----------------------------------------------|
| Data engineer | Pipelines, Spark, jobs, catalogs | Rarely as the store |
| Analytics engineer | SQL warehouse + dbt | Query-in-place + agent that writes SQL/Python |
| Analyst / researcher | Often blocked by warehouse UX | Load or connect, ask, chart, report |
| IT / admin | SSO, grants, billing, DLP | Seats, usage, read-only default |
| Small team (~30) | Often overkill (Reddit "do I need a SQL warehouse") | Connect existing warehouse, do not migrate |

## Asks and pains

| Ask / pain | Source | Weight | Implied job |
|------------|--------|--------|-------------|
| Databricks is confusing; "what even is it" | https://www.reddit.com/r/dataengineering/comments/13qg3t1/why_can_i_not_understand_what_databricks_is_can/ | High (durable ELI5 thread) | Solution should hide clusters |
| Cost / DBU; idle warehouses; leadership sticker shock | https://www.reddit.com/r/dataengineering/comments/1c42ckw/databricks_sql_warehouse_is_too_expensive_for/ plus Cloudforecast 2026 pricing guide | High | Meter queries; do not host idle clusters |
| Classic warehouse start ~4 min; leave it on to avoid wait | https://www.revefi.com/blog/databricks-pricing-guide | High | No cluster babysitting |
| Cluster Start-up Delayed stuck | https://community.databricks.com/t5/data-engineering/sql-warehouse-stuck-on-quot-cluster-start-up-delayed-quot/td-p/158236 | Medium (support, 2026-06) | Instant analyze on already-on warehouse |
| Unity / governance valuable but heavy | r/dataengineering Unity threads; "don't overlook governance" in how-good-is-Databricks | Mixed | Inherit source grants; do not invent a second catalog |
| Want NL on actual warehouse data, not a copy | Hex site: permissions carry over, nothing moves | High (product+demand) | Query-in-place |
| Share answers with non-engineers | Hex apps/Threads; Databricks Genie | High | Reports + safe share, not a kernel |
| Fear of destroying data | Category + prior user SQL-guard ask | High for SaaS | Read-only default, SQL guard |
| Do not migrate off Snowflake/Databricks | Federation / Hex native connect | High | Connect, do not replace the lakehouse |
| Notebook hidden state hate | Prior IDE research (Joel Grus HN) | High | Keep threads, skip notebooks |

## What would make a smaller solution win

1. Sit on the customer's warehouse (Databricks, Snowflake, BigQuery, Postgres). Do not become Spark.
2. Bounded preview + pushdown aggregate. Do not copy 2 million rows as the "big data" story.
3. Agent that writes the SQL/Python the analyst would have written, with an inspectable trail.
4. Governed read-only by default. Writes are explicit and rare.
5. No cluster UI. If the warehouse is asleep, say so; do not start Datly-owned VMs.
6. Chat-to-workflow replay on the same connector (already F-workflow-db).
7. Separate billing/usage portal so finance is not inside the canvas.
