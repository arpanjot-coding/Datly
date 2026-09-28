# W-rivals - Databricks-class platforms (DISPATCH-FALLBACK)

- **Status:** COMPLETE (Manager fallback + live web 2026-08-20)

## Databricks (named)

Sources:

- https://www.databricks.com/product/databricks-lakehouse
- https://www.databricks.com/product/data-lakehouse
- https://www.databricks.com/product/unity-catalog
- https://www.databricks.com/product/delta-sharing
- https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior

What "like Databricks" means as a **solution** (not a notebook tool):

1. Lakehouse storage (Delta) so lake + warehouse are one copy
2. Elastic compute (SQL warehouse / clusters). Serverless start 2-6s; classic/pro ~4 min
3. Unity Catalog: grants, lineage, one namespace `catalog.schema.table`
4. Lakeflow Jobs / DLT-style pipelines
5. Delta Sharing of live tables
6. AI/BI Genie: NL on governed data
7. Separate account console vs analysis UI
8. Usage-based DBU billing

Flow: land data -> govern -> compute -> analyze / BI / AI -> share -> pay.

## Snowflake

Focus: cloud SQL warehouse, roles, sharing, Cortex AI expanding. Easier SQL analytics; weaker as Spark/ML platform. Account console separate from worksheets. Sources: comparison roundups 2026 (Kanerika, Fabric community blog).

## Microsoft Fabric

Unified Microsoft analytics: OneLake, Spark, SQL, Power BI in one SaaS. Best if already M365. Source: https://www.flexera.com/blog/finops/microsoft-fabric-vs-databricks/

r/dataengineering 2026: Microsoft shop -> Fabric; AI/ML heavy -> Databricks; warehouse -> Snowflake. Many run two.

## Hex (contrast)

https://hex.tech/ : "Built for the warehouse." Connects to Snowflake/Databricks/BigQuery. **Nothing has to move; existing permissions carry over.** Hex is the analysis workspace **on** the lakehouse, not the lakehouse.

Datly is closer to Hex's *job* (AI analysis workspace) than to Databricks' *job* (store + compute + govern the data). The user still asked for a **solution** for easy big data, which means Datly must stop pretending copied parquet is the platform.

## Capability they have

| Capability | Databricks | Snowflake | Fabric | Hex |
|------------|------------|-----------|--------|-----|
| Lakehouse / managed tables | yes Delta | yes (Iceberg/unistore path) | yes OneLake | no (uses theirs) |
| Elastic compute | SQL warehouse + clusters | warehouses | Spark/SQL | no (theirs) |
| Catalog + grants | Unity | RBAC + Horizon | OneLake/Purview | inherit warehouse |
| SQL editor | yes home | yes home | yes | cells |
| Notebooks | yes | Snowpark notebooks | yes | yes (product) |
| AI assistant | Genie / Assistant | Cortex | Copilot | Notebook Agent |
| Jobs / pipelines | Lakeflow | Tasks / dynamic tables | Data Factory/pipelines | scheduled runs |
| Sharing | Delta Sharing | Secure Data Sharing | sharing | published apps |
| SSO / SCIM | yes | yes | Entra | yes |
| Account vs analysis UI | yes | yes | admin portal | yes |
| Cost metering | DBU + system tables | credits | F2/CU | seat + warehouse bill |
| Streaming | DLT / RT | Snowpipe | eventstreams | no |
| BI dashboards | AI/BI | Streamlit/Snowsight | Power BI | apps |
