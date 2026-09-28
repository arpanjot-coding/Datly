# Product research compare (W5) - Datly / Data Formulator vs Hex, Deepnote, Observable, Jupyter

- **Status:** DRAFT
- **Updated:** 2026-08-19
- **Wave:** 2 W5 (us-vs-them include table)
- **Agent:** [research]
- **Inputs:** docs/lifecycle/project-map.md, docs/lifecycle/waves/map-product-stage.md, docs/lifecycle/waves/map-finish-gaps.md, docs/lifecycle/waves/research-data-ide.md (W4)
- **Rules:** Include? is yes / later / no only. yes = category P0 we lack, or users clearly ask and it fits our job. later = useful, not this phase. no = fights our job, or clone-for-clone with no user pull. Do not include a rival feature only because they have it.
- **Inventory rule:** What we have is from W1 map only. Do not invent UI.

Two P0 sets stay distinct (do not merge them into one backlog):

- **P0-A (current product job):** load or connect data, then analyst / formulate or encoding-shelf chart, then optional ReportView. Map: this job already ships (S8). No map P0 blocks it. Finish items F1-F6 are proofs and first-run polish, not a new IDE.
- **P0-B (named category: professional data IDE):** mixed SQL/code workspace, shareable artifact, AI that edits the project (not a sidecar chatbot), usable local desktop. This is the category the user named. Map F9 is Later until they name Kind R IDs.

## What we have vs them (short)

Shipping name in UI is Data Formulator. Repo and lifecycle say Datly. No Datly string in product UI (W1).

| Area | Hex | Deepnote | Observable | Jupyter / JupyterLab | We (W1 map) |
|------|-----|----------|------------|----------------------|-------------|
| Primary job | Warehouse notebook to data app | Collaborative SQL+Python notebook | Reactive JS viz notebooks | Local code notebook | Load tables, agent chart, report |
| SQL-first cells | yes (first-class SQL cell) | yes (SQL blocks) | SQL in notebooks | via magics / libs | no |
| Python / R authoring | Python + R cells | Python + R | JS (not Python) | Python default | partial: backend pandas/duckdb; user is not in a code IDE |
| AI | Notebook Agent writes SQL/Python/chart cells; Threads; Context Studio | Agent + completion; creates SQL/Python/text blocks | AI Assist | plugins (Copilot) | yes: Analyst / formulate on loaded tables; model-select overlay is a hard gate |
| Interactive viz | chart / map / table cells | built-in charts + Python libs | Plot / D3 native (strong) | libs | yes: encoding shelf + NL; ChartTemplates (strongest card) |
| Connect | warehouses, dbt, files | 100+ (warehouses, Drive/S3/Sheets) | files, DBs, APIs | local files + libs | yes: files, folders, 15+ connectors; Databricks OAuth hole |
| Publish | data apps from notebook | apps, dashboards, APIs | embeds / iframe | Voila / nbconvert | partial: ReportView / Tiptap; viewMode, not a permissioned app publisher |
| Collaborate | multiplayer, comments, permissions | multiplayer, comments, Git | multiplayer, comments | git diffs on .ipynb (pain) | no: single-user sessions |
| Desktop / local | cloud only, no self-host | cloud only (VS Code "open in cloud") | browser | local / self-host default | yes: pywebview + PyInstaller; detect still `desktop.inScope` false |
| Format / lock-in | proprietary (high lock-in notes) | .ipynb compatible | Observable notebook | .ipynb | own workspace / session |
| First-run | hosted signup | hosted signup | hosted / browser | install Python / env | partial: no language-first overlay; model wall |

Sources for them: W4 plus pages fetched this wave (URLs at the bottom).

## Compare include table

| Capability | They have (who) | We have | Users want? (source) | Include? | Why |
|------------|-----------------|---------|----------------------|----------|-----|
| Load files and databases | Hex, Deepnote, Observable, Jupyter | yes | yes (table stakes; Hex/Deepnote connect pages) | yes | P0-A we already ship. Keep. Do not rebuild a connector platform. Databricks OAuth is Later (F8). |
| AI agent on loaded tables | Hex Notebook Agent, Deepnote agent, Observable AI Assist | yes | yes (Hex product + Lovable quote: agent writes SQL in the project) | yes | P0-A we ship. Keep chat. The gap is canvas-edit (row below), not a second chatbot. |
| Interactive charts (shelf + NL) | Hex chart cells, Observable Plot/D3, Deepnote charts | yes | yes (this product's job; MS Research Data Formulator) | yes | P0-A. Our differentiator vs notebook cells. Polish later; do not replace with Hex chart cells. |
| Session reports | Hex apps, Deepnote Apps, Observable embeds | yes | yes (save/share) | yes | P0-A. ReportView exists as viewMode. Keep. Hosted app-link is a different row. |
| SQL as first-class authoring | Hex, Deepnote; Observable SQL; Jupyter only via magics | no | yes (Hex: jumping between tools; Deepnote SQL first-class; Fastero: SQL-first teams leave vanilla Jupyter) | yes | P0-B we lack. Users ask to stop tool-hopping. Scope: query pane on project / DuckDB tables, not a warehouse OS or Hex clone. |
| Mixed Python / R code cells | Hex, Deepnote, Jupyter | partial | mixed (category yes; our path is NL + agent transforms) | later | Useful for a full notebook IDE. Heavy runtime. Agent already emits Python transforms. Spike after a SQL pane if IDs ask. |
| Agent edits the canvas (not only a chat dock) | Hex Notebook Agent creates/edits SQL, Python, chart cells | partial | yes (same Hex/Deepnote AI pages; in the project, not a sidecar) | yes | Fits our job and P0-B. We have DataThread + shelf. Wire the agent to edit those, do not add Hex Threads. |
| Hosted shareable data app / permissioned link | Hex App mode; Deepnote Apps / share-by-link | no | yes (r/dataengineering 14ohd98: Hex "build apps and send a link") | later | Real pull, but this session is desktop. Share model is open (W4 Q5). Reports/export cover the local artifact. Do not clone Hex Apps this phase. |
| Desktop / local workspace vs cloud-only | Jupyter local/self-host; Hex and Deepnote cloud-only, no self-host | yes | yes (this session; Fastero: Hex/Deepnote no self-host; Reddit TOS/data-risk on Hex; Deepnote outage anecdote) | yes | Session focus. We already ship pywebview. Keep local-first. Do not become a cloud-only Hex. Polish friendliness, do not re-stack to Electron. |
| Guided first-run (not a model-select wall) | Hex/Deepnote: cloud signup; Jupyter: env setup | partial | yes (this user; W3 F6; map: no language-first overlay) | yes | Users clearly ask. Fits P0-A on desktop. Model overlay is a hard gate, not onboarding. |
| Command palette / IDE chrome (files, layout) | Deepnote VS Code palette; Hex project nav; coding IDEs | no | mixed (user named "coding-IDE analogue"; not a review chorus) | later | P1-B / map F9. Density can wait. Do not add VS Code chrome just because rivals or IDEs have it. |
| Multiplayer / comments | Hex, Deepnote, Observable | no | yes (Fastero: Jupyter git diffs; leave JupyterHub) | later | Team/cloud. Conflicts with single-user desktop unless we pick hosted. |
| Scheduled notebook runs | Hex, Deepnote | no | mixed (ops teams) | later | Not first-run or local analysis. |
| Jupyter .ipynb import / compat | Deepnote native; Hex claims compatible; Jupyter is the format | no | mixed (escape hatch vs "Jupyter is still the standard") | no | Different architecture. Clone-for-clone. Export CSV/SQL if we need an escape hatch. |
| Semantic models / Context Studio / dbt studio | Hex (Context Studio, Modeling Agent, dbt); Deepnote dbt | no | mixed (enterprise Hex) | no | Clone-for-clone. We have an optional knowledge store. Not current users' job. |
| Hex Threads / Slack self-serve | Hex Threads | no | mixed (Hex marketing) | no | Fights our canvas job. Sidecar conversation product. |
| Electron desktop rewrite | some desktop IDEs | no (pywebview) | no | no | Desktop already ships. Re-stack fights topology. |
| Warehouse-scale Spark IDE | Databricks | no | no for our job | no | Not our product. Hex treats warehouse as where data lives. |
| Silent Datly rebrand | n/a | n/a (UI is Data Formulator) | unknown | no | Needs a ship-name decision (F7). Out of this wave. |

## Feature matrix (P0 / P1 / P2 / skip)

### P0-A: current product job (load -> chart -> report)

These already ship. Include = keep. Kind R should not treat them as net-new IDE work.

| Feature | Source | Priority | Our scope | Notes |
|---------|--------|----------|-----------|-------|
| Connect files + DBs | Hex, Deepnote, us (W1) | P0-A | yes (exists) | Finish proofs, not rebuild |
| Agent on loaded tables | Hex, Deepnote, us | P0-A | yes (exists) | Model wall is the UX hole |
| Interactive viz + NL | Observable, Hex, us | P0-A | yes (exists) | Strongest card |
| Report view | us; Hex/Deepnote apps are adjacent | P0-A | yes (exists) | viewMode, not Apps |

### P0-B: named category (professional data IDE)

Only if the user names Kind R IDs for the category. Do not merge into P0-A.

| Feature | Source | Priority | Our scope | Notes |
|---------|--------|----------|-----------|-------|
| SQL / query pane on project tables | Hex, Deepnote, Fastero SQL-first gap | P0-B | yes (include) | Not a full notebook runtime |
| Agent applies edits to chart / thread / query | Hex Notebook Agent | P0-B | yes (include) | We have the loop; wire it |
| Local desktop that can complete the job | Jupyter; this user | P0-B / session | yes (exists, polish) | Different from Hex/Deepnote cloud |
| Guided first-run | this user; W3 F6 | P0-B session / P1-A finish | yes (include) | Map lists F6 as P1 finish; session ask makes it a yes |

### P1 / P2

| Feature | Source | Priority | Our scope | Notes |
|---------|--------|----------|-----------|-------|
| Shareable hosted app / link | Hex Apps; Reddit send-a-link | P1-B | later | Needs share model (web vs desktop) |
| Command palette + denser chrome | coding-IDE analogue | P1-B | later | F9 |
| Mixed Python cells | Hex, Jupyter | P2-B | later | After SQL pane |
| Multiplayer / comments | Hex, Deepnote | P1 category / P2 us | later | Single-user now |
| Scheduled runs | Hex, Deepnote | P2 | later | |
| Git / open export hatch | Fastero lock-in; Deepnote .ipynb | P2 | later | Not .ipynb as native format |
| detect-capabilities desktop in-scope | W3 F5 | P1-A process | later (finish-the-app) | State lies; not a rival feature |
| CI tests + typecheck | map F1-F3 | P1-A process | later (finish-the-app) | Separate campaign |

### Skip (no)

| Feature | Why |
|---------|-----|
| Jupyter as the file format | Different runtime; no pull from our current job |
| Hex Context Studio / semantic-model platform | Enterprise clone |
| Hex Threads + Slack self-serve | Clone; fights canvas job |
| Electron rewrite | pywebview already ships |
| Databricks-scale Spark IDE | Out of category |
| Silent Datly rename | Rebrand decision, not this compare |

## Skip / later list (summary)

- **Skip (no):** Electron rewrite; Spark / Databricks IDE; Hex Context Studio / Threads / Slack clone; Jupyter `.ipynb` as native format; silent Datly rebrand.
- **Later:** Python/R cells; command palette / IDE chrome; hosted permissioned apps; multiplayer; scheduled runs; dbt; Git escape hatch; visual-token unify (F11); CI/typecheck proofs (F1-F3) unless the user picks finish-the-app IDs instead of category IDs.

## Implications (for W6 Kind R, not a report)

- **Mirror (if they pick P0-B IDs):** one-canvas query + chart + agent; desktop first-run that is not a model wall; keep local-first.
- **Simplify:** we already have agents, Vega/Flint charts, connectors, reports, desktop. Do not rebuild a Hex notebook DAG first.
- **Do not clone:** Hex Apps + Context Studio + Threads as a bundle.

Open Q from W4 still stands: is "professional data IDE" a SQL-notebook (Hex) or a viz-agent IDE with a query pane (us, upgraded)? This table picks the second: SQL pane + canvas-editing agent, not a Jupyter runtime.

## Research confidence

- **High** on our inventory (W1 map).
- **Medium-high** on rival capabilities (primary product pages 2026-08-19).
- **Medium** on demand (Reddit thread, Fastero compare, Hex/Deepnote marketing quotes; no G2 dump).
- **Gaps:** no desktop-store reviews (not a mass store app); Hex/Deepnote pricing not line-item audited this wave.

## Sources (URLs)

- https://hex.tech/product/notebooks/
- https://learn.hex.tech/docs/getting-started/ai-overview
- https://hex.tech/blog/modernizing-jupyter-notebooks-snowflake/
- https://deepnote.com/
- https://deepnote.com/compare/hex-vs-deepnote
- https://observablehq.com/
- https://datasciencenotebook.org/compare/deepnote/hex
- https://fastero.com/blog/deepnote-vs-hex-vs-jupyter-notebooks-compared
- https://www.reddit.com/r/dataengineering/comments/14ohd98/is_anyone_here_using_hex_or_deepnote/
- https://github.com/microsoft/data-formulator
- https://www.microsoft.com/en-us/research/blog/data-formulator-exploring-how-ai-can-help-analysts-create-rich-data-visualizations/
- W1: docs/lifecycle/waves/map-product-stage.md
- W1 finish: docs/lifecycle/waves/map-finish-gaps.md
- W4: docs/lifecycle/waves/research-data-ide.md
- Map: docs/lifecycle/project-map.md
