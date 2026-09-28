# Independent verify: C-ws-sessions

Slice: `C-ws-sessions` in `docs/plans/saas-2026-08-20.md` Phase B / coding plan, feature place in `docs/lifecycle/work-packages/F-saas-W.md`. Writer sidecar `docs/test-runs/.worker-done/C-ws-sessions.md` (`done: true`, files: `src/views/WorkspaceMenu.tsx` only). Verifier did not write the slice. Static read of source only. No command. No shot. No Accept.

Named dispatch acceptance: Empty, loading, error, populated, search-no-match honest. Header switcher stays compact, not a collab console. No live share.

Plan lines also: Phase B "Richer Sessions list (empty/loading/error/search). Header switcher stays compact. Attach migrated local workspaces to `user:`." Coding-plan row: History list empty/search (no live share); likely files `WorkspaceMenu.tsx`; list has empty, loading, search; not a collab console. F-saas-W Place: Workspace history = Sessions sidebar + WorkspaceMenu.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 Empty honest | pass | Matches dispatch empty and writer "No sessions yet". | `WorkspaceMenu.tsx` 245-256: when `!listLoading && workspaces.length === 0`, New session row plus `t('workspace.emptySessions', { defaultValue: 'No sessions yet' })` plus device caption. Search field is not shown on a zero list. | n/a |
| A2 Loading honest | pass | Matches dispatch loading and coding-plan "loading". | First fetch: `listLoading && workspaces.length === 0` shows `CircularProgress` 28 and `t('workspace.loadingSessions')` (231-236). `fetchWsList` sets loading true and error false before `listWorkspaces()` (84-94). `workspace.loadingSessions` exists in `en/common.json` 748. | n/a |
| A3 Error honest | pass | Matches dispatch error and writer error+retry. Stronger than coding-plan row (that row omitted error; Phase B and dispatch include it). | Empty error: New session plus error block (238-243). Populated error: `listError && errorBlock` in the list branch (262). Copy `Could not load sessions` plus Retry button that calls `fetchWsList` (175-187). | n/a |
| A4 Populated honest | pass | Matches dispatch populated. Menu still name + relative time + active check + two-step delete. | Else branch (257-316): New session, divider, optional search, mapped rows (190-227) with `display_name`, `formatRelativeTime(saved_at)`, CheckIcon when active. List `maxHeight: 240` scroll. Caption after the list. | n/a |
| A5 Search no-match honest | pass | Matches dispatch search-no-match. Coding-plan "search". Writer df-no-drag. | Filter is case-insensitive `display_name` (113-117). Search `TextField` only when `workspaces.length > 0` (263-302), `className` `df-no-drag` on wrapper, field, input, htmlInput. `filteredWorkspaces.length === 0` shows `t('workspace.noMatchingSessions', { defaultValue: 'No matching sessions' })` (303-308), not a blank list. | n/a |
| A6 Header compact, not collab console | pass | Matches Phase B "Header switcher stays compact", coding-plan "not a collab console", dispatch same. | Trigger remains 32px card, name `maxWidth: 220`, chevron (`WorkspaceMenu.tsx` 377-401). Menu paper `width: 280` (332-333). No members table, invite, roles, activity, presence. Caption `Sessions on this device` (165-172). Hidden when `!activeWorkspace` (358). | n/a |
| A7 No live share | pass | Matches coding-plan "(no live share)", TRACKING SHAPE, dispatch. Writer: no Shared with me. | Grep of share / Shared with me / invite / members in `WorkspaceMenu.tsx`: empty. No Shared section. `C-share-acl` still PENDING in `TRACKING.md`. Load still stamps existing `readOnly` from `loadWorkspace` (129); that is the old hook, not a share product. | n/a |
| B1 Richer Sessions sidebar list | fail | Missing vs Phase B first sentence "Richer Sessions list (empty/loading/error/search)" and F-saas-W Place "Sessions sidebar + WorkspaceMenu". Coding-plan likely files named only `WorkspaceMenu.tsx`; TRACKING Ask row 2 also names only WorkspaceMenu. Sidebar was not in the writer sidecar. | `DataSourceSidebar.tsx` sessions tab empty copy is still `sidebar.noSessions` "No saved sessions" (2286-2291). `refreshSessions` swallows list errors (`catch` best-effort, 600-604). No session-list loading flag, no Retry, no search, no no-match row. Sort/rename/import remain. | Put the same five honest states on the Sessions tab (empty, loading, error+retry, populated, search-no-match), keep header as the compact switcher. Or explicitly defer sidebar to a later chunk in the plan so Place grain matches likely files. |
| B2 Attach migrated local workspaces to user: | n/a | Phase B third sentence. Not C-ws-sessions. Belongs with `C-auth-migrate`. | Writer files list is UI menu only. Not scored on this slice. | n/a |

## Missing / wrong / extra

- Missing vs named dispatch A1-A7 on `WorkspaceMenu.tsx`: none.
- Missing vs Phase B / F-saas-W Place: Sessions sidebar still has empty-only list and silent fetch failure (B1).
- Wrong: none on the header states. New keys `workspace.emptySessions`, `workspace.noMatchingSessions`, `workspace.searchSessions`, `workspace.deviceSessionsCaption`, `workspace.retry`, and menu `workspace.loadFailed` are defaultValue-only; they are not in `src/i18n/locales/en/common.json` `workspace` (740-783). English still renders. Other locales get the English fallback.
- Extra vs this slice: device caption "Sessions on this device" (honest local mode, not required by the one-line coding-plan row). `df-no-drag` on search. Error+retry (required by dispatch/Phase B, extra vs the short coding-plan acceptance string).

## Residual (not a fail of A1-A7)

- Delete in the menu still `catch { /* ignore */ }` (`WorkspaceMenu.tsx` 153). Failed delete is not an honest row error.
- Reopen with a cached list skips the spinner (`listLoading && workspaces.length === 0` only). Stale rows stay until fetch returns.
- No vitest, no web/desktop shot.
- Twin-screen copy: sidebar empty is still "No saved sessions", menu empty is "No sessions yet".
- Tests were not executed here.

## Slice outcome

Named menu acceptance A1-A7 pass in `src/views/WorkspaceMenu.tsx`. Phase B / Place-grain Sessions sidebar (B1) fail. No live share in the switcher. Header still a 32px / 280px picker, not a collab console.

Verifier did not Accept. Manager decides.
