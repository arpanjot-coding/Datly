# Independent verify: C-wf-local-replay

Slice: `C-wf-local-replay` (listener follow-on to `C-wf-replay-target` in `docs/lifecycle/work-packages/F-workflow-db-W.md`). Writer sidecar `docs/test-runs/.worker-done/C-wf-local-replay.md`. Verifier did not write the slice. Static read of `src/views/SimpleChartRecBox.tsx` only. Tests not executed. No Accept.

Named acceptance (dispatch): tables kind with loaded tables and no focus does `setFocused` plus `seedTableId` and starts `exploreFromChat`; no tables toasts `replayNoData`; connector kind uses `allowUnfocused`; busy toasts `replayBusy`.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 Tables kind, loaded, no focus: setFocused + seedTableId, starts exploreFromChat | Pass | Matches writer sidecar. Same-tick run is not blocked by the stale `focusedTableId` closure. | Listener `SimpleChartRecBox.tsx` 1801-1859. After busy and connector gates, `tables.length === 0` is already false. When `!focusedTableId`, `seedTableId` is `inputTables[0]?.id` else first `DictTable` without `derive` else `tables[0].id` (1836-1840). Then `dispatch(dfActions.setFocused({ type: 'table', tableId: seedTableId }))` (1848). Info toast `knowledge.replayStarted` then `exploreFromChat(prompt, undefined, undefined, seedTableId ? { seedTableId } : undefined)` (1850-1855). `exploreFromChat` opts include `seedTableId` (732). Comment at 735: seed is for same-tick focus. `runFocusedTableId = focusedTableId \|\| exploreOpts?.seedTableId` (737). Early return only if no `runFocusedTableId` and not empty and not `allowUnfocused` (738). With seed, the run starts. Selected-table empty check also skips return when `exploreOpts?.seedTableId` is set (764). | n/a |
| A2 No tables: replayNoData | Pass | Matches. Empty workspace does not start a tables-kind replay. | After connector branch, `if (tables.length === 0)` dispatches error `t('knowledge.replayNoData')` and returns (1829-1834). No `exploreFromChat`. Dead-end if `tables` is non-empty but seed resolve is empty: same toast (1841-1846). Connector kind is checked first (1819), so empty workspace still reaches A3, not this toast. | n/a |
| A3 Connector: allowUnfocused | Pass | Matches. Focused table is not required for connector kind. | `connectorKind = detail?.target?.kind === 'connector' && Boolean(detail.target.connectorId)` (1819). Then info `knowledge.replayStartedConnector` and `exploreFromChat(prompt, undefined, undefined, { allowUnfocused: true })` then return (1820-1827). Gate in `exploreFromChat` allows through when `exploreOpts?.allowUnfocused` (738, 764). Empty `tables` does not block this branch. | n/a |
| A4 Busy: replayBusy | Pass | Matches. Second run is refused with toast, including connector. | First check after missing prompt: `if (isChatFormulating)` error `t('knowledge.replayBusy')` and return (1812-1817). Listener deps include `isChatFormulating` (1859). No `exploreFromChat`. Order is before connector and tables, so busy wins. | n/a |

## Slice outcome

Named acceptance A1-A4 Pass. Tables-kind replay with data and no focus focuses the first source/input table, passes `seedTableId`, and starts `exploreFromChat`. Empty tables toast `replayNoData`. Connector kind starts unfocused. Busy toasts `replayBusy` and refuses.

Residual (not named fails): `askedFromNode` / `askedFromTable` still read `focusedTableId`, not `seedTableId` (801-810, 956-958), so a same-tick tables replay can parent the draft at `ROOTLESS_THREAD_ID` even though the run starts. Connector without `connectorId` falls through to the tables path. Empty `prompt` returns silently. `hasRunningAgent` is not the busy flag; only `isChatFormulating` is.

Verifier did not run vitest, typecheck, lint, or a live Knowledge Play click. Manager decides.
