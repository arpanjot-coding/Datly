# User-surface inventory (dispatch fallback)

- **Status:** CURRENT
- **Scanned:** 2026-08-19
- **Scanner:** DISPATCH-FALLBACK (first inventory child wrote nothing)
- **Thoroughness:** medium, 12-call cap
- **Sources:** `docs/lifecycle/project-map.md`, `src/views/` listing, greps under `src/` and `py-src/` for DataView, encoding, shortcut, undo, session, DataSourceSidebar, KnowledgePanel, desktop.py, ChartifactDialog, GET_RECOMMENDATION_QUESTIONS
- **Product:** Datly / Data Formulator. Load tables, encoding shelf, analyst agent, data threads, reports. Not a SQL IDE, notebooks, git, or Electron. Desktop is pywebview.

Code and project-map win over product-research.md. This file is what is live, partial, missing, or dead on the user surface. It is not a later-wave include list.

## 1. Shipped (live)

| Area | What users can do | Evidence (path) | Desktop notes |
|------|-------------------|-----------------|---------------|
| Workspace shell | Open the SPA, land on `/` or `/app`, switch Explore vs Reports via Redux `viewMode`, see loading overlay while a session loads | `src/views/DataFormulator.tsx`, `src/app/App.tsx`, `docs/lifecycle/project-map.md` §4 | `?desktop=1` is the pywebview flag; window title / packaging name Datly |
| About | Open marketing / about screen | `src/views/About.tsx`, route `/about` | Same SPA inside the pywebview window |
| Auth callback | Complete OIDC / GitHub / EasyAuth redirect | `src/app/App.tsx` (OidcCallback), route `/auth/callback` | Config-gated; local desktop often runs without it |
| Model gate | Cannot start the job until a model is selected (full-screen overlay) | `src/views/ModelSelectionDialog.tsx`, project-map §5 | Same gate in desktop; not first-run onboarding |
| Load tables | Chat-driven ingest plus upload dialog: files, folders, databases, cloud connectors (15+ loaders) | `src/views/DataLoadingChat.tsx`, `src/views/UnifiedDataUploadDialog.tsx`, `src/views/DBTableManager.tsx`, `py-src/data_formulator/data_connector.py` | Local folders and persisted sessions are the desktop-oriented path; demo site copy in DataFormulator points users to the full install |
| Table grid | Inspect loaded tables as a grid (sample, column filter, selectable grid) | `src/views/DataView.tsx`, `src/views/DataFrameTable.tsx`, `src/views/ReactTable.tsx`, `src/views/SelectableDataGrid.tsx`, `src/views/ColumnFilterPopover.tsx` | No desktop-specific grid; same React view |
| Encoding shelf | Bind fields to chart channels (x/y/color/…), swap, clear, aggregate; power-user side path next to NL | `src/views/EncodingBox.tsx`, `src/views/EncodingShelfCard.tsx`, `src/views/EncodingShelfThread.tsx`, `src/views/SourceTableShelf.tsx`, `encodingMap` in `src/app/dfSlice.tsx` | Same shelf in desktop |
| Charts | Render Vega-Lite charts, variants, quick config, insight/restyle | `src/views/VisualizationView.tsx`, `src/views/ChartRenderService.tsx`, `src/views/ChartQuickConfig.tsx`, `src/views/ChartVariantStrip.tsx`, `src/app/chartRecommendation.ts` | Same canvas |
| Analyst / data threads | Chat with the analyst agent, stream transforms, pause/answer, attach rules; session can start with no table | `src/views/DataThread.tsx`, `src/views/DataThreadCards.tsx`, `src/views/AgentChatInput.tsx`, `src/views/AgentPausePanel.tsx`, `src/views/AgentRulesDialog.tsx` | Same primary job |
| Reports | Edit and view Tiptap reports as a view-mode on the same session | `src/views/ReportView.tsx`, `src/views/TiptapReportEditor.tsx` | Same view-mode |
| Data source sidebar | Persistent left rail: sources catalog, saved workspaces, knowledge tab; collapse/open | `src/views/DataSourceSidebar.tsx`, `src/components/CatalogTree.tsx`, `setDataSourceSidebarOpen` / `setDataSourceSidebarTab` in `src/app/dfSlice.tsx` | Rail layout called out in `src/app/layout.ts` |
| Knowledge | Browse/edit rules and workflows from the sidebar knowledge tab | `src/views/KnowledgePanel.tsx`, `src/api/knowledgeApi.ts`, `src/app/useKnowledgeStore.ts`, `tests/backend/routes/test_knowledge_routes.py` | Files live under Datly home (`~/.data_formulator`) |
| Sessions / workspaces | New session ids, list/load/rename saved workspaces, example/demo sessions, Flask filesystem sessions, expired read-only snapshot | `src/views/DataFormulator.tsx`, `src/views/ExampleSessions.tsx`, `src/views/SessionDistill.tsx`, `py-src/data_formulator/app.py` (flask-session, `session_bp`), `py-src/data_formulator/agents/agent_simple.py` (`workspace_name`) | Workspaces on disk via `--workspace-backend=local`; ephemeral preset exists for multi-user demo |
| Connectors catalog | Preview datasets from the sidebar popover | `src/components/ConnectorTablePreview.tsx` | Local folder / DB connectors are the desktop-heavy path |
| Sandbox | Local default isolation for agent code | project-map §5, `py-src/data_formulator` sandbox package | Local subprocess default |
| Desktop shell | Packaged app via pywebview + PyInstaller (Windows + macOS CI), entry `data_formulator_desktop` | project-map §2 and §5; Flask serves SPA with `?desktop=1` | Not Electron. Web remains Vite + Flask 5567 |

## 2. Partial or stub

| Area | What exists | What is missing | Evidence |
|------|-------------|-----------------|----------|
| Keyboard | `App.tsx` registers a `keydown` listener and branches on Ctrl vs Meta (mac) | No product-wide shortcut map, cheatsheet, or customizable bindings found under `src/` | `src/app/App.tsx` ~1175; greps for `shortcut` / `hotkey` hit comments and chat "chips are shortcuts", not a keymap |
| Undo | DataView comment that the toolbar can undo a random sample; CodeMirror history undo/redo inside the report editor | No workspace-level undo/redo stack for charts, encodings, threads, or loads | `src/views/DataView.tsx` (sample undo comment); CodeMirror `undo`/`redo` is editor-local, not Datly state |
| i18n | `t()` plus locale picker; English and Chinese files | ja/ko/fr/de labels exist without locale files | project-map §5 |
| Auth | OIDC / GitHub / EasyAuth implemented | Live only when configured; not the default local path | project-map §5 |
| Databricks | Connector present among loaders | Delegated OAuth still TODO | project-map §5, §8 F8 |
| Onboarding | `LanguageScreen` under `src/views/onboarding/` | No guided first-run; model overlay is the wall | `src/views/onboarding/LanguageScreen.tsx`, project-map F6 |
| Chart recommendations | `SimpleChartRecBox` and `chartRecommendation.ts` populate encodings from agent/chart type | Separate "recommendation questions" API is unwired (see §4) | `src/views/SimpleChartRecBox.tsx`, `src/app/chartRecommendation.ts` vs `GET_RECOMMENDATION_QUESTIONS` |
| Chartifact | Dialog component and vis-table prep exist | Not mounted from the shell; users cannot export this way from the UI | `src/views/ChartifactDialog.tsx` exists; no import from `DataFormulator.tsx` in the src grep |
| Session list | Sidebar sessions tab lists/sorts/renames workspaces (best-effort fetch) | Fetch failure is swallowed (`session list is best-effort`) | `src/views/DataSourceSidebar.tsx` |
| Brand | UI / window / packaging name Datly; Python import `data_formulator` | Split identity still in tree | project-map §1, §5 |

## 3. Missing in product

Searched in `src/` and `py-src/` (plus project-map). Not found as a user-facing product surface:

- Product-wide undo/redo of analysis actions (beyond DataView sample undo and CodeMirror in reports).
- Keyboard shortcut system, command palette, or shortcut customization (`shortcut` hits were comments / suggestion chips).
- `GET_RECOMMENDATION_QUESTIONS` backend route `/api/agent/get-recommendation-questions` (client URL only).
- Call sites that open `ChartifactDialog`.
- SQL workbench / notebook / git-like project UI (explicitly out of current product kind).
- Electron shell (desktop is pywebview; Electron strings in the tree are tooling/deps, not the app).
- Android, iOS, or browser-extension targets.
- `desktop.py` as a grep hit inside `py-src` on this pass (project-map still names `desktop.py` + `data_formulator_desktop`; file path not re-opened here because the call budget ended).
- Consumer language-first onboarding beyond `LanguageScreen`.
- Typecheck script (tooling, not a user feature; noted only because project-map lists it as missing).

## 4. Dead or unused

| Item | Verdict this pass | Evidence |
|------|-------------------|----------|
| `ChartifactDialog` | Still dead. Component file is in `src/views/`. Workspace shell does not import it. Project-map already classed Chartifact export as dead. | `src/views/ChartifactDialog.tsx`; `DataFormulator.tsx` imports `DataSourceSidebar` and not Chartifact; src grep for `ChartifactDialog` did not show another caller |
| `GET_RECOMMENDATION_QUESTIONS` | Still dead. Frontend API table points at `/api/agent/get-recommendation-questions`. No caller in `src/` besides that constant. No matching route in the py-src grep. | `src/app/utils.tsx` line ~48; py-src session/agent greps did not list the endpoint |

No product code, TRACKING, or project-state was edited for this inventory.
