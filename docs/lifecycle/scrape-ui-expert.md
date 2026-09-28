# UI-expert: scrape → pipeline → warehouse (PLACE)

Feature: F-scraper (primary). F-pipeline and F-warehouse as place only.  
Role: ui-expert. Session: web + desktop. Same renderer. No product edits. Do not restyle.

Refs read: `docs/lifecycle/feature-ask-scraper.md`, `src/views/UnifiedDataUploadDialog.tsx` (`DataLoadMenu`, add-connection, `connector:${id}`), `src/views/DataFormulator.tsx` (landing ingest + `viewMode`), `src/views/DataSourceSidebar.tsx` (Sources / Sessions / Knowledge + `PipelineRunsPanel`), `src/views/VisualizationView.tsx` (`DataHealthCard` + `FreeDataViewFC`), `src/views/ColumnFilterPopover.tsx` (clean kebab), `src/views/DashboardView.tsx`, `src/components/IslandHeader.tsx` (Explore / Reports / Dashboard), `src/i18n/locales/en/upload.json`, `src/i18n/locales/en/pipeline.json`, `docs/lifecycle/waves/free-saas-ui-expert.md`.

Sacred order applied: workflow → nav → feature. Appearance last (reuse live chrome; no new palette).

---

## 1. Meaning

An analyst brings scraped site / API / file output into Datly as loadable tables, structures those tables with the existing transform and clean path, warehouses them as this project's workspace tables, then Distill / Play / charts as today.

Out of scope: KNIME node canvas, Spark, SQL as home, a crawler farm, a second Home grain or today dashboard, a fourth sidebar rail, a warehouse screen, UI leakage restyle, History / free-SaaS C-hist-* rebuild, Night theme, Stripe, live share.

---

## 2. Place / plug-in

No new route. No new Home tile. Load already owns ingest (`DataLoadMenu` on landing and in `UnifiedDataUploadDialog`). Orphan scrape studio is a fail.

| Job | Live plug-in | After |
|-----|----------------|-------|
| F-scraper create | Add-connection panel (`UploadTabType` `add-connection`): left loader list + `DataLoaderForm` | New loader type in that list (scrape / HTTP / HTML tables). Same form chrome as MySQL / S3 / local folder. Not a new dialog family. |
| F-scraper start (landing / in-session) | `DataLoadMenu` in `DataFormulator.tsx` (~847) and dialog menu tab | After an instance exists, it is a **connector card** in `connectionSources` (dot + name + `connectorDesc`). Do **not** add a fourth action next to Upload / Link folder / Connect databases. Those actions already own one-off file, folder, and "add a source." |
| F-scraper one-off | Data Loading Agent (`extract` tab, landing composer, `fetch_url`) | Keep. Ad-hoc URL / page extract stays chat. Persistent scrape is the connector. Two paths, one job. Do not add a second scrape home. |
| F-scraper browse / load tables | Sources tab catalog (`DataSourceSidebar`, rail DB icon) | Same row + tree as other connectors. Click connected row expands catalog; load / preview / batch import unchanged. Disconnected row opens `connector:${id}`. |
| F-scraper edit | Dialog tab `connector:${id}` + Sources gear (`SettingsOutlined` → `onOpenUploadDialog(\`connector:${id}\`)`) | Same `DataLoaderForm` view / edit / re-auth. Catalog stays in Sources. |
| F-pipeline structure | Explore focused table: `DataHealthCard` + `CleanSuggestionsPanel` above `FreeDataViewFC`; column kebab clean verbs in `ColumnFilterPopover` | That is the structure place. No Pipeline tab. No canvas. Knowledge `PipelineRunsPanel` stays a **run log**, not the editor. |
| F-warehouse later | Workspace tables in this session; reopen via landing History / Sessions (`F-workspace` SHAPE) | No warehouse object and no warehouse screen. Success is tables the analyst path already opens. |

Do not: `/scrape` page, Scrape rail icon, landing "Scrapers" section, Dashboard tiles for scrape counts, KNIME.

---

## 3. Approach

Extend existing ingest and table chrome. No new Home grain.

### Workflow (already live)

```text
Pick source (menu / agent / add-connection)
  → tables land in this workspace
  → structure on the focused table (health, suggestions, kebab, later F-clean-steps rail)
  → session persists those tables
  → Distill / Play / charts as today
```

Scrape is a source kind on step 1. Pipeline is step 3 on Explore. Warehouse is the session, not a fourth product.

### Nav (do not grow)

Primary places stay: landing (unsessioned) → workspace (Sources \| Sessions \| Knowledge) → Explore / Reports / Dashboard pills.

- Landing grain today: `DataLoadMenu` (ingest) + Demos + Your Sessions. Paused F-workspace SHAPE wants History + New project as the project grain. Scrape must stay **inside** `DataLoadMenu` / the upload dialog, not a sibling section that reprints History or ingest.
- Rail Add (+) already opens the upload dialog. Sources + already opens add-connection. Reuse both.
- Hosted `DISABLE_DATA_CONNECTORS`: scrape connector is gated like other connectors (`LocalInstallUpgradePanel`). Agent one-off still works. Do not fake a connected scrape card.

### Feature on that chrome

**F-scraper**

1. Register a loader type so add-connection lists it (`getConnectorIcon`, `CONNECTOR_TYPE_KEY_MAP`, `upload.connectorDesc.*`).
2. Create via existing `handleBeforeConnect` / persist connector.
3. Connected: `focusConnector` + Sources catalog (dialog already hands off this way).
4. Menu shows the instance as one card among connectors.
5. Optional: one agent suggestion that fills a scrape prompt. Hint only. Not a place.

**F-pipeline (place)**

Structure the scraped table on Explore, same as any loaded table:

- `DataHealthCard` profile + suggested fixes (`runPipeline` / `applyCleanVerb`).
- Column kebab: trim / fill / dedupe (`pipeline.grid`).
- Do not invent a steps rail here. F-clean-steps already owns a rail on this grid if it ships.
- `PipelineRunsPanel` under Knowledge: keep as "Auto pipeline runs" log. Do not move scrape edit there. Do not add a second runs list on Sources or Dashboard.

**F-warehouse (place)**

Persisted workspace tables + session reopen. Thread / `SourceTableShelf` is the in-session table list. Landing History / Sessions is later. Header Dashboard pill is pinned charts + schedule, not a warehouse.

### Chrome / tokens

Reuse MUI `Dialog`, `DataLoadMenu` cards, `StatusPill` / connected dot, `textVar` / `iconVar`, existing island header and sidebar. No new token set. No Tailwind. No second component library.

### P0 states (on the live places)

| State | Where | Behavior |
|-------|--------|----------|
| Empty connectors | DataLoadMenu / Sources | Existing add-connection / + menu. Scrape is a type inside add-connection, not an empty-state hero. |
| Empty scrape catalog | Sources | Same empty catalog copy as other sources. Why, not a fake table. |
| First table | Explore | Health card + grid. If profile fails, existing retry. |
| Disconnected scrape | Menu card + Sources row | Dot / `StatusPill` disconnected. Click opens `connector:${id}`. |
| Connectors disabled | Landing banner + add-connection upgrade panel | Honest. Agent path remains. |
| Loading / error | Existing connector list, catalog, health | Do not add a scrape toast family. |

### Do not

- New Home grain or landing Scrape tile.
- Fourth rail tab.
- KNIME / DAG canvas.
- Second today dashboard (do not put scrape counts on `DashboardView` or landing).
- SQL workbench as the scrape home.
- Merge Distill/Play into scrape.
- Restyle IslandHeader, logo, or loader (UI leakage campaign is paused).

---

## 4. Verdict draft: SHAPE

Place is lockable on live chrome. Slim is required.

- **SHAPE, not FIT:** No scrape loader type exists. Landing ingest is already `DataLoadMenu`; a silent Home tile would reprint that grain. Pipeline "studio" is not a missing screen (health + kebab exist); a new Pipeline nav would fight Explore and Knowledge. Warehouse is already the session.
- **Not ASK:** No IA rewrite if we refuse a new root and a canvas. Connector list + dialog + Sources + Explore table is enough.
- **Not UNFIT:** The job is load → clean → insights. That is Datly.

Logged slim: scrapers = connector family. Pipeline = Explore table chrome (plus existing Knowledge run log). Warehouse = workspace tables. Drop canvas, drop warehouse page, drop Home scrape tile.

---

## 5. Risks / what not to break

- **History (F-workspace):** Landing Your Sessions / upcoming History section is the project list. Do not add a Scrapers or Warehouses strip. Do not make New project open a scrape wizard. `DataLoadMenu` may stay as ingest; it must not become a second History.
- **Distill / Play:** Knowledge tab + `SessionDistill` + Explore/Reports pills. Do not hide pills. Do not replace Knowledge with pipeline runs. `PipelineRunsPanel` must stay a footer log, not a second Distill.
- **Language first:** New user-visible strings (`connectorDesc` for the loader, any menu hint, empty catalog why) go through `t()` in **en and zh at least**, and the other locale leaves when this ship touches `upload` / `pipeline` / `sidebar`. No hardcoded "Scrape" on cards.
- **Agent vs connector:** `fetch_url` already scrapes once. If the plan only adds a suggestion and no connector type, persistent warehouse-from-scrape is missing. If it adds a connector and also a landing tile, grain fails.
- **Dashboard pill:** `viewMode === 'dashboard'` is chart pin + cron. Scrape KPIs there are a second today dashboard.
- **F-clean-steps:** Do not ship a second applied-steps UI. Point structure at health + kebab now; rail later on the same grid.
- **DISABLE_DATA_CONNECTORS / hosted demo:** Connector scrape must not look connected when loaders are off.
- **Sessions vs Sources:** Scrape connector rows live in Sources. Session rows stay projects. Do not file scrapes under Sessions.

---

## 6. Suggested chunks (ids only)

- W-scrape-connect
- W-scrape-menu
- W-scrape-sources
- W-pipe-place
- W-wh-place

---

## 7. UI integrate

- **Home / nav change:** None. No new route, rail, or landing section. Add (+) and Sources + keep opening the upload dialog.
- **Grain row:**

| Place | Unique job | Must not reprint |
|-------|------------|------------------|
| Landing `DataLoadMenu` | Start ingest / agent | History, Distill, Play, warehouse list |
| Add-connection + `connector:${id}` | Create / edit a scrape source | Catalog tree, clean steps |
| Sources tab | Browse and load tables from connected sources (including scrape) | Landing History, Knowledge workflows |
| Explore focused table | Structure / clean this table | Dashboard tiles, Knowledge Distill |
| Knowledge | Distill / Play; pipeline **run log** only | Scrape form, table catalog |
| Sessions / landing History | Reopen the warehoused project | Connector list |

- **Existing widgets that already show this number:** Loaded tables (thread / grid). Link by focusing the table. Do not copy a table count onto Home or Dashboard.
- **New widget?** No. Connector card + catalog row + health card already exist.
- **Empty / first use:** User opens Add data → Connect databases (or Sources +) → picks the scrape loader → connects → Sources shows the row. First-run with no projects still uses landing ingest, not a scrape lobby. Empty scrape catalog uses the same Sources empty language plus why. Empty History stays F-workspace.
- **Where the user edits a scrape / pipeline row:** Scrape connector: dialog `connector:${id}` / Sources gear (`DataLoaderForm`). Pipeline step: Explore `DataHealthCard` suggestions and column kebab on the focused table (run list in Knowledge is not the editor). Warehouse row: there is no warehouse row; the user edits the **session** (landing History / Sessions rename) or the **table** (`SourceTableShelf` rename).
