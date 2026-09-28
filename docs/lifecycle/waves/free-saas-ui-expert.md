# UI-expert: W-hist-ui (History section + new project then new chat)

Role: ui-expert. Session: web + desktop. Do not implement. Do not restyle the whole app.  
Job: F-workspace History section + new project then new chat. Keep Datly simple. SaaS login. Free. No customization maze.

Refs read: `src/views/DataFormulator.tsx`, `src/views/WorkspaceMenu.tsx`, `src/views/DataSourceSidebar.tsx`, `src/components/IslandHeader.tsx`, `src/app/dfSlice.tsx` (`resetState`, `resetForNewWorkspace`), `docs/lifecycle/feature-ask.md`.

Prior chrome already done and must not be rebuilt: `C-ws-sessions` (header switcher states), `C-ws-sidebar` (Sessions tab empty/loading/error/search). Live share stays out.

---

## 1. Meaning

After login, the user sees a History of their projects, can open one (resume that project chat), or start a New project that mints a fresh workspace and an empty chat.

Out of scope: Stripe, hire team, seats, live share, KNIME canvas, SQL as home, Spark, a fourth history list, Distill/Play IA change, landing restyle of demos/hero tokens, customization walls, portal as a second chart app.

---

## 2. Place / plug-in

Do not add a fourth history list. Three lists already exist. Pick one home.

| Surface | Today | Role after |
|---------|-------|------------|
| Landing (`DataFormulator.tsx`, `IslandHeader` variant `landing`) | Hero + `DataLoadMenu` (load/chat) + Demos + **Your Sessions** below the fold | **Primary.** Two honest actions: New project, History. History is the existing saved-workspace grid, not leftover under demos. |
| `WorkspaceMenu.tsx` | Compact in-session switcher (New session + 280px list). Hidden when `!activeWorkspace`. | Keep as in-session switcher. Same rows, not a second home. |
| Sessions tab (`DataSourceSidebar.tsx`) | Full open/rename/delete/search list. Only while a workspace is open. New is a header plus icon that calls `resetState()`. | Keep as in-session manager. Do not promote it to post-login home. |

No new route. No new store. No History page. No KNIME project tree. SQL stays the existing drawer, not the landing.

Landing is already the unsessioned root: `activeWorkspace && !provisionalSession` shows workspace + sidebar; else landing. Plug in there.

---

## 3. Approach

One contained primary: **landing History grain**. Chat is inside a project, not a third root.

### Grain

| Thing | What it is | What it is not |
|-------|------------|----------------|
| History | Named workspaces the user already has. Click resumes that project (load state, open workspace shell, that chat). | Demos. A SaaS collab console. A second list beside Sessions. |
| New project | One primary CTA. Mint id + `resetForNewWorkspace` (or equivalent), enter workspace with **empty chat**. User then loads data or talks. | Import-first maze. Workflow editor. Hidden under WorkspaceMenu only. |
| Chat | The analyst thread inside the project (`DataThread`). Empty on New project. Restored on History open. | A separate "new chat" product. A landing composer that never enters a project. |

### Landing (contained)

Today the honest complaint: "project history is just below." Code matches: comment says Demos/Sessions live below the fold; hosted demo even **promotes Demos ahead of Your Sessions**. `DataLoadMenu` is the first action (upload/connectors/start chat), not New project.

After:

```text
[logo / title]
[primary: New project]     [or: History heading with the list as the body]
[History section: existing workspace cards, empty/loading/error]
[Demos stay secondary, below History, not a fourth session list]
```

Two honest actions, not a customization maze:

1. **New project** visible on landing (button, not a buried plus). Fresh workspace + empty chat. Do not `resetState()` back onto landing.
2. **History** is the section of existing workspaces. Open card = `loadWorkspace` as today (`handleOpenWorkspace`).

Keep existing card verbs (rename, export, delete confirm). Do not add share, members, tags, folders.

Empty History: one line ("No projects yet") plus the same New project CTA. Loading/error already exist in Sessions/menu; landing list is best-effort today (`catch` swallows). Give landing the same honest empty/loading/error as Sessions, without cloning a new list component if a small shared row/card helper is cheaper. Sharing **data fetch** (`listWorkspaces` / `onWorkspaceListChanged`) is good; reprinting two **homes** is not.

Demos stay example packs, labeled Demos. They are not History.

### New project vs today's New session

Live `resetState()` in `WorkspaceMenu.handleCreate` and sidebar New session **nulls `activeWorkspace`** and dumps the user on landing. That is Exit-shaped, not New-project-shaped. `IslandHeader` Exit already saves/deletes then `resetState()`. Keep Exit.

New project must enter the workspace shell with an empty thread. `dfActions.resetForNewWorkspace({ id, displayName })` already exists for that. Reuse it. Mint with the existing `generateSessionId()` / Untitled name. Do not open SQL. Do not open KNIME. Do not require a table first.

Landing composer (`startAnalystChat`) may remain as a **secondary** way to start (type a prompt, mint workspace, enter chat with that seed). It is not the primary New project. Primary New project is the empty project, then chat.

### In-session (do not grow)

- Header `WorkspaceMenu`: keep compact switch. Relabel New session to New project only if copy stays one action and still enters an empty workspace chat (not landing). Do not hide New behind this menu as the only path.
- Sessions tab: keep list + plus. Same New project behavior. Do not restyle the rail.
- Distill/Play: `IslandHeader` Explore / Reports (`viewMode` editor/report) stays workspace-only. Do not move, hide, or replace with History.

### Do not

- A fourth list (History route, "Recents" strip, portal projects).
- KNIME nodes or SQL home.
- Live share chrome (C-share-acl is a different job).
- Whole-app restyle, token pass, Cicada marketing.
- Forcing load-data before a project exists as the only start.

---

## 4. Verdict draft

**SHAPE**

Meaning is locked (D-free-saas). Place is existing landing plus the two in-session lists. Grain is one primary (landing History + visible New project). Chat is a child of project.

Not **FIT**: landing still treats History as leftover under demos, and New session exits to landing instead of opening an empty project chat.

Not **ASK**: no share-vs-export question on this job; login is already required; free; no hire team.

Not **UNFIT**: does not need a new app or KNIME.

---

## 5. Risks

- **Reprinting sessions in two roots.** Landing History + Sessions tab + WorkspaceMenu already list the same `listWorkspaces()`. Fine if landing is the unsessioned home and the other two are in-session switchers. Bad if landing and Sessions both claim to be History home, diverge on sort/search/empty, or get a third Recents strip.
- **Breaking Distill/Play.** Explore/Reports live only in workspace `IslandHeader`. New project must land in workspace `viewMode: 'editor'` without wiping models/config. `resetForNewWorkspace` preserves models/identity; `resetState` also preserves models but **clears the workspace** and returns to landing, so Distill/Play disappear until the user re-enters. Using `resetState` for New project hides Distill/Play behind an extra hop and looks like a regression.
- **Hiding New under a menu.** Today the only labeled New session is inside `WorkspaceMenu` and a sidebar plus, both **after** you already have a session. Landing has no New project CTA. If the plan "adds History" but leaves New only in those menus, first-run stays Import/Demos. New project must be a landing primary.

Also: demos remaining above History on hosted demo will keep looking like "history is just below." Do not leave Demos as the first section after login when the user has projects.

---

## 6. Suggested chunks (ids only)

- `C-hist-landing`
- `C-hist-new-project`
- `C-hist-resume`
- `C-hist-in-session`
