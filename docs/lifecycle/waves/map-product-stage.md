# Project map inputs - Datly / Data Formulator (sections 1-5)

Source: [explore] W1 01a01ad8-8e9a-79a1-951a-d5b9fed4181a. Manager persist. Not Accept.

- **Kind:** brownfield
- **productKind:** consumer-ui. Desktop is a real second ship path.
- **Diagnosed stage:** S8
- **Scanned:** 2026-08-19

## 1. Product

- **Thesis:** AI-powered data visualization workspace. Analysts load tables (files, folders, databases, cloud), chat with agents that transform and reason over those tables, shape charts in a UI plus natural language, and save/share reports.
- **Who:** Analysts / researchers exploring tabular data with AI help.
- **Primary job:** Data analysis + visualization. Load and agent chat are the path. About features: Connect to Any Data, Conversational Data Agent, Interactive Edit, Save and Share.
- **Out of scope (now):** Professional data IDE category (this session REPORT). Not what the current UI ships as.
- **Naming:** Repo/lifecycle Datly. Shipping name in code is Data Formulator (npm, Python, window title, desktop exe, Docker). No Datly string in product UI.

## 2. Snapshot

- **Web:** Vite SPA proxied to Flask 5567. Production yarn build into py-src/data_formulator/dist. Docker port 5567. detect: web inScope.
- **Desktop:** desktop.py pywebview + Flask 127.0.0.1 ?desktop=1. PyInstaller packaging/. CI desktop-build.yml Windows + macOS. detect left desktop.inScope false (incomplete).
- **Not in tree:** Android, iOS, extension.
- **Stack:** TS + React 18 + Vite 7 + MUI + Redux Toolkit. Python 3.11+ Flask + pandas + duckdb + litellm. Yarn + uv. Vitest + pytest.
- **Topology:** Single product, two language trees.
- **Runnable:** yes. yarn + uv sync; `uv run data_formulator --dev` + `yarn start`; Windows local_server.bat. Desktop: `uv run data_formulator_desktop`. No typecheck script.

## 3. Stage diagnosis

- Empty init stages are not truth. **S8.** Wired UI + Flask API, agents, connectors, sessions, desktop shell. S9 floor (tests exist, CI/ship proofs missing). S10 not claimed (beta 0.8.0b1, research-prototype copy).
- apply-stages at S8: S0-S7 done, S1.5 skipped unless research-done. S8 in_progress.

## 4. Tree + routes

- Entries: index.html -> App.tsx; Flask run_app; data_formulator_desktop; Docker.
- SPA routes: `/`, `/app`, `/about`, `/auth/callback`, `*`. Explore vs Reports is Redux viewMode, not extra paths.

## 5. Feature / module status (abbrev)

Live: workspace, About, DataView, VisualizationView, ReportView, DataThread/analyst, DataLoadingChat, DataSourceSidebar, connectors (15+), sessions/workspace, AnalystAgent, data_operations, knowledge, auth (config-gated), sandbox, demo streams, logs, model endpoints, ChatDialog, desktop shell, tests (not in CI web job).

Partial: Databricks OAuth TODO; i18n extra langs listed without files.

Dead: ChartifactDialog unused; GET_RECOMMENDATION_QUESTIONS no backend.

Missing: typecheck script; product name Datly in UI.
