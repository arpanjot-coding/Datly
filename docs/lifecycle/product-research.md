# Product Research - Datly data IDE

Status: COMPLETE  
Date: 2026-08-19  
Kind: REPORT (do not implement)  
Scope: What a professional data IDE is, what closest rivals ship, what users demand, and what Datly should include, delay, or skip.

Shipping name in product is Data Formulator. Lifecycle name is Datly. This report uses Datly for the product under review and Data Formulator when citing Microsoft Research or GitHub.

## Research seeds

- User: make this a professional data IDE (coding IDE analogue for data). Plan improvements. More user-friendly. Desktop session.
- Category: data IDE, analytics workbench, notebook IDE, BI desktop, SQL IDE, wrangling tool.
- Given product: AI viz workspace. Load tables (files, DBs, cloud), analyst agent chat, interactive charts (encoding shelf), Tiptap reports, knowledge panel, 15+ connectors, optional SSO, desktop pywebview, IndexedDB/session save, CSV/zip/PNG/PDF export. Dual UI (MUI + tokens + Sass). Model-select wall before work. Not a SQL IDE, not a notebook, not git projects, not a command palette. Locales en+zh.
- Project map already marks "professional data-IDE chrome" as Later (F9) until Kind R IDs are named. This file names those IDs. It does not ship them.

Rivals used (6, mixed notebooks + SQL IDEs + BI + wrangling):

1. Hex (closest AI analytics notebook workspace)
2. JupyterLab + Positron / Posit (data science IDE chrome)
3. Databricks notebooks + SQL editor + Assistant
4. Count canvas, with Observable as the viz-notebook sibling
5. DataGrip + DBeaver (SQL IDE / schema + results grid)
6. Tableau Desktop + Power BI Desktop (BI desktop encoding)

KNIME Analytics Platform and Alteryx Designer are cited as the wrangling-desktop contrast, not as a seventh peer.

## Overview

A professional data IDE is the daily driver where an analyst spends hours, not a dashboard they visit. Coding IDEs (VS Code, JetBrains) made that job feel serious through panes, keyboard, inspectors, and a results loop you can trust. Data work has the same job, with different objects: tables, schemas, queries or transforms, result grids, charts, and a trail of how you got there.

The category is not one product. It is four overlapping jobs that people keep trying to fuse:

| Cluster | Daily object | Typical tools | Failure mode |
| --- | --- | --- | --- |
| Notebook workbench | Cells of SQL/Python + output | Hex, JupyterLab, Databricks, Observable | Hidden state, hard to share, linear scroll |
| SQL IDE | Schema tree + query + result grid | DataGrip, DBeaver | No chart narrative, no analysis memory |
| BI desktop | Field list + shelves + canvas | Tableau Desktop, Power BI Desktop | Weak ad-hoc transform, model-first tax |
| Wrangling desktop | Node canvas + reusable flows | KNIME, Alteryx Designer | Heavy, not viz-first, not agent-first |

Datly already sits in a fifth cluster that Microsoft Research named: concept encoding plus agent, with data threads instead of cells. Official product: encoding shelf, data view, data threads, and LLM-generated transforms, not a notebook. Sources: [MSR Data Formulator blog](https://www.microsoft.com/en-us/research/blog/data-formulator-exploring-how-ai-can-help-analysts-create-rich-data-visualizations/), [GitHub microsoft/data-formulator](https://github.com/microsoft/data-formulator), [data-formulator.ai](https://data-formulator.ai/).

That is closer to Tableau's shelves plus a sidecar agent than to Jupyter or DataGrip. "Make it a professional data IDE" therefore means: give the existing job IDE-grade chrome (panes, grid, schema, keyboard, session), not replace the job with cells or a SQL workbench.

Count's buyer guide is useful as a category definition, even though Count is a rival. Modern data notebooks share: code-first cells, SQL + Python + viz + filter cells, cell references, and narration. Teams adopt them to stop chopping work across a SQL IDE, a viz tool, and slides. They fail when notebooks get long, when non-analysts cannot follow them, and when they become fake dashboards. Source: [Count, A data notebook buyer's guide](https://count.co/blog/a-data-notebook-buyers-guide).

Hex's own FAQ is the other pole: one workspace for deep analysis, conversational self-serve, and published apps, on shared context. Source: [hex.tech](https://hex.tech/). Datly should not chase that whole platform. It should steal the parts that make a single analyst faster on the current job.

## JTBD

Job format: When [situation], I want to [action], so I can [outcome].

| ID | Job | Who | Frequency | Current Datly fit |
| --- | --- | --- | --- | --- |
| J1 | When I sit down with a file or warehouse table, I want to see columns, types, and a sample in one glance, so I know if I loaded the right thing. | Analyst, researcher | Every session | Partial: DataView + sidebar exist. Weak vs Positron Data Explorer / DBeaver grid. |
| J2 | When a question is messy, I want to ask in language and also drag fields, so I stay in control of the chart. | Analyst | Every session | Strong: encoding shelf + agent + threads (MSR design). |
| J3 | When I transform data, I want to see the derived table and go back a step, so I do not lose the path. | Analyst | Every session | Strong conceptually (data threads). Weak as IDE chrome (no first-class undo stack, no grid profile). |
| J4 | When I live in the app for hours, I want panes, shortcuts, and a session that comes back, so it feels like a tool I own. | Desktop user | Daily | Weak: desktop exists, model wall first, no documented keymap, no dockable IDE layout. |
| J5 | When I share, I want a report or export, not "run my notebook." | Analyst to stakeholder | Per analysis | Partial: Tiptap reports + PNG/PDF/CSV/zip. Not a published app. |
| J6 | When I write SQL all day, I want schema-aware complete, explain, and a result grid. | Analytics engineer | Daily | Out of product identity. Connectors exist. No SQL IDE. |
| J7 | When I productionize, I want git, tests, and modules, not cells. | Data scientist / engineer | Weekly | Explicitly not Datly. Users already leave notebooks for `.py` + VS Code. |
| J8 | When I wrangle 12 dirty sources, I want a repeatable visual flow. | Ops / citizen analyst | Recurring | KNIME/Alteryx job. Not Datly. |

Primary hire for Datly: J1 + J2 + J3 + J4 + J5. Do not hire for J6 to J8.

## Competitor notes

### Hex

URLs:

- [hex.tech](https://hex.tech/)
- [hex.tech/product/notebooks](https://hex.tech/product/notebooks/)
- [AI in Hex](https://learn.hex.tech/docs/getting-started/ai-overview)
- [Notebook Agent launch](https://hex.tech/blog/introducing-notebook-agent/)
- Hands-on review: [selectfromwhereand.com Hex review](https://selectfromwhereand.com/posts/hex_review/) (2026-04-04)
- G2 listing (page JS-blocked here; vendor cites it): [g2.com/products/hex-tech-hex/reviews](https://www.g2.com/products/hex-tech-hex/reviews)
- Reddit: [r/dataengineering Hex or Deepnote](https://old.reddit.com/r/dataengineering/comments/14ohd98/is_anyone_here_using_hex_or_deepnote/)

What they have:

- Agentic notebook: SQL, Python, R, no-code (table, pivot, filter), chart, map, single-value cells.
- First-class SQL editor inside the notebook: Jinja, dbt, schema browser, typeahead, highlighting.
- Graph / DAG execution (closer to Marimo than classic Jupyter).
- Notebook Agent sidecar: generate and edit Python, SQL, Markdown, Pivot, Chart cells. Schema-aware.
- Threads for non-technical self-serve. Chat with published apps. Modeling Agent. Context Studio (rules, semantic models, endorsements, observability).
- Publish as data apps. GitHub/GitLab export. Airflow/Dagster/Prefect. Warehouse OAuth. Slack / MCP.
- DuckDB for uploaded files. Pushdown to warehouse for scale. Instance sizes from 8 GB up.

Flow: log in, open project, SQL or agent, cells as DAG, publish app or share thread.

What to notice for Datly: the agent sidecar next to an inspectable artifact is the overlap. The rest is a collaborative notebook platform. Hex users on Reddit like apps-as-links when BI is not enough. They also flag ToS / data-use language as a reason large companies stall (2023 thread; treat as dated, still a demand signal for local/desktop trust). Independent review: dense UI, every square inch packed, project status/category needed or 20 people drown, notebooks still a footgun if people ignore dbt/versioning.

### JupyterLab and Positron (Posit)

URLs:

- [JupyterLab interface](https://jupyterlab.readthedocs.io/en/stable/user/interface.html)
- [posit.co/products/ide/positron](https://posit.co/products/ide/positron)
- [A quick tour of Positron](https://posit.co/blog/a-quick-tour-of-positron)
- [Positron Data Explorer](https://positron.posit.co/data-explorer.html)
- Reddit 2025 IDE thread: [r/datascience best IDE 2025](https://old.reddit.com/r/datascience/comments/1l40tho/what_is_the_best_ide_for_data_science_in_2025/)

What they have:

- JupyterLab: main work area with tabs, left/right sidebars, file browser, running kernels, TOC, debugger, command palette (modal in 3.0+), workspaces that restore layout, Simple Interface mode, customizable keyboard shortcuts. Docs say it has IDE features but stays focused on interactive exploratory computing.
- Positron: VS Code fork with data-science panes by default. Activity bar, file explorer, editor, console/terminal panel, secondary sidebar for variables, plots, docs. Data Explorer: spreadsheet view, filter, sort, column summaries. Connections pane for DB schema. Interpreter picker (R and Python). Assistant that can see console, variables, plots. Git. Publish to Posit Connect. Desktop free. Workbench adds SSO, governed compute.

Flow: open project folder, inspect frame, iterate in console or notebook, plot pane, save files.

What to notice: this is the actual "coding IDE analogue for data." Reddit 2025 (167 points, 276 comments) is not asking for Hex. Top answers are VS Code (interactive `# %%` windows), RStudio / Positron (object viewer + plots + connections always visible), Spyder (code left, variables top-right, plots bottom-right), PyCharm, marimo (`.py` notebooks), Cursor. Users miss debugging, autocomplete, file tree, block comment, Copilot inside JupyterLab. R users say the object viewer + plot window is addictive. That pane contract is the usability bar Datly is measured against, not cell count.

### Databricks notebooks + SQL editor

URLs:

- [Databricks Notebooks](https://www.databricks.com/product/collaborative-notebooks)
- [Databricks Assistant](https://www.databricks.com/blog/introducing-databricks-assistant)
- [Assistant Edit Mode](https://www.databricks.com/blog/databricks-assistant-edit-mode-fastest-way-transform-your-notebooks)
- [Genie Code (Azure docs)](https://learn.microsoft.com/en-us/azure/databricks/notebooks/code-assistant)
- [IDE integrations](https://www.databricks.com/product/data-science/ide-integrations)

What they have:

- Managed notebooks on lakehouse compute. Multi-language, markdown, comments, forks, usage logs.
- Low-code visual exploration. Inline assistant and assistant pane. Unity Catalog context (lineage, popular tables, descriptions).
- Separate SQL editor with history and query profile. Catalog/schema picker so you can write table-only names.
- Edit Mode: one prompt applies edits across many cells.
- They also tell serious engineers to leave the notebook: VS Code / PyCharm / Posit Workbench extensions for git, unit tests, remote debug.

Flow: attach cluster, browse catalog, notebook or SQL editor, assistant, share.

What to notice: assistant-in-editor is table stakes in 2025/2026. Compute + governance is their moat, not UX. Datly should not become a lakehouse. It already has local DuckDB-class analysis plus connectors.

### Count and Observable

URLs:

- [observablehq.com](https://observablehq.com/)
- [Count vs notebooks](https://count.co/compare/count-vs-notebooks)
- [Bye-bye notebooks, hello canvas](https://count.co/blog/bye-bye-notebooks-hello-canvas)
- [Count buyer guide](https://count.co/blog/a-data-notebook-buyers-guide)

What they have:

- Observable: reactive JS notebooks, Markdown + JS + SQL + HTML, file drop, BigQuery/Snowflake/DuckDB/Postgres, inputs (sliders), minimap of dataflow, AI assist, multiplayer, fork/merge, embeds. Built for interactive viz prototyping.
- Count: infinite canvas of notebook cells (SQL, Python, viz, filters) plus whiteboard (stickies, sketches). Branch hypotheses spatially. Stakeholder collab. Semantic layer + warehouse + CSV + MCP. Agent that runs analysis, not only writes a query. Reports of any shape from the same canvas.

Flow: drop cells on a canvas, query, branch, present in place.

What to notice: they rejected linear notebooks because people get lost and stakeholders bounce. Datly already has a spatial-ish memory (data threads), not a canvas. Do not copy Miro. Do copy "the how sits next to the what" and "branch without losing the path."

### DataGrip and DBeaver

URLs:

- [jetbrains.com/datagrip](https://www.jetbrains.com/datagrip/)
- [dbeaver.io](https://dbeaver.io/)
- Comparison writeup: [DBeaver vs DataGrip vs browser](https://dbeverywhere.com/blog/dbeaver-vs-datagrip-vs-browser)

What they have:

- DataGrip: schema-aware SQL console, completion using FKs and in-query objects, on-the-fly analysis, query history, parameterized SQL, import/export (CSV, JSON, HTML, Markdown, Excel, custom), VCS, themes, customizable keymap, AI (schema-aware write/fix/optimize/dialect convert, local or cloud models). Result extractors from the grid. Stored-proc debug. ~30 official engines.
- DBeaver Community: free. Navigator, metadata, SQL editor, data editor, ER diagrams, data transfer, AI chat + `@ai`. Pro adds NoSQL, cloud, visual query builder, scheduler. Recent releases spend a lot of notes on Data Editor (HTML preview, find/replace, spatial, complex types) and keyboard access for AI chat.

Flow: connect, index schema, write or generate SQL, inspect grid, export.

What to notice: the professional contract is schema tree + editor + results grid + keyboard. Users pay DataGrip for completion and refactor. They tolerate DBeaver's dense Eclipse UI because the grid and 100+ drivers work. RAM and 5 to 20s startup are hated. Datly already has a table grid. It does not need stored-proc debug. It does need the grid to feel like a tool, not a preview.

### Tableau Desktop and Power BI Desktop

URLs:

- [Start a viz by dragging fields](https://help.tableau.com/current/pro/desktop/en-us/buildmanual_dragging.htm)
- [Shelves and cards](https://help.tableau.com/current/pro/desktop/en-us/buildmanual_shelves.htm)
- [Tableau workspace](https://help.tableau.com/current/pro/desktop/en-us/environment_workspace.htm)
- [What is Power BI](https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview)
- [Power BI field / Data pane](https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-field-list)
- [Power BI Desktop for Tableau people](https://interworks.com/blog/2024/07/22/a-guide-to-power-bi-desktop-for-tableau-developers/)

What they have:

- Tableau: Data pane, Columns/Rows shelves, Marks card (type, color, size, label, detail, tooltip), Filters, Pages, Show Me, double-click-to-guess, unlimited undo back to workbook open, dual axis, blend measures. Desktop-first authoring.
- Power BI Desktop: Report / Table / Model views. Data pane + Visualizations pane + Filters. Drag fields onto a visual. Power Query for prep. DAX model. 100+ connectors. Copilot. Desktop for create, service for share.

Flow: connect, model or not, drag fields, format, publish.

What to notice: this is Datly's closest interaction ancestor. MSR Data Formulator is explicitly "UI encodings + NL" because a single prompt is a bad way to specify a chart. Tableau users live on the Data pane and Marks card for hours. That is professional data IDE chrome even though nobody calls Tableau an IDE. Datly already has the shelf. The gap is the surrounding workbench (field list quality, grid, undo, panes), not another Marks card.

### KNIME and Alteryx (wrangling contrast)

URLs:

- [KNIME Analytics Platform](https://www.knime.com/knime-analytics-platform)
- [Alteryx Designer](https://www.alteryx.com/products/alteryx-designer)

What they have:

- KNIME: free desktop. 300+ connectors. Node canvas. Blend, transform, viz, Python/R/JS, reusable components, genAI assistant that can auto-create analysis or scripts.
- Alteryx Designer: Windows desktop (Mac needs a VM). 300+ drag-drop tools, 80+ sources. Visual canvas that documents every step. Ask Alteryx / Copilot. Cloud-connected execution.

What to notice: "prep, blend, repeat" is a real job. It is not Datly's job. Including a node canvas because Alteryx has one would be the exact failure mode this report forbids.

## Demand

Sources that actually complain or ask, not vendor blogs.

| Source | What people want | What they hate | Weight |
| --- | --- | --- | --- |
| [r/datascience IDE 2025](https://old.reddit.com/r/datascience/comments/1l40tho/what_is_the_best_ide_for_data_science_in_2025/) | VS Code or RStudio-like panes. Interactive `.py` cells. Variable explorer. Plot pane. File tree. Debugger. Autocomplete. Copilot. HTML export. Persistent graphs + markdown for EDA. | JupyterLab missing debug / autocomplete / tree / block comment / AI. Extension soup in VS Code. Notebooks for production. | High. Current, 276 comments. |
| Same thread, RStudio / Spyder / Positron comments | Always-on object viewer, connections, plots. No tab-switching. | Positron still immature (2025). Missing Copilot then (Posit later added it). | High for desktop pane contract. |
| [HN: I don't like Notebooks](https://news.ycombinator.com/item?id=17856700) (Joel Grus, 312 points) | Restart-and-run-all as default. Plain-text source. Diffable files. Modules + tests. Replayable history. Inline plots without hidden state. | Out-of-order cells, hidden state, JSON `.ipynb` vs git, kernel sharing, "notebook as program," no env pin. | High, durable. 2018 but still the standard complaint. |
| [HN item 18337112](https://news.ycombinator.com/item?id=18337112) and siblings | Text notebooks (RMarkdown / Quarto / marimo). | Diff/merge of notebook JSON. | High. |
| [r/dataengineering Hex/Deepnote](https://old.reddit.com/r/dataengineering/comments/14ohd98/is_anyone_here_using_hex_or_deepnote/) | Shareable hosted notebooks, no VM babysitting, apps as links, git + S3. Local/self-host trust. | Hex ToS / data-use / no uptime warranty. Hosted slowness. Jupyter still "the standard." Collab on laptop Jupyter is painful. | Medium (2023). Trust still matters for desktop Datly. |
| [Hex independent review](https://selectfromwhereand.com/posts/hex_review/) | Agent that produces real SQL/charts from a CSV or warehouse. DAG, comments, version history, data browser, apps. | Packed UI. Type "object" on strings. Need project hygiene. Does not fix a bad warehouse. | Medium-high, 2026 hands-on. |
| Count interviews (their blog, biased but specific) | Analysts undervalued, stuck on the dashboard train, last-mile broken. Want stakeholders in the analysis. | Chart-making machines that publish read-only. Endless follow-up Slack. | Medium. Vendor research, matches Stack Overflow analyst dissatisfaction they cite (2019/2020). |
| DataGrip / DBeaver users ([JetBrains quotes](https://www.jetbrains.com/datagrip/), [DBEverywhere compare](https://dbeverywhere.com/blog/dbeaver-vs-datagrip-vs-browser)) | Fast import/export, one IDE many DBs, keyboard, schema-aware complete, result extractors, ERD. | RAM 0.8 to 2 GB. 5 to 20s start. Dense UI. Firewall / IP whitelist pain on desktop. | High for grid + schema. Ignore their "become a SQL IDE" pull. |
| Tableau / Power BI desktop help and migration guides | Drag fields, Show Me / smart defaults, undo, dual axis, field list always there. | Broken drag-drop is a support-stopping bug (Power BI community threads). Model-first tax in PBI. | High for shelf UX. |
| MSR Data Formulator blog | Specify charts with encodings + short NL. Branch via threads. Inspect derived data. | Single long prompt is a bad UX. Unstructured clean and vague goals still unsolved. | High. This is Datly's own research thesis. |

Demand synthesis (what to optimize for):

1. Always-visible data, fields, chart, and agent. No hunting.
2. A result grid that is a tool (sort, filter, profile, copy).
3. Keyboard for the 20 daily actions.
4. A session that restores. Desktop users expect this.
5. An inspectable trail (threads), not hidden notebook state.
6. Share as report/export, not "here is my kernel."
7. Local/desktop trust. Do not make cloud ToS the product.

Demand that is loud but not Datly's job: git-native notebooks, SQL refactor, lakehouse jobs, multiplayer whiteboards, semantic-model governance.

## Compare and include

Include rule: yes only if it serves J1 to J5 or desktop daily use. later if it is a real job but not the next hire. no if it fights product identity or is rival-only.

| Capability | They | We (Datly / Data Formulator) | Users want | Include | Why |
| --- | --- | --- | --- | --- | --- |
| Encoding shelf / Marks card | Tableau shelves + Marks. PBI viz wells. Hex chart cells. Datly origin. | Live (VisualizationView / Concept Encoding Shelf) | Yes, control without a novel | yes | Already the differentiator. Polish, do not replace. |
| Agent that writes transforms + charts | Hex Notebook Agent. Databricks Assistant. Positron Assistant. Count agent. | Live (analyst / Data Thread) | Yes, with audit | yes | Core job. Keep sidecar + inspectable output. |
| Data threads / branch history | Datly unique. Count canvas branches. Hex DAG + revision history. | Live | Yes, avoid hidden state | yes | Answers the notebook-state hate without becoming a notebook. |
| Table / results grid | Positron Data Explorer. DBeaver Data Editor. Hex table cells. PBI Table view. | Live DataView, basic | Yes, daily | yes | Category-defining for professional use. Ours is a preview vs theirs. |
| Field / schema / catalog pane | Tableau Data pane. PBI Data pane. Hex data browser. DataGrip/DBeaver navigator. Databricks catalog. Positron Connections. | Live DataSourceSidebar, thinner | Yes | yes | J1. Needed for 15+ connectors to feel real. |
| Dockable panes (data, chart, agent, knowledge) | JupyterLab, Positron, RStudio, Spyder, Tableau workspace | Single workspace, not IDE-docked | Yes, Reddit 2025 | yes | This is the IDE analogue. Not a command palette. |
| Keyboard for daily actions | JupyterLab, DataGrip, DBeaver, Tableau undo | Weak / undocumented | Yes | yes | Professionals will not mouse every encoding. |
| Session restore / named local session | JupyterLab workspaces. Desktop Tableau/PBI workbooks. Positron workspace. | IndexedDB / session save exists | Yes, especially desktop | yes | User named desktop session. Finish what is already there. |
| Reports + file export | Hex apps. Quarto. PBI service. Datly Tiptap + PNG/PDF/CSV/zip | Live | Yes | yes | J5. Keep. |
| Knowledge / context panel | Hex Context Studio (org-scale). Datly knowledge panel (session) | Live, session-scoped | Yes, so agent is grounded | yes (keep, do not grow to org studio) | Local context helps J2. Org semantic layer is a different product. |
| Model / LLM picker | All AI tools | Hard wall before work | Mixed: want choice, hate a gate | later (soften, do not remove) | Need a model. Wall is not onboarding (project map F6). |
| First-class SQL editor | Hex, Databricks SQL, DataGrip, DBeaver, Count SQL cells | No (identity) | Subset of users | later | Useful next to connectors. Not the product. A cell or drawer, not DataGrip. |
| Notebook cells | Hex, Jupyter, Databricks, Observable | No | Mixed. Many want `.py` instead | no | Identity. Users already hate hidden state. We have threads. |
| Command palette | JupyterLab, VS Code, Positron | No (identity) | Power users | later | Nice after keymap. Not defining. Project map said not this. |
| Git projects | DataGrip VCS. Hex GitHub export. Positron git. | No (identity) | Engineers, not this primary user | no | Different product. Export files is enough. |
| Published data apps / Slack self-serve | Hex Threads, apps, Slack, MCP | No | Teams | later / no for Slack | Apps are a platform. Later only if reports are not enough. |
| Infinite canvas | Count | No | Niche | no | Cool, not our spatial model. Threads + report suffice. |
| Semantic models + evals | Hex Context Studio | No | Enterprise data teams | no | Platform feature. Conflicts with local-first. |
| Multiplayer editing | Hex, Observable, Count, Databricks | No | Teams | later | Desktop session is single-player first. |
| Visual node wrangling | KNIME, Alteryx | No | Prep specialists | no | Different category. |
| ER diagrams, proc debug, SQL refactor | DataGrip, DBeaver | No | DBAs | no | SQL IDE job. |
| Lakehouse compute / jobs | Databricks | No | Platform teams | no | We connect, we do not host Spark. |
| Show Me / chart chooser | Tableau Show Me. PBI visual gallery. Datly templates + Flint | Partial | Yes, start faster | yes | Low-cost friendliness on the shelf we already have. |
| Unlimited undo on viz | Tableau | Unclear / weak | Yes | yes | Professional feel. Cheap vs new surfaces. |
| Reactive DAG notebooks | Hex, Observable, marimo | No | Repro | no | Threads + generated code is our repro story. |
| Desktop install | Tableau, PBI, KNIME, Alteryx, Positron, DBeaver, Datly pywebview | Live | Yes for this user | yes | Already shipping. Treat as primary surface for this seed. |

## Feature matrix (P0 / P1 / P2)

Priority is for "professional data IDE" as Datly, not as Hex.

| ID | Item | P | Include | Notes |
| --- | --- | --- | --- | --- |
| IDE-01 | Three-pane daily layout: catalog/fields, chart+grid, agent+thread | P0 | yes | Positron/RStudio/Tableau contract. |
| IDE-02 | Results grid: sort, filter, search, type icons, copy, column summary | P0 | yes | Positron Data Explorer / DBeaver bar. |
| IDE-03 | Schema / source browser for files and connected DBs (tables, columns, types) | P0 | yes | Makes connectors honest. |
| IDE-04 | Encoding shelf always visible with the chart (not hidden behind chat) | P0 | yes | MSR thesis. Do not bury the differentiator. |
| IDE-05 | Desktop session restore (layout + last tables + last thread) | P0 | yes | User seed. IndexedDB already exists. |
| IDE-06 | Keyboard: focus panes, run agent, undo, export, switch Explore/Report | P0 | yes | Category-defining. Publish a short cheat sheet. |
| IDE-07 | Undo/redo for encodings and thread steps | P0 | yes | Tableau users treat this as oxygen. |
| IDE-08 | Agent sidecar docked, collapsible, never the only way to edit a chart | P0 | yes | Hex/Databricks pattern without notebook cells. |
| IDE-09 | First-run after model select: sample data or "open last / drop file" | P1 | yes | Model wall stays. Empty chrome is unfriendly. |
| IDE-10 | Named local sessions / files (open, save as), not git repos | P1 | yes | Workbook analogue. Not projects-as-git. |
| IDE-11 | Chart chooser / Show Me on selected fields | P1 | yes | Tableau lesson. |
| IDE-12 | Grid profile: nulls, distinct, min/max/hist per column | P1 | yes | Positron column summary. Speeds J1. |
| IDE-13 | Knowledge panel as "what the agent may use," editable, session-local | P1 | yes | Keep small. Not Context Studio. |
| IDE-14 | Report view polish (structure, embed last chart, export PDF/PNG) | P1 | yes | J5. Already live. |
| IDE-15 | Query drawer: optional SQL against current DuckDB/table, results in grid | P2 | later | Serves power users. Must not become the home screen. |
| IDE-16 | Command palette | P2 | later | After IDE-06. |
| IDE-17 | Multi-language UI beyond en+zh | P2 | later | Labels exist. Not IDE. |
| IDE-18 | Notebook import / `.ipynb` | P2 | no | Identity. |
| IDE-19 | Git project model | P2 | no | Identity. |
| IDE-20 | Hex-style published apps, Slack, semantic workbench | P2 | no | Platform, not this campaign. |
| IDE-21 | Count canvas / KNIME nodes | P2 | no | Wrong spatial language. |
| IDE-22 | DataGrip-grade SQL intelligence | P2 | no | Wrong category. |

## Usability: what is category-defining

Asked surfaces, judged for daily professional use of *this* product.

| Surface | Defining for a generic data IDE? | Defining for Datly daily use? | Verdict |
| --- | --- | --- | --- |
| Panes | Yes. RStudio/Positron/JupyterLab/Tableau all bet on this. | Yes | Must. |
| Keyboard | Yes. DataGrip users name it. JupyterLab documents it. | Yes | Must. |
| Schema browser | Yes for SQL IDEs and warehouse notebooks. Optional for file-only EDA. | Yes once connectors are used | Must, keep simple (tables/columns/types, not ERD). |
| Query editor | Defining for DataGrip/Hex/Databricks SQL. | No | Later drawer. Home screen stays shelf + agent. |
| Results grid | Yes everywhere (DBeaver, Positron, Hex, PBI Table view). | Yes | Must. |
| Chart canvas | Defining for BI and for Datly. Optional in SQL IDEs. | Yes | Must. |
| Agent sidecar | Defining for 2025+ AI analytics (Hex, Databricks, Positron). Not for classic Tableau. | Yes | Must, as sidecar, not as a chat-only app. |
| Projects | Defining for Hex/Databricks/git IDEs. Tableau uses workbooks. | Sessions/workbooks yes. Git projects no | Named sessions only. |

Friendliness gaps that are not new features: model-select wall with no "what happens next," dense chrome (Hex review warning: do not pack every square inch), dual visual stacks (MUI + Sass) that make the workbench feel unfinished.

## Flows

### Primary flow (ship this, desktop)

1. Launch desktop (or web). Pick or confirm a model once. Land on last session or a drop-zone, not an empty wall.
2. Load: drag file, pick recent, or connect a source from the catalog pane.
3. Inspect: grid + column types + 1-click profile. Confirm the table.
4. Ask or encode: type a question *or* drag fields to the shelf. Agent may propose a transform. User sees derived table and chart.
5. Branch: data thread step. Undo. Fork a question.
6. Narrate: pin charts into Report view. Export PNG/PDF/CSV/zip.
7. Quit and return: session restores panes, tables, thread.

This is Tableau authoring plus Positron inspect plus Hex agent, without Hex cells.

### Secondary flow (later)

Open a query drawer on the current table, write SQL, send to grid, promote result to a named table, chart it. Optional.

### Flows to skip

- Write a 40-cell notebook and publish an app.
- Design a star schema and a semantic model.
- Draw a 30-node wrangling graph.
- Clone a git monorepo of analyses.
- Chat with a dashboard from Slack.

## Mirror / simplify / skip

**Mirror (do it their way, they earned it):**

- Positron / RStudio / Spyder pane contract.
- Tableau Data pane + shelves + undo.
- DBeaver/Positron grid as a real editor surface.
- Hex/Databricks agent that can see schema and the current artifact.

**Simplify (same job, smaller):**

- Schema browser as a tree, not DataGrip introspection + ERD.
- Sessions as save/open, not Hex projects + statuses + libraries + endorsements.
- Knowledge as a panel, not Context Studio + evals.
- Reports as Tiptap + export, not generative data apps.
- SQL as a drawer, not a console product.

**Skip:**

- Notebook identity, `.ipynb`, cell execution order.
- Git-centric projects and command palette as headline features.
- Infinite canvas, node wrangling, semantic workbench, Slack self-serve.
- Lakehouse jobs, stored procedures, visual query builders.
- Becoming "the AI analytics platform for the whole company."

## Open questions

1. Is the desktop user the design center, or must web stay 1:1? pywebview will constrain docking.
2. How large is "inspect" allowed to be before we are a grid product? Profile on 1M-row DuckDB vs 50-row sample.
3. Should the query drawer execute only on in-memory/DuckDB tables, or pass through to the remote warehouse? Pass-through pulls us toward DataGrip.
4. Do data threads map 1:1 to undo, or is undo only encodings? Users will assume Cmd+Z does both.
5. Model wall: remember last model on desktop, or keep forcing pick for safety?
6. Named session file format: opaque IndexedDB only, or a single portable file (workbook)? Portable helps "professional."
7. How much of Microsoft Research Data Formulator 2 (concept shelf + threads) is still the north star versus the 0.8 "unified analyst chat" flow? The public 0.8 notes say one unified flow. Do not let chat erase the shelf.
8. G2 Hex and G2 DBeaver pages were JS-blocked in this pass. Re-read live reviews before any pricing or NPS claim.
9. Hex ToS complaints are from 2023. Confirm current privacy (Hex now states providers do not train on customer data) before using that as a competitive wedge.
10. Kind R: confirm which of IDE-01 to IDE-14 the user actually wants implemented. Project map will not start data-IDE work without those IDs.

## Confidence

- High: official capabilities of Hex, JupyterLab, Positron, Databricks Assistant, Observable, Count, DataGrip, DBeaver, Tableau shelves, Power BI Desktop, KNIME, Alteryx, Data Formulator/MSR.
- High: Reddit 2025 IDE demand and HN notebook failure modes.
- Medium: Hex G2 sentiment (vendor badges + one 2026 blog, G2 HTML blocked).
- Medium: exact Datly grid/undo/keymap depth (used project map, not a fresh UX audit).
- Low: whether Datly should ever grow a SQL drawer. That is a product call, not a market fact.

## Sources (compact)

- Hex: https://hex.tech/ https://hex.tech/product/notebooks/ https://learn.hex.tech/docs/getting-started/ai-overview https://hex.tech/blog/introducing-notebook-agent/ https://selectfromwhereand.com/posts/hex_review/ https://old.reddit.com/r/dataengineering/comments/14ohd98/is_anyone_here_using_hex_or_deepnote/
- JupyterLab / Posit: https://jupyterlab.readthedocs.io/en/stable/user/interface.html https://posit.co/products/ide/positron https://posit.co/blog/a-quick-tour-of-positron https://positron.posit.co/data-explorer.html https://old.reddit.com/r/datascience/comments/1l40tho/what_is_the_best_ide_for_data_science_in_2025/
- Databricks: https://www.databricks.com/product/collaborative-notebooks https://www.databricks.com/blog/introducing-databricks-assistant https://www.databricks.com/blog/databricks-assistant-edit-mode-fastest-way-transform-your-notebooks https://learn.microsoft.com/en-us/azure/databricks/notebooks/code-assistant
- Observable / Count: https://observablehq.com/ https://count.co/compare/count-vs-notebooks https://count.co/blog/bye-bye-notebooks-hello-canvas https://count.co/blog/a-data-notebook-buyers-guide
- SQL IDEs: https://www.jetbrains.com/datagrip/ https://dbeaver.io/ https://dbeverywhere.com/blog/dbeaver-vs-datagrip-vs-browser
- BI desktop: https://help.tableau.com/current/pro/desktop/en-us/buildmanual_dragging.htm https://help.tableau.com/current/pro/desktop/en-us/buildmanual_shelves.htm https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-field-list
- Wrangling: https://www.knime.com/knime-analytics-platform https://www.alteryx.com/products/alteryx-designer
- Notebook hate: https://news.ycombinator.com/item?id=17856700
- Us: https://www.microsoft.com/en-us/research/blog/data-formulator-exploring-how-ai-can-help-analysts-create-rich-data-visualizations/ https://github.com/microsoft/data-formulator https://data-formulator.ai/
