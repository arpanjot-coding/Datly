# UI-expert: F-workflow-db

Feature: F-workflow-db  
Role: ui-expert  
Session: web + desktop. Ship: web + desktop (same Knowledge tab, no fork).  
Do not implement. Do not invent a KNIME canvas. Do not plan SaaS.

Refs read: `src/views/KnowledgePanel.tsx`, `src/views/SessionDistill.tsx`, `src/views/SimpleChartRecBox.tsx` (replay listener), `src/views/DataSourceSidebar.tsx` (Knowledge tab + connector list), `src/i18n/locales/en/common.json` (`knowledge.*`), `docs/lifecycle/feature-ask.md`, `ui-craft.md`.

Craft laws applied: workflow first, P0 states, one primary CTA, tokens/components from the system, twin-screen with SessionDistill, keyboard path on web + desktop.

---

## 1. Meaning

An analyst chats through an analysis, distills it into a reusable workflow, then runs that workflow on a chosen data target: the tables already in this session, or a connected database.

Who: analyst already in a workspace, Knowledge sidebar open.

Entry → steps → success:

1. Chat in the thread until there is a distillable leaf.
2. Knowledge → Workflows → Distill from this session (or Update from this session).
3. Later: pick a workflow in the same list → choose run target → Run on this data or Run on database.
4. Agent replays in the existing composer. Success is a started replay (toast + thread activity), not a graph of nodes.

Out of scope: node canvas, notebooks, SQL workbench as home, a second Knowledge route, catalog browsing inside the run sheet, rewriting distillation, SaaS/auth.

Capture is already the job. The missing job is **where** replay runs.

---

## 2. Place / plug-in

No new route. No new sidebar tab. Knowledge stays the third rail tab (`sources | sessions | knowledge`) in `DataSourceSidebar.tsx`.

| Job | Live plug-in | After |
|-----|----------------|-------|
| Capture | `SessionDistillDialog` + Workflows `ActionRow` (`Distill from this session` / `Update from this session`) | Unchanged. Keep dialog, trim notes, busy row, `open-knowledge-panel` after save. |
| List | Workflows section in `KnowledgePanel` | Same list and markdown editor. Replay no longer fires immediately from the play icon. |
| Run | Play `IconButton` → `handleReplay` → `df-replay-workflow` (disabled when `!hasTables`) | Play (always visible, labeled) opens a **run-target sheet**. Sheet owns the only contained primary. |
| Target: session tables | Implicit: focused table in `SimpleChartRecBox` | Explicit radio/option: current session tables. Disabled with why if none loaded. |
| Target: database | None | Same sheet: list saved connectors (`GET /api/connectors`, same `ConnectorInstance` as Sources). Pick one connected source. Do not embed the catalog tree. |
| Agent run | `SimpleChartRecBox` listens for `df-replay-workflow`, needs `focusedTableId`, toasts `replayBusy` / `replayNoData` / `replayStarted` | Same event. Detail gains `target`. Listener/BE adapt for connector; UI must not pretend tables exist if the user chose a connector. |
| Add connector | Sources tab + `UnifiedDataUploadDialog` | Sheet empty/disconnected points there. Do not duplicate the add-connector form in Knowledge. |

Sheet = existing MUI `Dialog` language (`SessionDistillDialog`: `maxWidth="sm"`, `fullWidth`, Cancel + contained primary). The repo has no `Drawer`. Do not add a bottom-sheet library.

Do not: new `/workflows` page, KNIME canvas, play that still requires loaded tables before the user can pick a connector.

---

## 3. Approach

Two screens, one family: Distill dialog (create/update) and Run sheet (replay target). Same title size (`textVar.xl`), hint (`textVar.xs` secondary), framed list, footer Cancel + one contained primary (`textTransform: 'none'`, `textVar.sm`).

### Capture (reuse)

Leave `SessionDistillDialog` and the Workflows action row as-is. Distill is the list's create/update action, not the run CTA. Do not merge distill and run into one dialog.

### List

Keep workflow rows (title, agent badge, delete on hover). Change the play control:

- Always visible (already not hover-only; keep that).
- `aria-label` = run this workflow (new key), not `replayNoData` while a connector could still work.
- Stop disabling solely because `tables.length === 0`.
- Click opens the run-target sheet with that `KnowledgeItem`. Row click still opens the editor.

One primary **per view**: the list's job remains browse + distill. Run is a per-item overlay, not a second contained button on every row.

### Run-target sheet

```text
Title:  Run workflow
Hint:   Choose data this workflow should run on.
Body:   ( ) Current tables in this session     n tables, names
        ( ) Database connector
            [connector rows: icon, display_name, connected|not]
Footer: Cancel    [Run on this data | Run on database]
```

Selection:

- Default: current tables if `hasTables`, else first **connected** connector, else connector option selected but CTA disabled.
- Current tables: helper shows count / focused table name. If none, helper is the empty copy; option stays visible.
- Connector: one selected instance. Disconnected rows are visible and not choosable for Run (or selectable with CTA disabled + why).
- Do not multi-select connectors. Do not pick catalog tables here. Loading a DB table stays Sources.

Primary CTA label follows selection (honesty, `button-contracts.md` via craft §5):

- Session tables → **Run on this data**
- Connector → **Run on database**

One contained button. Cancel is text. No second contained action.

On confirm:

1. Read workflow markdown (`store.read`) as today.
2. Dispatch `df-replay-workflow` with `{ prompt, title, target }` where `target` is `{ kind: 'session' }` or `{ kind: 'connector', connectorId, displayName }`.
3. Close sheet. Toast `replayStarted` (adapt copy if target is a connector).
4. If agent busy: keep sheet open, inline error (`replayBusy`). Do not fire.

`knowledge.replayPrompt` today says "currently loaded data". Session target can keep that. Connector target needs a sibling prompt (or interpolation) so the agent is not told to use loaded tables when the user chose a database. Copy change is this feature; 21 locales must get the new keys.

### P0 states (craft §4)

| State | Where | Copy / behavior |
|-------|--------|-----------------|
| Empty list | Workflows | Existing: Distill row if `canDistillFromSession`; else italic `knowledge.noItems`. No fake play. |
| Empty session data | Sheet | Current-tables option explains no tables loaded. CTA disabled if that option is selected. |
| Empty connectors | Sheet | Connector group: no connector yet. Quiet secondary "Add connection" switches sidebar to Sources (or opens upload). Not a second primary. |
| Loading | Sheet | Connector list spinner (same 16px pattern as category `state.loading`). |
| Error: disconnected | Sheet | Row shows not connected. CTA disabled with why. Point to Sources, do not silent-fail. |
| Error: replay | Sheet or toast | Busy: inline, sheet stays. Start failure: toast, sheet can close. Agent failure after start: existing thread/error toasts. Do not invent a canvas error surface. |
| Success | Toast + thread | Distill: existing `knowledge.distilled` + open panel. Run: started toast; results appear in the thread as today. |
| Overlay | Distill dialog, run sheet, editor, delete confirm | Unchanged stacking. Run sheet is another `Dialog` from KnowledgePanel. |

Disabled always explains why (tooltip or helper), never a dead play icon.

### Desktop + web

- Keyboard: tab to play, Enter opens sheet, radios, Enter/primary runs, Esc cancels. Focus trap is MUI Dialog.
- Play `aria-label` required (already).
- Web P0: Knowledge at ~375 (narrow sidebar) and ~1280. Sheet `fullWidth` `sm`; connector names wrap (`wordBreak`).
- Desktop: Dialog in renderer, not native window. `df-no-drag` already covers buttons. Titlebar insets unchanged.
- Motion: no new animation beyond Dialog. Honor existing reduced-motion.

### Do not

- KNIME / node canvas / DAG editor.
- New tab or Knowledge home.
- Catalog tree, SQL editor, or load-plan UI inside the sheet.
- Hover-only run on desktop (play is already always on; keep it).
- Hardcoded ActionRow hex restyle in this job (`#f1f1ef` is pre-existing).
- Tailwind / new component library. MUI + `textVar` / `iconVar` / existing `Dialog`.
- Make landing composer the workflow builder.

---

## 4. Verdict draft: SHAPE

Blast: small overlay on a live path. Capture is FIT already (`SessionDistill` + Knowledge list). Run-on-db is a sheet plus event `target`, not a new product.

Not FIT: play is "replay on current tables only" and is disabled with no tables, so the user cannot run on a database.

Not ASK: place is locked (Knowledge list + run-target sheet). Meaning is locked (chat → distill → run on session tables or a connector). Canvas is a locked skip.

Sacred contracts to keep: distill payload/budget, `findSessionWorkflow`, `open-knowledge-panel`, markdown editor, `df-replay-workflow` (extend detail, do not replace with a new event family unless BE proves the listener cannot take `target`).

---

## 5. Risks / unified plan must not break

- **Two primaries:** Distill ActionRow + contained Run on every row. Keep Run inside the sheet; list play stays an icon/control that opens the overlay.
- **Disable-without-tables:** if play stays `disabled={!hasTables}`, the database job is unreachable. Gate the **session** option, not the sheet.
- **Catalog in the sheet:** turns Knowledge into a second Sources. Pick a connector; load tables in Sources if the agent/BE needs a focused table first.
- **`focusedTableId`:** listener errors `replayNoData` without a focused table. Connector runs must not hit that path. Coordinate with W-wf-be; UI still sends `target`.
- **Busy agent:** fire-and-forget close loses `replayBusy`. Check busy before close, or keep the sheet for that error.
- **i18n:** new keys (`runTitle`, `runOnThisData`, `runOnDatabase`, `noConnector`, `replayOnConnectorPrompt`, …) in all 21 `common.json` leaves. Do not ship English-only on P0 CTAs.
- **Disconnected connector:** listing it as runnable looks like a hang. Connected only for the primary.
- **sample_datasets:** it is a connector. Allowed as "database" only if product treats it as a source; otherwise label by `type_name` / `display_name`, not a fake SQL server.
- **Twin-screen drift:** run sheet must not use a new palette or a full-bleed drawer.
- **SaaS leftover:** do not open auth or billing from this sheet.

---

## 6. Suggested chunks

- **W-wf-sheet** — Run-target `Dialog` on KnowledgePanel: session tables vs connector list (`GET /api/connectors`), play opens sheet, `df-replay-workflow` detail includes `target`.
- **W-wf-cta** — One sheet primary: Run on this data / Run on database; play always enabled enough to open the sheet; disabled reasons on the chosen option.
- **W-wf-states** — Empty (no workflow, no tables, no connector), loading connectors, disconnected, replay busy/fail toasts; EN + locale keys.

Proof later (not this wave): `web-knowledge-wf-empty-w375`, `web-knowledge-wf-run-sheet-w1280`, `desktop-knowledge-wf-run-sheet` with chrome.
