# Feature ask - scrape to warehouse (current)

- **Verbatim:** I think we should also focus on a feature that we can integrate data scrapers which can bring the data in the app which the user can clean get the insights and actually make that scraped data usable and structure it with the help of the pipeline which we are going to make. Should be strong and efficient and accurate to help to warehouse that scraped data to use for ....
- **Lane:** BUILD
- **Session:** web, desktop (ship targets; last S was desktop)
- **Paused:** UI leakage campaign (REPORT). F-workspace-W DRAFT. docs/lifecycle/feature-ask.md (free SaaS) stays paused.

## Ask

| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Ingest scraper output into Datly as loadable tables | F-scraper | maybe (connector row) | DataLoadMenu, UnifiedDataUploadDialog, connectors |
| 2 | Structure scraped tables with an accurate transform pipeline | F-pipeline | maybe | clean steps, encoding, grid |
| 3 | Warehouse structured scrape results for later clean + insights | F-warehouse | no if workspace tables | workspace, sessions, analyst |

## Meaning (draft)

- **User job:** Bring scraped data into Datly, run it through a strong accurate pipeline so it becomes clean structured tables, warehouse those tables, then clean and get insights with the existing analyst loop.
- **Who:** An analyst who already scrapes (or will scrape) sites, APIs, or files and needs that data inside Datly, not in a second ETL app.
- **Entry → steps → success:** Pick a scrape / ingest source → data lands as tables → pipeline structures and validates → warehouse save → user cleans and Distill / Play / charts as today.
- **What we are not building:** KNIME node canvas, Spark cluster, SQL as home, a generic web-crawler farm, a second product, live share, Stripe.
- **Assumptions (labeled):**
  - Pipeline means transform / validate / type steps, not a visual node studio.
  - Warehouse means persisted workspace tables the existing load + analyst path can open.
  - Scrapers are a connector family (bring data in), not a new Home grain.
  - "Use for ...." means the existing insight job (clean, Distill, Play, charts). Confirm if they meant a different downstream.

## Out of scope (this ask)

UI leakage redesign. History / free SaaS C-hist-*. Night theme. KNIME / Spark / SQL-as-home.

## Sacred

Language first. Distill / Play stay. No KNIME. No Spark. No SQL as home. Reuse F-connectors, F-clean-steps, F-workspace if FIT. Silent second Home tile is a fail.
