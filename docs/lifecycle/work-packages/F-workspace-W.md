# Work package - F-workspace History + D-free-saas

- **Status:** DRAFT
- **Plan gate:** no [impl] until approve.
- **Kind:** W
- **Session focus:** web, desktop
- **Ship targets:** web, desktop (same renderer; no desktop-only fork)
- **Features:** F-workspace (this ship). F-auth / F-workflow-db regression only. F-billing: no chunks.
- **Wave A:** W-hist-nb, W-hist-ui, W-b2b-shape, W-reg-wf all DONE
- **Source:** `docs/lifecycle/feature-ask.md` plus `free-saas-neighborhood.md`, `free-saas-ui-expert.md`, `free-saas-b2b-shape.md`, `wf-regression-free-saas.md`
- **Lane:** BUILD
- **Blast:** small (landing section + New project reducer). No new route. No new store.

## Ask / out of scope

**Verbatim:** keep it simple, easy to use. There are no issues in terms of Customization. the project history, it's just below. Or maybe we can have a history section. users can set up a new project, then we can have a new chat. SaaS login. We're not going to take any payment, we're not going to have any hire team, we're just going to make the SaaS system really, really good and free.

**Locked SHAPE D-free-saas.** Login required (`identity.type === 'user'`). Free. No Stripe. No hire-team / seats / org billing. No live share. History is a first-class section after login. New project opens a fresh workspace chat. Keep Distill/Play. Language first. No KNIME. No SQL as home.

**Out of scope**

- Stripe, paywall, plan picker, invoices
- Hire team, seats, invite, org billing, Datly-Web account menu link
- Live share / mounting `ShareSheet.tsx` / C-share-acl
- A fourth history list, History route, Recents strip, portal projects
- KNIME / node canvas / Spark / SQL as home
- Reopening password store, CSRF, SQL guard, Distill CTA, Play seed
- Whole-app restyle, Cicada marketing, customization maze
- 21-locale campaign (new copy uses `t()` + `defaultValue`; en SSOT optional)
- S9 leftovers F1 (readOnly replay) and F2 (busy sheet). List only.

Do not spawn: `C-bill-*`, `C-bill-stripe`, `C-share-acl`, Spark, hire-team.

## Meaning

After LanguageScreen and login, the user sees a History of their projects, can open one (resume that project chat), or start a New project that mints a workspace and an empty chat.

Who: signed-in analyst on web or desktop.

Entry -> steps -> success:

1. Language if needed, then `/login` if `identity.type !== 'user'`.
2. Landing: primary **New project** and a **History** section of saved workspaces.
3. New project: `resetForNewWorkspace` with a minted id. Workspace chrome. Empty `textTurns`. Distill/Play exist (Distill disabled until chat).
4. History card: existing `loadWorkspace` + `loadState`. Chat and tables restore. Distill/Play still make sense.
5. In-session: header picker and Sessions tab remain switchers for the same `listWorkspaces()` list, not a second home. Exit still `resetState` back to History.

## Verdict

**SHAPE** (logged D-free-saas). Place is existing landing plus the two in-session lists. Grain is one primary: landing History + visible New project. Chat is a child of project.

Not **FIT**: landing still treats History as leftover under Demos; New session exits to landing.

Not **ASK**: login is required; free; no hire team; no share-vs-export question.

Not **UNFIT**: does not need a new app or KNIME.

D-saas-full Phase C/D (share, portal pay) are **deferred** this beat: user said no payment, no hire team. Companies use the same free `user:` account. Datly-Web stays on disk unused.

## Place / grain

No new route. No new store. No History page. Single store: `src/app/workspaceService.ts` -> `GET /api/sessions/list`.

| Surface | Today | After |
|---------|-------|--------|
| Landing (`DataFormulator.tsx`) | Hero + DataLoadMenu + **Demos** + **Your Sessions** below the fold | **Home.** New project primary. History section (existing cards). Demos secondary below History. |
| `WorkspaceMenu.tsx` | Compact switcher. New session = `resetState()` to landing. Hidden when `!activeWorkspace`. | Same switcher. New project = `resetForNewWorkspace`. Not the only New path. |
| Sessions tab | Full list. Plus = `resetState()`. | Same manager. Plus = New project (`resetForNewWorkspace`). |

Landing is already the unsessioned root: `activeWorkspace && !provisionalSession` shows workspace + sidebar; else landing. Plug in there.

### Grain

| Thing | What it is | What it is not |
|-------|------------|----------------|
| History | Named workspaces. Click resumes (`loadWorkspace`). | Demos. A collab console. A second list. |
| New project | One primary CTA. Mint id + `resetForNewWorkspace`. Empty chat. | Import-first maze. `resetState()` back to landing. |
| Chat | Analyst thread inside the project. Empty on New. Restored on History open. | A separate new-chat product. |

Landing sketch:

```text
[logo / title]
[primary: New project]
[History: existing workspace cards, empty/loading/error]
[Demos stay secondary, below History]
```

DataLoadMenu (upload / start chat) may remain **secondary**. It is not the primary New project. Hosted demo must not keep Demos above History.

Empty History: one line ("No projects yet") plus the same New project CTA. Landing list today swallows fetch errors; give it the same honest empty/loading/error as Sessions. Share **data fetch** (`listWorkspaces` / `onWorkspaceListChanged`). Do not reprint two homes.

Keep card verbs: rename, export, delete confirm. Do not add share, members, tags, folders.

### New project vs Exit

| Action | Reducer | Result |
|--------|---------|--------|
| New project | `resetForNewWorkspace({ id, displayName })` | Workspace chrome, empty chat |
| Exit | `resetState()` after save/delete empty stub | Landing / History |
| Open History | `loadWorkspace` + `loadState` | Restored chat |

IDs stay `session_YYYYMMDD_HHMMSS_<4 hex>` (`generateSessionId` / sidebar `createNewSession`). Untitled name as today. Do not open SQL. Do not open KNIME. Do not require a table first.

`resetForNewWorkspace` already preserves identity, models, config, sidebar, viewMode. Reuse it. Do not invent a third reset.

### Sacred (must not break)

- Login gate: `loginRequired = identity.type !== 'user'`. No `IS_LOCAL_MODE` skip.
- Language first: LanguageScreen overlay before chrome.
- Distill/Play: KnowledgePanel ActionRow + Play sheet. Workspace `IslandHeader` Explore/Reports stay. New project lands in workspace `viewMode: 'editor'`.
- SQL stays the existing drawer, not landing.
- ShareSheet stays unmounted.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-hist-landing | History empty/loading/error; New project primary |
| section-grain | C-hist-landing | Landing is History home; not a new /history grain |
| phone-chrome | n/a | android/ios not in ship set |
| web-layout | C-hist-landing | Same landing on web 375 + 1280 |
| desktop-chrome | C-hist-landing | Titlebar / no-drag unchanged; landing in island |
| first-run | n/a | LanguageScreen then login unchanged |
| value-slide | n/a | No value slides |
| app-polish | n/a | Icons/legal not this package |
| notifications | n/a | No reminders |
| i18n | C-hist-landing | t() on History / New project; defaultValue ok |
| hardware-back | n/a | No android |

## Chunks

| ID | Goal | Depends | Acceptance | Likely files |
|----|------|---------|------------|--------------|
| C-hist-landing | Promote landing sessions into a named History section above Demos. Visible New project primary (not only DataLoadMenu). Honest empty/loading/error. Keep demos labeled Demos. Keep existing card open/rename/export/delete. Do not add Share. Do not add a new route or store. | - | After login, History is the first section of the user's work. Demos are below it. Empty list says no projects and still offers New project. Fetch failure is visible, not swallowed. | `src/views/DataFormulator.tsx`; optional `src/i18n/locales/en/common.json` keys |
| C-hist-new-project | Landing New project mints `generateSessionId` (or same pattern) and `resetForNewWorkspace`. User enters workspace with empty chat. Do not call `resetState()`. Do not open SQL or KNIME. Do not require a table. | C-hist-landing | Click New project from landing: `activeWorkspace` set, `textTurns` empty, Distill/Play chrome present (Distill disabled until chat). User is not dumped on landing. | `src/views/DataFormulator.tsx`; `src/app/dfSlice.tsx` (reuse only) |
| C-hist-resume | History card still `loadWorkspace` + `loadState`. Opening a project restores that chat. Do not blank `textTurns` on open. | C-hist-landing | Click a History card: workspace shell, restored tables/chat. Distill/Play still reachable. | `src/views/DataFormulator.tsx` (open path stays) |
| C-hist-in-session | Header New and sidebar plus use `resetForNewWorkspace`, not `resetState`. Relabel New session to New project only if it stays one action. Exit stays `resetState`. Distill/Play IA unchanged. Picker and Sessions stay in-session, not a second History home. | C-hist-new-project | From an open project, New project opens a blank workspace chat. Exit returns to landing History. Knowledge Distill/Play still in the sidebar. | `src/views/WorkspaceMenu.tsx`; `src/views/DataSourceSidebar.tsx` |

**Order:** C-hist-landing then C-hist-new-project then C-hist-resume (resume can overlap landing if open path is untouched). C-hist-in-session after New project reducer is the landing path.

Reuse sidebar `createNewSession` pattern. Do not fork `SESSION_LIST`. Do not use `workspaceDB` as History.

## Proof

- After Accept: lite S9 on landing History + New project + login still gates + Distill CTA still visible + Play still opens sheet + Share still hidden + no Stripe.
- Flags: shipsNotifications false. writesOutput false. siblingFamily false.
- W-reg-wf this beat: no new Distill/Play P0. History leftover is this W.

## User questions

None. ASK cleared. D-free-saas locked.
