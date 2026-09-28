# Independent verify: C-wf-distill-cta

Slice: `C-wf-distill-cta` in `docs/lifecycle/TRACKING.md` (Honest distill CTA: chat first then save). Writer sidecar `docs/test-runs/.worker-done/C-wf-distill-cta.md` (`done: true`; files: `src/views/KnowledgePanel.tsx` only). Verifier did not write the slice. Static read of source only. Typecheck / lint / build / vitest not run. No Accept.

Named acceptance (dispatch + writer): Workflows ActionRow always visible; disabled + why when no workspace / no model / no chat leaf; Distill/Update still the primary when `canDistillFromSession`; Play still opens the run-target dialog; `t()` `defaultValue`, no 21-locale campaign required.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 Workflows ActionRow always visible | pass | Matches. Workflows CTA is not hidden when the user cannot distill. Disabled look replaces omit. | `renderActionRow` for `category === 'workflows'` always returns an `ActionRow` (`KnowledgePanel.tsx` 739-785): disabled+hint when `!canDistillFromSession` (747-768), busy row when `sessionDistilling` (770-777), else enabled Distill/Update (779-785). Mount `{!state.loading && renderActionRow()}` (819) is the same gate as Rules, not a can-distill hide. Comment at 748-750: keep the save-workflow CTA visible. | n/a |
| A2 Disabled + why: no workspace | pass | Matches. First why is workspace. | `canDistillFromSession = hasDistillableSession && !!selectedModel && !!activeWorkspace` (618). When false, `why` is `!activeWorkspace` then `t('knowledge.distillNeedWorkspace', { defaultValue: 'Open or create a workspace first' })` (750-753). `ActionRow` `disabled` + `hint={why}` (762-766). Disabled row has no `onClick`; `pointerEvents: 'none'` (88-104). | n/a |
| A3 Disabled + why: no model | pass | Matches. Second why is model, after workspace. | Else branch `!selectedModel` then `t('knowledge.distillNeedModel', { defaultValue: 'Pick a model first' })` (754-757). `selectedModel = allModels.find(m => m.id === selectedModelId)` (617). Workspace is checked first so a missing workspace does not show the model copy. | n/a |
| A4 Disabled + why: no chat leaf | pass | Matches. Third why is chat leaf after workspace and model. | Fallback `t('knowledge.distillNeedChat', { defaultValue: 'Chat an analysis in this session first, then save it as a workflow' })` (758-760). Leaf predicate `hasDistillableSession` (610-615): some `isLeafDerivedTable` with `buildLeafEvents(...) != null` (comment 607-609: distillable chain / user message). Same predicate as enable-state. | n/a |
| A5 Distill/Update still primary when canDistillFromSession | pass | Matches. List primary stays Distill or Update. Run is not a second contained list CTA. | When `canDistillFromSession` and not busy: enabled `ActionRow` label Distill or Update from `sessionWorkflow` (740-743, 779-784), `onClick` `openSessionDistillDialog(updateMode)` (783). Busy keeps the same row with distilling copy (770-777). Play on items stays `IconButton` + `PlayArrowIcon` (687-701), not a contained primary. Distill dialog still `SessionDistillDialog` (856-861). | n/a |
| A6 Play still opens run-target dialog | pass | Matches. Play is not collapsed into Distill. Zero-table Play still opens the sheet. | Workflows play `onClick` `e.stopPropagation(); setRunItem(item)` (692). No `tables.length` disable. `WorkflowRunTargetDialog` mounted with `item={runItem}` (863-868). Dialog `open = !!item` (147). Confirm still `onRun` / `handleReplay` (635-648). | n/a |
| A7 t() defaultValue; no 21-locale campaign | pass | Matches. New why keys use `defaultValue`. Locale leaves not required for this slice. | New keys only at 751-760: `knowledge.distillNeedWorkspace` / `distillNeedModel` / `distillNeedChat` each with `defaultValue`. Distill/Update/busy labels also pass `defaultValue` (734, 742-743, 774). Writer files list is only `KnowledgePanel.tsx`. Grep `distillNeed` under `src/i18n` is empty. Existing `distillFromSession` / `updateFromSession` strings in locale `common.json` files are pre-existing, not a new 21-leaf campaign. | n/a |

## Missing / wrong / extra

- Missing vs named acceptance: none.
- Wrong: none.
- Extra vs this slice, not fail: ActionRow is omitted while `store.stateMap[category].loading` (819), same as Rules; busy distilling row stays clickable (775); Distill/Update labels still resolve from existing locale keys when present.

## Evidence notes

- Path: `src/views/KnowledgePanel.tsx`. Writer sidecar: `docs/test-runs/.worker-done/C-wf-distill-cta.md`.
- No command, no shot. Reviewer did not run typecheck, lint, build, or vitest.

## Slice outcome

A1-A7 pass. Workflows ActionRow stays on screen when distill is blocked, with workspace then model then chat why. Distill/Update remains the list primary when `canDistillFromSession`. Play still opens `WorkflowRunTargetDialog`. New copy uses `t()` `defaultValue` without a 21-locale campaign.

Verifier did not Accept. Manager decides.
