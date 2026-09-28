# Neighborhood: project history + new project + new chat

SHAPE **D-free-saas**. Login required. Free. No Stripe. No hire-team / seats / org billing. No live share. History is a first-class section. New project starts a fresh chat. Keep Distill/Play. Language first.

Source of truth for this job: `docs/lifecycle/feature-ask.md` (F-workspace). Do not invent a second workspace store.

Single store: `src/app/workspaceService.ts` → `GET /api/sessions/list` (`listWorkspaces`). Ephemeral backend may append **read-only recovery** rows from `workspaceDB`; that is fallback, not a product history API.

---

## 1. Where history lives today

Three UI surfaces, one list API (`listWorkspaces` / `onWorkspaceListChanged`).

### Landing list (no `activeWorkspace`, or provisional empty session while upload dialog is open)

File: `src/views/DataFormulator.tsx`.

- Fetches when `!activeWorkspace`. Local copy: `savedWorkspaces`.
- Renders as **Your Sessions** (`t('workspace.yourSessions')`) **after** the hero and **after** Demos.
- Cards: open (`loadWorkspace` + `loadState`), rename (`updateWorkspaceMeta`), export zip, delete, plus dashed import-zip card.
- Sort default: `created_desc` (creation time). Keys: created desc/asc, updated desc, name.
- Layout intent (comment in file): hero uses `minHeight: '100%'` so title + chat own the first screen; **Demos/Sessions live below the fold and just peek up**. Saved grid has `mt: 8` after demos.

This is the leftover the ask calls "just below."

### Header picker (only when a workspace is active)

File: `src/views/WorkspaceMenu.tsx`. `WorkspaceMenu` returns `null` if `!activeWorkspace`.

- Shown in workspace island header as the current display name + chevron.
- Menu: **+ New Session**, search, list from `listWorkspaces`, delete with confirm, caption "Sessions on this device".
- Open: best-effort `saveWorkspaceState` of current, then `loadWorkspace` + `loadState`.
- Sort is server/list order as returned (ephemeral merge sorts by `saved_at`).

### Sidebar Sessions tab (workspace chrome only)

File: `src/views/DataSourceSidebar.tsx`. Rail folder icon; tab `'sessions'` in Redux (`dataSourceSidebarTab`).

- Same `listWorkspaces`. Sort default: `updated_desc` (recent work). Search, rename, export, import, delete.
- Delete of the **active** session switches to the next row, or mints a new `Untitled Session` via `loadState` if the list is empty.
- Tooltip: table/chart counts + date.

Landing and sidebar duplicate card/row chrome. They must stay on `workspaceService`, not a new cache.

---

## 2. How new workspace / new session is created, and whether chat resets

IDs: `session_YYYYMMDD_HHMMSS_<4 hex>` (`generateSessionId` in DataFormulator; same pattern in sidebar import / `createNewSession`).

### Two reducers (do not mix blindly)

| Action | File | Chat / tables | `activeWorkspace` | Resulting UI |
|--------|------|---------------|-------------------|--------------|
| `resetState` | `dfSlice.tsx` | Clears tables, charts, `textTurns`, `dataLoadingChatMessages`, pendings; bumps `dataLoadingChatResetCounter` | **`null`** | Back to **landing** |
| `resetForNewWorkspace({id, displayName})` | `dfSlice.tsx` | Full `initialState` session fields (empty chat) | **New id** | Stays in **workspace** chrome |

Preserved on both paths: identity, models, config, `serverConfig`. `resetForNewWorkspace` also keeps sidebar open/tab and view mode.

### Entry points

- **Landing chat / add data** (`startAnalystChat`, `openUploadDialog`): if no workspace, `setActiveWorkspace` only (does **not** wipe chat). Provisional: dialog can mint an id, then `setActiveWorkspace(null)` on close if `selectSessionEmpty`. Analyst start **appends** via `queueAnalystTask`. Data-loading chat **preserves** prior thread unless header reset.
- **Header picker "New Session"** (`WorkspaceMenu.handleCreate`): `resetState()` → landing, **chat cleared**.
- **Sidebar Sessions +** (`dfActions.resetState()`): same, **leaves workspace**, **chat cleared**.
- **IslandHeader exit** (`useExitSession`): save or delete empty stub, then `resetState()` → landing.
- **Sidebar `createNewSession`**: `resetForNewWorkspace` (import / "Load in new session"). **New workspace id, empty session, stays in chrome.**
- **Load / import / example**: `loadWorkspace` / `importWorkspace` then `loadState`. Chat is whatever is **in the saved state** (`textTurns` from snapshot). Opening history is not a blank chat.

### Chat reset contract for F-workspace

Ask: "users can set up a new project, then we can have a new chat."

Today "new session" from picker/sidebar **does** clear `textTurns` and loading chat, but it **returns to landing** (`activeWorkspace = null`) instead of opening a clean in-session chat. Mint-on-prompt keeps any in-flight landing conversation.

Ship intent: **New project** should mint a workspace (or `resetForNewWorkspace`) so the user lands in a **blank analyst chat**, not only on the landing hero. Opening History must still `loadWorkspace` (restore chat + tables). Do not add a second chat store.

---

## 3. Sacred contracts (do not break)

### Login gate

`src/app/App.tsx` `AppShell`: `loginRequired = identity.type !== 'user'` → `<Navigate to="/login" />`. `/login` and `/signup` are sibling routes, not inside the gate. **No `IS_LOCAL_MODE` skip.** Language overlay is **outside** this gate.

Do not let History or New project render for `browser` / `local` identity.

### Language first

`AppFC` `showLanguagePicker`: after config + auth check, if language not completed and no pre-init `i18nextLng`, and `AVAILABLE_LANGUAGES.length > 1`, overlay `LanguageScreen` (router stays mounted, shell inert). `/auth/callback` ungated. Do not put History before this overlay.

Order: **LanguageScreen → login → app (History / chat)**. Model wall in DataFormulator still exists if no `selectedModelId`; do not replace it with billing.

### Distill / Play

`src/views/KnowledgePanel.tsx` (sidebar tab `'knowledge'`).

- Distill CTA: `distillFromSession` / `updateFromSession`. Disabled with honest why: workspace, then model, then **chat leaf** (`knowledge.distillNeedChat`).
- Play: workflow row `PlayArrowIcon` opens run (`setRunItem`). Stay session-scoped. Do not hide Knowledge or require a new project type.

New project that wipes `textTurns` will correctly disable Distill until the user chats. Loading a historical workspace must restore turns so Distill/Play still make sense.

### D-free-saas (this ship)

- No Stripe, no paywall, no billing chrome.
- No hire team, seats, org billing.
- No live share. `ShareSheet.tsx` may exist on disk; **do not render** it from History, WorkspaceMenu, or Sessions.
- No KNIME, SQL-as-home, Spark, second chart app.

---

## 4. What "just below" likely is

Verbatim ask: "the project history, it's just below. Or maybe we can have a history section."

Maps to landing `dataUploadRequestBox`:

1. Hero (logo, title, tagline, **analyst DataLoadMenu**)
2. Demos grid (`landing.demos`)
3. **Your Sessions** grid, further down (`mt: 8`)

"Just below" = sessions as a leftover under the fold, not a first-class History home. F-workspace wants History as a **section** after login: open a project **or** start a new project with a clean chat. Demos can stay, but must not bury the user's own work.

---

## 5. Reuse list for a History section

Reuse; do not add a second workspace store or a parallel `/api/history`.

| Reuse | Path |
|-------|------|
| List / load / save / delete / rename / export / import | `src/app/workspaceService.ts` |
| Backend | `py-src/data_formulator/routes/sessions.py` (`/api/sessions/*`) |
| Summary fields | `WorkspaceSummary`: id, display_name, created_at, saved_at, table_count, chart_count, read_only |
| List refresh | `onWorkspaceListChanged` / `df:workspace-list-changed` |
| Load race | `WorkspaceLoadSupersededError` |
| Open | `loadWorkspace` + `dfActions.loadState` (same as landing + picker + sidebar) |
| Empty session | `dfSelectors.selectSessionEmpty` |
| New blank project | `resetForNewWorkspace` (prefer over `resetState` if the user should stay in chat chrome) |
| Return to History | `resetState` after save (IslandHeader exit pattern) |
| Auto name untitled | `src/app/useWorkspaceAutoName.tsx` |
| Auto persist | `src/app/useAutoSave.ts` + `saveWorkspaceState` |
| Card/row UX | landing cards + sidebar rows + picker search/empty/retry |
| i18n | `workspace.yourSessions`, `workspace.newSession`, `sidebar.sessions`, `workspace.emptySessions` (copy can become "History" / "New project" without new APIs) |

Do **not** reuse `workspaceDB` as History. Do **not** fork `SESSION_LIST`. Do **not** wire Share, Stripe, or hire-team into this section.

### Likely UI move (not implemented here)

Promote the existing sessions grid into a named History section (above or instead of "below the fold"), plus a visible **New project** that calls `resetForNewWorkspace` (or mint + empty `textTurns`) so chat is blank. Keep header picker and sidebar Sessions as the same list, not a second source.

### Touch list (F-workspace)

`src/views/DataFormulator.tsx`, `src/views/WorkspaceMenu.tsx`, `src/views/DataSourceSidebar.tsx`. Regression only for `App.tsx` login + LanguageScreen, Knowledge Distill/Play. No product edits in this neighborhood pass.
