# Arch-expert: F-cicada-ui

Feature: F-cicada-ui (Cicada chrome + chart house restyle).  
Role: `[arch-expert]`. Report only. Do not edit product code.  
Source: `docs/lifecycle/reports/cicada-ui-chart-redesign-2026-08-19.md`  
Checked: `src/app/tokens.ts`, `src/app/layout.ts` (`minimumShellBudget`), `src/app/chartTheme.ts`, `src/app/App.tsx` `createTheme`, `src/app/chartCache.ts`, `src/app/store.ts`, `src/app/stateMigrations.ts`.

No em dashes.

---

## Verdict

**SHAPE**

Not UNFIT. Not ASK. Meaning is a restyle of the live Datly workspace, not a new product and not a Cicada IA clone. Land it by extending MUI theme, `tokens.ts`, `DATLY_CHART_THEME`, Allotment, and existing panes. New files (`theme.ts`, `recipes.ts`, `IslandShell`, `IslandHeader`, `SegmentedPills`, `StatusPill`) are extractions and thin composites, not a second kit.

SHAPE rather than FIT because PR-3 must rebase `layout.ts` REFERENCE (today the book is a transcription of the hardcoded app; `appBar: 48` and vertical `shellChrome` are that record), destack `App.tsx` so later chunks do not collide, and keep recipes as `SxProps` only. If those seams hold, later `[arch-fit]` should score FIT.

---

## 1. Meaning

Restyle product chrome and the house Vega/Flint theme to the Cicada editorial-light language (sage field, cream islands, one forest accent, concentric radii, hairline borders, quiet motion).

Datly stays catalog + data thread + chart/grid canvas + optional report. The agent stays a sidecar composer. Shipping name stays Datly. Flask, assemble pipeline, encodings, and Flint `THEME_PRESETS` stay.

Out of scope: Tailwind/shadcn restack; Preview/Codex/Design / chat-only editor; IDE-01; dark mode; Google Sans; painting every series forest; renaming Python `data_formulator` / npm `data-formulator`.

---

## 2. Reuse (must)

| Seam | Live | Restyle does |
|---|---|---|
| MUI theme | `createTheme` in `src/app/App.tsx` ~1547; `soft` / `toolbar` already in `src/mui.d.ts` | Extract `createDatlyTheme` to `src/app/theme.ts`. Expand `components` overrides. Do not add a CSS-in-JS kit. |
| `tokens.ts` | `surface`, `palettes.cicada`, `defaultPaletteKey = 'cicada'`, `radius.sm = 1.5`, hairline `borderColor`, `floatingPillSx` | Own primitives only. Add `xs` / `xl` / `island`, `status`, `surface.island` / `plot`. **Keep `radius.sm: 1.5`.** |
| Vega / Flint house | `DATLY_CHART_THEME` in `src/app/chartTheme.ts`; `assembleVegaChart` `theme_spec: themeId ?? DATLY_CHART_THEME` | Revise that object. Signature of `assembleVegaChart` and `computeCacheKey` stay. Bake `HOUSE_THEME_REVISION` inside the JSON key when `themeId` is null. |
| Allotment | `DataFormulator.tsx` `fixedSplitPane`; `.outer-allotment` / `.inner-allotment` | Keep panes. Retint `--focus-border` to `--df-focus-border`. Keep outer `--separator-border: transparent` until pill-on-rect is gone. |
| Existing panes | Sidebar `sources \| sessions \| knowledge`; thread Allotment; vis/report canvas; phone Thread/Canvas tabs | Restyle in place. Keep Sessions. Keep About/App `TopNavButton`s. `viewMode` already exists for Explore/Reports. |

`recipes.ts` = `SxProps` only, no React. Composites live under `src/components/` (four names only). `layout.ts` owns density/geometry. Chart house owns Vega ink/type/structure, not a Datly fork of Flint.

---

## 3. Forks that would be UNFIT

| Fork | Why UNFIT |
|---|---|
| Tailwind / shadcn / new component library | Parallel design system. Stack constraint. P0 duplicate kit. |
| Chat-only IA (Preview/Codex/Design, hide encoding shelf, agent as only editor) | Product topology change, not chrome. Non-goal. |
| Paint all series forest / sage categorical only | Fails series discrimination (pie, stacked, multi-line). Task forbids restyling user encodings to forest-everything. Live hues 0–1 already forest + terracotta (`#1f6b4a`, `#b4532a`); job is hues 2–5. |
| Drop Sessions tab to mimic Cicada header workspace card | IA delete. Live rail is `sources \| sessions \| knowledge`. |
| Change `radius.sm` 1.5 → 2 | Global 6px → 8px on encoding, knowledge, upload, rules, ops cards. |
| New `computeCacheKey` positional arg for revision | Call sites can forget it. Bake inside existing signature. |
| Assemble-option / `addTooltips` / stretch / `displayRowsCache` edits | Compiler contract. Visual-only. |
| Dark / Night theme | Cicada kit bait. Explicit non-goal. |

---

## 4. Height budget (547 vs 600)

**Live `minimumShellBudget` (`src/app/layout.ts` 457–461) is not 547.**

```
height = appBar + shellChrome + minChartHeight
       + grid.headerHeight + 3 * grid.rowHeight + canvas.tabBar + canvas.padding
```

REFERENCE today: `appBar 48`, `shellChrome 24`, `minChartHeight 360`, `headerHeight 32`, `rowHeight 25`, `tabBar 36`, `padding 20`.

`48 + 24 + 360 + 32 + (3*25=75) + 36 + 20 = 595`. Headroom vs `MIN_SUPPORTED.height = 600` is **5px**. Tests in `layout.test.ts` `describe('minimum screen budget')` assert compact/reference `fitsHeight`, comfortable does not.

Live Toolbar is 52px (design doc). The book uses 48. Real chrome is 4px tighter than the test models.

**Proposed island formula (PR-3) is 547, and the addition is correct if 75 means 3×rowHeight(25):**

```
2 * islandInset(8) + appBar(44) + minChartHeight(360)
+ header(32) + 75 + padding(20)
= 16 + 44 + 360 + 32 + 75 + 20
= 547
```

547 ≤ 600 (53px headroom). Width formula unchanged: `rail + threadPaneWidthFor(1) + canvas.min + shellChrome` = 40+280+500+24 = 844 ≤ 1024.

Deltas vs live 595: appBar 48→44 (−4), vertical chrome 24→16 (−8), omit desktop `canvas.tabBar` 36 (−36). 595−48 = 547.

**What is wrong in the design prose (label, not the 547 sum):**

1. `3×row(75)` is easy to misread as 3×75=225. Live `grid.rowHeight` is **25**. 3×25=75. If a worker multiplies 3×75 the budget becomes 697 and **fails** 600. Write `3 * rowHeight (25) = 75` in `minimumShellBudget` and in the test.
2. "16px inset + 48px header overruns 600" is **false** for the proposed desktop formula (drop tabBar): `2*16 + 48 + 360 + 32 + 75 + 20 = 567 ≤ 600`. It overruns only if `tabBar` 36 stays: 603. Visual 16px (`heightClass !== 'short'`) is correctly **not** in `minimumShellBudget`. Keep budget on `REFERENCE.islandInset` (8).
3. 547 is the **target after PR-3**, not live. PR-3 must rewrite the formula and the same `describe('minimum screen budget')` block. Do not "fix" REFERENCE in place without rewriting the file comment that says REFERENCE is a transcription of today's hardcoded app.

Comfortable still overruns (~630 on the island formula; live comfortable is higher because tabBar remains). Keep the "comfortable does not fit the floor" assertion.

---

## 5. Fit dimensions (design, not a diff)

| Dimension | Score | Note |
|---|---|---|
| Reuse | PASS | MUI, tokens, house theme, Allotment, panes, `viewMode`, persist `migrateState`. |
| Layering | PASS | Tokens → recipes (`SxProps`) → composites → views. Chart house stays in `chartTheme.ts`. No UI→Flask. |
| Conventions | SHAPE | `src/app` + `src/components` only. Rebase `layout.ts` REFERENCE comment when `appBar` becomes 44. i18n: en+zh only; no English stubs in ja/ko/fr/de. |
| Contracts | PASS | `assembleVegaChart` and `computeCacheKey` signatures unchanged. `appearance: 'footer'` additive in PR-5. |
| Design system | PASS if | Hex that is not in tokens / cicada palette / house theme does not ship. Leftover-blue grep is **chrome** only (`#007fd4|#0288d1|#1976d2|25, 118, 210`); keep `#0078d4` / `#1565c0` inside `palettes.fluent` / `material`. Series may use slate/steel. |
| Scope | PASS | Staged PRs. No backend schema. `/api/agent/chart-restyle` kept. |
| Testability | PASS | Budget tests, `chartTheme.test.ts` hues 0–1 locked, cache key `houseRevision` when `themeId` is null, persist v5. |

---

## 6. Risks (load-bearing)

| Risk | Why | Mitigation |
|---|---|---|
| `App.tsx` destack | `createTheme` is inline ~1547; ConfigDialog and WorkspaceMenu live in the same ~1.7k file. Six chunks on that file will conflict. | PR-1 extract `createDatlyTheme`. PR-2 extract `ConfigDialog`. PR-3 extract `IslandHeader` + mechanical `WorkspaceMenu.tsx`. Later chunks do not all edit `App.tsx`. |
| Persist `chartThumbnails` | `store.ts` blacklist is `serverConfig`, `globalModels`, `chartSynthesisInProgress`, `starterQuestionsStatus`. **Thumbnails persist today.** `useAutoSave` already excludes them; browser refresh rehydrates white/green PNGs. | Blacklist `chartThumbnails`. `DF_STATE_VERSION` 4→5 sets `chartThumbnails: {}`. |
| `HOUSE_THEME_REVISION` | `computeCacheKey` hashes `themeId` only. Default house is `undefined`, so ink changes do not bust the in-memory key. Revision does not exist yet. | Export revision from `chartTheme.ts`. Bake `houseRevision: themeId ? null : HOUSE_THEME_REVISION` inside existing JSON payload. Unit test. Do not add a 13th argument. PR-1 can land persist+key; PR-7 lands ink. |
| `radius.sm` stay 1.5 | Encoding/knowledge/upload/rules/ops already use 1.5. | Add `xs` / `xl` / `island`. Never 1.5→2. Kill `'3px'`/`'6px'` literals and `radius.pill` on rectangular panes (`DataFormulator` vis pane, `DataLoadingChat` ~1922) without touching `sm`. |

Also: desktop `.df-titlebar` drag must move to sage inset + island header (`no-drag` list unchanged). Model picker stays in `IslandHeader` until PR-5. `DataLoadingChat` does not get a model footer.

---

## 7. Suggested chunk ids

`C-cicada-tokens`  
`C-cicada-recipes`  
`C-cicada-island`  
`C-cicada-sidebar`  
`C-cicada-composer`  
`C-cicada-cards`  
`C-cicada-charts`  
`C-cicada-type`  
`C-cicada-settings`  
`C-cicada-qa`

Merge order: tokens → recipes → island → (sidebar ∥ composer) → cards → charts → type → settings → qa.

---

## Manager

SHAPE. Restyle, not a new product. Reuse MUI / tokens / `DATLY_CHART_THEME` / Allotment / existing panes. Tailwind, chat-only IA, and all-forest series are UNFIT. Live height budget is **595**, not 547; 547 is the PR-3 formula and is ≤ 600 if `3 * rowHeight` stays 75. Destack App.tsx. Blacklist thumbnails. Bake house revision in the cache key. Keep `radius.sm` at 1.5.
