# UI-expert: F-model-card

Feature: F-model-card  
Role: ui-expert  
Session focus: desktop. Ship: web + desktop (same `ModelSelectionDialog`, no fork).  
Do not implement. Do not restyle the landing, composer, island, or other dialogs.

Markup SSOT: `docs/lifecycle/waves/model-card-markup.png` (current dialog, no red callouts).  
Refs: `src/views/ModelSelectionDialog.tsx`, `src/app/tokens.ts`, `src/app/layout.ts` (`textVar`, `dialogWidth` / `dialogHeight`), `ui-craft.md`, `desktop-react-ui.md`, skill `design-ui` (appearance after frame lock).

Stack: TypeScript + React + MUI + existing tokens. No Tailwind, no shadcn, no new palette.

## Markup (diagnose from shot + code)

Shot: Models dialog over landing. Four list rows, selected `claude-sonnet-4-20...` + Current. Right pane title `claude-sonnet-4-20250514`, Test model, Copy details, then Provider / Model / API Key. Footer Cancel + contained `Use anthropic/claude-sonnet-4-20250514`. Composer and data chips stay behind the modal.

| Symptom | Cause in `ModelSelectionDialog.tsx` |
|---------|-------------------------------------|
| Left list truncates ids | List column `minmax(220px, 0.75fr)`. Row title `Typography` `noWrap` on `model.model`. Long ids ellipsize (`claude-sonnet-4-20...`) while the same string is fully visible in the form. |
| Use button is the full provider/model string and wraps the footer | `tempModelName = \`${endpoint}/${model}\`` fed into `t('model.useModel', { modelName })` (`en`: `Use {{modelName}}`). Contained primary in `DialogActions` grows with the interpolation. |
| Detail header crowded | One `space-between` row: long `subtitle1` title + outlined Test + text Copy details. No wrap, no `minWidth: 0` on the title. |
| Narrow list, wide empty form, leftover air | Grid `minmax(220px, 0.75fr) minmax(380px, 1.4fr)` inside `maxWidth="lg"` and `DialogContent` `minWidth: { sm: 720 }`. Form fields `fullWidth` in the fat column. Dialog does not use `dialogWidth` / `dialogHeight`. Gap `3`, list `pr: 2.5`, row `py: 1.25`. |

Keep: master-detail, Add Model, Test, Copy details, Provider / Model / API fields, Cancel, Use selected model. No new providers. No wizard. No second picker.

## 1. Meaning

Pick and inspect a model, then commit it, with ids readable in the list and a footer CTA that does not restate the whole `provider/model` string.

Who: desktop analyst on the first-run model wall (`DataFormulator` overlay, `ModelSelectionButton appearance="inline"`) or later from the landing/composer footer pill (`appearance="footer"`).

Entry → steps → success: open Models → read full ids in the master list → inspect details (Test / Copy) → Use selected model.

Out of scope: new providers; LiteLLM wizard; a second picker; header chrome; LanguageScreen; composer as this dialog's job; restyling IslandHeader, AnvilLoader, or the landing primary send; store shape; `/api/agent/test-model` contract; `selectModel` persist key.

## 2. Place / plug-in

No new route. No store change. One dialog, all appearances.

| Job | Live plug-in | After |
|-----|----------------|-------|
| Dialog chrome | `ModelSelectionButton` in `src/views/ModelSelectionDialog.tsx`: `Dialog maxWidth="lg"`, content `minWidth` 720, `modelManagerView` grid | Same Dialog. Size via `dialogWidth` / `dialogHeight`. Tighter split. |
| Master list | `allModels.map` rows: `noWrap` title + provider caption + Current + remove | Same rows. Readable ids. Add Model stays the last row. |
| Detail | Header + `addModelForm` (Provider, Model, API Key, Azure extras) | Same fields and edit/copy/test paths. Header wraps. |
| Commit | `DialogActions` Cancel + `dfActions.selectModel(tempSelectedModelId)` | Same dispatch. Short primary label. |
| Triggers | Toolbar default; landing wall `appearance="inline"`; composer / upload `appearance="footer"` (`SimpleChartRecBox`, `UnifiedDataUploadDialog`) | Triggers unchanged. Do not restyle the footer pill or make it the page CTA. |

Model wall stays `DataFormulator.tsx` overlay `zIndex: 1000` when `selectedModelId == undefined`. LanguageScreen stays above it. Do not fold the dialog into the wall card.

## 3. Approach

Layout first (SHAPE). Tokens only. Appearance (`design-ui`) after the frame is locked: type via `textVar` / `iconVar`, surfaces via existing `borderColor` / `radius` / `surface`, no second visual language.

### Frame (column widths + dialog size)

Stop using MUI `lg` as the paper width. The form does not need a 1.4fr field column.

```text
Paper:  dialogWidth(800) × hug content, cap dialogHeight(560)
        paper scroll = DialogContent only; actions stay pinned

Grid:   sm+:  280px  |  minmax(0, 1fr)
        xs:   1fr stacked (unchanged collapse)

280px = layout REFERENCE.sidebar.default. List is a named column, not 0.75fr of a wide dialog.
Right pane is the remaining ~440–480px, which is enough for labeled fields without a vacant slab.
```

Concrete sx (tokens, not magic hex):

- `Dialog` paper: `width: dialogWidth(800)`, `maxHeight: dialogHeight(560)`. Drop `maxWidth="lg"` and `DialogContent` `minWidth: 720`.
- `modelManagerView` columns: `{ xs: '1fr', sm: '280px minmax(0, 1fr)' }`. Gap `2` (8px grid), not `3`.
- List pane: `pr: { sm: 1.5 }`, keep the hairline `borderColor.divider` (replace theme `'divider'` with the token already imported).
- List row: `py: 1`, `px: 1`. Keep selected `action.selected`.
- Form: stay `fullWidth` **of the right pane**. Do not add a third column or a max-width inner well that orphans the fields.
- Paper hugs height (`alignItems: 'flex-start'` on the scroll body). Empty air under three fields is a too-tall dialog, not missing widgets.

Min window (`MIN_SUPPORTED` 1024×600, desktop law): `dialogWidth` / `dialogHeight` already clamp to `100vw/vh - DIALOG_VIEWPORT_MARGIN` (64). Primary Use must remain visible; body scrolls if Azure advanced + keys expand.

### List (wrap, then tooltip)

Do not keep `noWrap` as the only strategy. The list's job is to show the id.

- Primary line: `model.model`, `textVar.sm`, weight 600, `overflowWrap: 'anywhere'`, clamp at **2 lines** (box clamp or equivalent). `minWidth: 0` already on the text cell; keep it.
- Secondary line: provider `textVar.xs`, `color: text.secondary`, single line `noWrap` (short tokens: anthropic, azure, ollama, openai).
- `Tooltip` on the row (or the title) with the full `model.model`. Tooltip is the overflow fallback, not a substitute for readable type.
- Current caption stays; it must not steal width from the id (`flex-shrink: 0` on the status cell). Remove icon stays `iconVar.sm` + existing `aria-label`.
- Add Model: unchanged text button, `justifyContent: 'flex-start'`.

Do not put provider/model as a single concatenated list title. Master is model id; detail repeats it.

### Header row

One column of identity, one cluster of secondary actions. Allow wrap.

```text
[ title wraps, textVar.lg, minWidth 0 ]     [ Test model  outlined ]
[ Server managed caption ]                  [ Copy details  text  ]
```

- Container: `display: flex`, `flexWrap: 'wrap'`, `alignItems: 'flex-start'`, `justifyContent: 'space-between'`, `columnGap: 1`, `rowGap: 1`, `mb: 2`.
- Title group `flex: '1 1 12rem'`, `minWidth: 0`. Title may wrap (`overflowWrap: 'anywhere'`). No `noWrap`.
- Action group `flex: '0 0 auto'`, `display: flex`, `gap: 1`, `ml: 'auto'`. Keep **labeled** Test and Copy details (job: keep Test, Copy details). Do not icon-only unless a later shot proves 800px still collides; labeled small buttons wrapping under the title is the intended overflow.
- Test stays outlined, status color as today (`ok` / `error` / testing spinner). Copy stays text + `ContentCopyOutlined`. Edit (user models) stays in that same cluster.
- Do not move Test into `DialogActions`. Use is the only primary.

### CTA copy

Footer primary must not interpolate `endpoint/model`.

- Label: **Use selected model** (new key e.g. `model.useSelectedModel`). Stop passing `tempModelName` into `model.useModel`.
- Confirmation of *which* model: list Current + detail title. One primary CTA (`ui-craft` §5).
- Button: `whiteSpace: 'nowrap'`, `flexShrink: 0`. Cancel stays text.
- `disabled={modelNotReady}` unchanged (`isModelReady`: tested `ok`, or global + `unknown`).
- Edit mode footer (Show keys, Cancel, Test and save) unchanged.

Update `model.useSelectedModel` in every locale tree that already has `model.useModel` (alignment tests). Do not leave English-only.

Disabled reason: keep current gate; do not add extra helper copy this job unless Test failed and Use is disabled with no hint (existing Test button color already speaks).

### Appearance after frame lock (`design-ui`, tokens only)

Do this only after widths / wrap / CTA are in:

- Type from `textVar` (list sm, caption xs, header lg, actions inherit small). Drop one-off `subtitle1` / `0.75rem` in `inputSx` if those fields are touched; prefer `size="small"` + `textVar.sm`.
- Icons from `iconVar.sm` (already used on Test spinner).
- Surfaces: dialog paper stays theme paper on the existing overlay. List hairline `borderColor.divider`. Selected row stays `action.selected`. Primary contained stays forest (`palettes.cicada`). Radius `radius.md` on the dialog, `radius.sm` on nested controls. No new shadow recipe.
- Anti-slop: no extra hue, no gradient, no decorative well, no second font, no new icon set.
- Motion: existing hover on rows; `transition.fast` if any new hover. Honor reduced motion via current theme.

Do not restyle `ModelSelectionButton` footer pill (`height: 28`, `maxWidth: 180`, `radius.pill`). That is composer chrome, not this modal. Landing primary remains `AgentChatInput`.

### Do not

- Fork a desktop dialog.
- Add a provider gallery, search, or second Autocomplete as the picker (Recent configurations stays edit-only).
- Put Use on the list row.
- Change `simpleHash` ids, `TEST_MODEL` body, or `selectModel` localStorage `df_selected_model`.
- Touch LanguageScreen, header cluster, or loader.

## 4. Verdict: SHAPE

Layout only. Same master-detail dialog, same fields, same commit. Blast small. Plug-in is one file plus locale strings for the short CTA.

Not ASK: the shot plus the four listed defects are enough; no IA or store decision. Not UNFIT: matches house (MUI dialog, tokens, one primary CTA). FIT is not claimed until the split, wrap, header, and CTA are implemented and shot.

## 5. Risks / unified plan must not break

- **Keys:** `showKeys` switch, `CONFIGURED_SECRET_MASK`, `DISABLE_DISPLAY_KEYS`, password fields in edit. Copy details still starts a new user model with empty `api_key`. Do not log or copy live secrets. Do not change `auth_mode` / Azure CLI.
- **Test:** `testModel` and `handleSaveModel` still POST `getUrls().TEST_MODEL`. Testing disables Test; `updateModelStatus` still drives ok/error/testing. Do not auto-test on open (first-run wall must not fire a storm).
- **selectModel:** Use still `dispatch(dfActions.selectModel(tempSelectedModelId))` then close. List click still sets `tempSelectedModelId` via `loadModelDetails`. Do not write `selectedModelId` on mere inspect. Persist key `df_selected_model` unchanged.
- **First-run model wall:** Overlay when `selectedModelId == undefined` (`DataFormulator.tsx`). Inline trigger copy `landing.firstSelectModelPrefix` + button. `useEffect` auto-selects `models[0]` when a model exists and none is selected; do not change that gate. LanguageScreen stays above the wall. After Use, wall must unmount.
- **Ready gate:** `isModelReady` (ok, or global unknown) still disables Use. Do not let layout copy imply a model is in use before dispatch.
- **i18n:** New CTA key in all locale `model.json` files. Keep `t('model.addModel')`, `testModel`, `copyDetails`, `cancel`, field labels.
- **Web + desktop:** Same dialog. Min-size: Use visible; no permanent horizontal clip. Keyboard: tab list → fields → Cancel → Use. Dialog `onClose` still blocked while `isAddingModel`.
- **Composer:** Footer `ModelSelectionButton` stays a quiet pill, not a second landing CTA.

## 6. Suggested chunks

- W-model-frame
- W-model-list
- W-model-cta
