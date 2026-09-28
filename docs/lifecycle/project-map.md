# Project map - Datly

- **Status:** CURRENT
- **Scanned:** 2026-08-19
- **Kind:** brownfield
- **productKind:** consumer-ui
- **Diagnosed stage:** S8
- **Scanner:** Manager from [explore] W1, W2, W3
- **Sources:** docs/lifecycle/waves/map-product-stage.md, map-conventions.md, map-finish-gaps.md

## 1. Product

- **Thesis:** AI-powered data visualization workspace. Analysts load tables (files, folders, databases, cloud), chat with agents that transform and reason over those tables, shape charts in the UI plus natural language, and save or share reports.
- **Who it is for:** Analysts and researchers exploring tabular data who want AI help to load, transform, chart, and report.
- **Primary job:** Load or connect data, then get charts and answers from the analyst / formulate path. Manual encoding shelf is a power-user side path. Reports are a view-mode on the same session.
- **Out of scope (now):** Turning the product into a full professional data IDE (SQL workbench, notebooks, git-like projects, command palette, profiler) until the user names Kind R IDs. That is this session's REPORT, not a ship-blocker of the current job.
- **Naming:** Shipping name is Datly (UI, window title, Electron, PyInstaller). Python import and CLI remain `data_formulator` (alias `datly`). npm package remains `data-formulator`.

## 2. Snapshot

- **Platforms (detected / ship):** Web is live (Vite SPA + Flask 5567, Docker). Desktop is live packaging (pywebview + PyInstaller, CI Windows + macOS, `?desktop=1`). Detect left `targets.desktop.inScope` false; code evidence says desktop is real. Not in tree: Android, iOS, extension.
- **Stack:** TypeScript + React 18 + Vite 7 + MUI + Redux Toolkit. Python 3.11+ Flask + pandas + duckdb + litellm. Yarn + uv. Styling is MUI + tokens + leftover Sass, not Tailwind. Do not re-stack.
- **Topology guess:** Mode A, single product, two language trees (`src/` + `py-src/`). Desktop is pywebview, not Electron.
- **Package manager / scripts:** Yarn (`start`, `build`, `test`, `lint`). uv (`data_formulator`, `data_formulator_desktop`, pytest). **No `typecheck` script.**
- **Runnable?** Yes. `yarn` + `uv sync`; `uv run data_formulator --dev` and `yarn start`; Windows `local_server.bat`. Desktop: `uv run data_formulator_desktop`.

## 3. Stage diagnosis

- **Evidence:** Navigable UI (`/`, `/app`, `/about`, `/auth/callback`). Flask API for agents, tables, sessions. Beta 0.8.0b1. Large pytest + vitest trees. CI builds artifacts and does not run full tests. Empty init stages were not truth.
- **Diagnosed S# + why:** S8. Wired consumer UI plus API, agents, connectors, sessions, desktop shell. Primary job is implemented. Earliest incomplete required stage is feature/quality and ship proofs, not scaffold.
- **Stages to mark done (apply-stages):** S0-S7 done. S1.5 skipped until this research Completes. S8 in_progress.
- **Stages still open:** S8 (current), S9 (tests exist, CI/ship proofs incomplete), S10, S11.

## 4. Tree + routes

- **Entry points:** `index.html` -> `src/index.tsx` -> `App.tsx`. Flask `run_app`. `data_formulator_desktop`. Docker `python -m data_formulator`.
- **Major directories:** `src/views`, `src/app`, `src/components`, `src/i18n`, `py-src/data_formulator/{routes,agents,analyst,data_loader,data_operations,datalake,auth,sandbox}`, `packaging/`, `tests/`.
- **Routes / screens:** SPA is few URLs. Explore vs Reports is Redux `viewMode` inside `/app`.

| Route / screen | Class | Evidence |
|----------------|-------|----------|
| `/` `/app` workspace | live | DataFormulatorFC |
| `/about` | live | About marketing |
| `/auth/callback` | live | OidcCallback |
| `?desktop=1` | live | pywebview desktop |
| DataView | live | table grid |
| VisualizationView | live | chart canvas |
| ReportView | live | Tiptap reports |
| DataThread / analyst | live | primary job |
| DataLoadingChat / connectors | live | ingest |
| DataSourceSidebar | live | catalog |

## 5. Feature / module status

| Module | Class (live/stub/partial/dead) | Evidence | Fix / add / later |
|--------|--------------------------------|----------|-------------------|
| Workspace shell | live | DataFormulator.tsx | later |
| Analyst agent | live | analyst-streaming | later (UI tests add) |
| Connectors | live (one hole) | 15+ loaders; Databricks OAuth TODO | later |
| Charts / encoding | live | VisualizationView, ChartTemplates | later |
| Reports | live | ReportView | later |
| Knowledge | live | KnowledgePanel | later |
| Auth | live (config-gated) | OIDC / GitHub / EasyAuth | later |
| Sandbox | live | local default | later |
| Desktop shell | live | desktop.py + PyInstaller | polish if desktop ships |
| Chartifact export | dead | ChartifactDialog unused | later |
| GET_RECOMMENDATION_QUESTIONS | dead | no backend, no caller | later |
| i18n extra langs | partial | labels ja/ko/fr/de, files only en/zh | later |
| Typecheck script | missing | package.json | add (P1 finish) |
| Name Datly in UI | n/a | lifecycle only | later (rebrand decision) |

Hard gate: no model selected -> full-screen overlay. Matches an AI viz workspace, not a generic spreadsheet IDE.

## 6. Conventions

| Check | Fit / gap | Path | Owner |
|-------|-----------|------|-------|
| Root .gitignore ephemeral marker | fit | .gitignore | gitignore-hygiene.md |
| Scripts: dev / build / test / typecheck | gap | package.json (no typecheck; CI skips suites) | quality.md |
| Stack matches repo | fit | React+MUI+Flask; not Tailwind | stack-baseline.md |
| Topology | fit | src + py-src; pywebview desktop | project-topology.md |
| Tokens / one visual system | gap | MUI + tokens.ts + Sass hex | ui-craft.md |
| Tests on P0 paths | gap | no lifecycle test-cases; viz/report/agent UI untested | feature-test-cases.md |
| Consumer installable | gap | icons yes; no language-first onboarding | app-polish.md · onboarding.md |
| Locales t() + picker + en | partial | en+zh; extra labels without files | cross-cutting.md |
| Ship capabilities detected | gap | init defaults; writesFiles false while exports exist | production-bar.md |

## 7. Quality + risks

- **Tests / CI:** Vitest and pytest exist. GitHub Actions build yarn + uv / PyInstaller. Web job does not run pytest or vitest. Desktop job runs spinner test + frozen self-test.
- **Security smells:** `.env.template` placeholders. `FLASK_SECRET_KEY` optional (random per process). Local sandbox is subprocess isolation. Databricks delegated OAuth not implemented.
- **Dependency debt:** Dual visual stacks. Brand split Datly vs Data Formulator. `litellm` pin. ESLint `any` allowed.

## 8. Finish the app

No P0 that stops load-data -> analyst chart -> optional report.

| ID | Band | Fix or add | Why it blocks finish |
|----|------|------------|----------------------|
| F1 | P1 | Add CI yarn test + pytest | Ship proof hole |
| F2 | P1 | Add typecheck script + CI | Convention gap |
| F3 | P1 | FE tests on analyst / chart / report / shelf | Primary job UI untested |
| F4 | P1 | Artifact proofs for zip / PNG / PDF | writes-files untested |
| F5 | P1 | detect-capabilities --write; desktop in-scope if shipping desktop | State would lie |
| F6 | P1 | Guided first-run if consumer desktop | Model wall is not onboarding |
| F7 | P1 | Rebrand only if ship name is Datly | Identity hole |
| F8 | Later | Databricks OAuth | Not primary local job |
| F9 | Later | Professional data-IDE chrome | This REPORT category ask |
| F10 | Later | Dead GET_RECOMMENDATION_QUESTIONS | Unused |
| F11 | Later | Unify visual system | After identity lock |

## 9. Next campaign

- **This user message:** research + Kind R improvement plan (REPORT). Do not implement.
- **Product (one, after IDs):** If they pick data-IDE IDs, implement those. If they pick finish-the-app, start with a **test campaign** (proofs), not a new IDE.
- **Do not start:** implementing data-IDE features, a silent Datly rebrand, connector expansion, visual rewrite, or ship-gate before Kind R IDs.
