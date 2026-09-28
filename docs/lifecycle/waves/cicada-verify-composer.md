# Independent verify: C-cicada-composer

Slice: `C-cicada-composer` in `docs/lifecycle/work-packages/F-cicada-ui-W.md`. Writer sidecar `docs/test-runs/.worker-done/C-cicada-composer.md`. Verifier did not write the slice. Static read only. Tests not executed. No Accept.

Named acceptance (package + dispatch): landing stacked `AgentChatInput` shows `ModelSelectionButton` `appearance="footer"`; thread `SimpleChartRecBox` shows the same footer model; `IslandHeader` no longer mounts `ModelSelectionButton`; `DataLoadingChat` has no model footer and stays inline; model still reachable from landing, thread, and model-wall inline.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 Landing stacked AgentChatInput footer model | Pass | Matches. Landing composer is stacked `AgentChatInput` with footer appearance. | Landing `IslandShell` mounts `dataUploadRequestBox` (`DataFormulator.tsx` 1063-1065) which renders `DataLoadMenu` (843-859). `DataLoadMenu` `agentChatBox` is `layout="stacked"` plus `footerSlot={<ModelSelectionButton appearance="footer" />}` (`UnifiedDataUploadDialog.tsx` 776-784). `AgentChatInput` only paints `footerSlot` in the stacked toolbar, left of send (`AgentChatInput.tsx` 119-121, 463-486). Footer chrome is `appearance === 'footer'` (`ModelSelectionDialog.tsx` 81, 735-736, 741-765). | n/a |
| A2 Thread SimpleChartRecBox same footer model | Pass | Matches. Thread composer uses the same footer appearance, not the header toolbar. | `DataThread.tsx` 3397 mounts `SimpleChartRecBox`. Footer row at `SimpleChartRecBox.tsx` 2372-2396: attach plus `<ModelSelectionButton appearance="footer" />`. Same component and appearance as landing `footerSlot`. | n/a |
| A3 IslandHeader no longer mounts ModelSelectionButton | Pass | Matches. Header model removal is the last composer step. | `IslandHeader.tsx` imports have no `ModelSelectionButton` (1-45). No `showModel`. Compact and full right clusters are settings / logs / language / exit only (501-558). Grep of `src/components/IslandHeader.tsx` for `ModelSelectionButton` is empty. | n/a |
| A4 DataLoadingChat no model footer; stays inline | Pass | Matches. In-session data-loading chat stays default inline and does not get a model footer. | Sole `AgentChatInput` in `DataLoadingChat.tsx` 1867-1898: no `layout`, no `footerSlot`, no `ModelSelectionButton`. Default `layout = 'inline'` (`AgentChatInput.tsx` 149). Inline branch does not render `footerSlot` (489-498). | n/a |
| A5 Model reachable landing + thread + model wall inline | Pass | Matches. Picker remains on landing and thread composers and on the first-select wall. Unwinding the model wall is out of scope. | Landing: A1 footer. Thread: A2 footer. Wall: `selectedModelId == undefined` overlay still mounts `<ModelSelectionButton appearance="inline" />` (`DataFormulator.tsx` 1113-1146). Remaining `src/` mounts are only those three plus the shared `ModelSelectionButton` definition. No leftover `appearance="toolbar"` callers. | n/a |

## Slice outcome

Named acceptance A1-A5 Pass. Footer model is on the landing stacked composer and the thread rec box. IslandHeader no longer mounts the picker. DataLoadingChat stays inline without a model footer. Model wall stays inline.

Verifier did not run vitest, typecheck, lint, or device shots. Residual (not named fails): stacked `footerSlot` sits in the right cluster next to send rather than after attach; `DataLoadMenu` also carries the footer when the upload dialog remounts the same menu; default `appearance` is still `'toolbar'` with no remaining caller.

Manager decides.
