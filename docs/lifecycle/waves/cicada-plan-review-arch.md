# Plan review (arch-expert) - F-cicada-ui-W

Plan: `docs/lifecycle/work-packages/F-cicada-ui-W.md`  
Reviewer: W5 [arch-expert]. Unified plan vs Wave A `cicada-arch-expert.md` + live `layout.ts` / `chartCache.ts` / `store.ts`. Report only. Do not edit product code.

No em dashes.

---

## Verdict

must-fix

Two Goal/Acceptance lines cannot be implemented as written. Stack is otherwise the Wave A SHAPE restyle (MUI, tokens, house Vega, Allotment). Nits do not need another round.

---

## 1. Stack: MUI, tokens, DATLY_CHART_THEME, Allotment, no Tailwind?

**Yes.** The package keeps the live kit. Out of scope names Tailwind / shadcn / a second component kit. Verdict: not UNFIT if those seams stay. Chunks match that:

| Seam | Plan |
|------|------|
| MUI | `createDatlyTheme` extracted to `src/app/theme.ts` (C-cicada-tokens). Overrides in C-cicada-recipes. No new CSS-in-JS kit. |
| `tokens.ts` | Expand primitives; keep `radius.sm` 1.5. Recipes are `SxProps` only. Composites are the four names, not a parallel library. |
| `DATLY_CHART_THEME` | C-cicada-charts revises the house object. `assembleVegaChart` / encodings / Flint `THEME_PRESETS` stay. |
| Allotment | Panes stay. Tokens retint `--df-focus-border`. Outer `--separator-border` stays transparent. |
| Tailwind | Explicit non-goal. |

Also kept: existing places (landing / workspace / About), sidebar `sources \| sessions \| knowledge`, `viewMode` Explore/Reports, LanguageScreen gate, model wall, agent as sidecar. Destack is the Wave A order: theme extract (tokens) → ConfigDialog extract (recipes) → IslandHeader + mechanical WorkspaceMenu (island). Later chunks do not all edit `App.tsx`.

UNFIT forks from Wave A are still out of scope: chat-only IA, all-forest series, `radius.sm` 1.5→2, Sessions delete, Night/dark, Google Sans, package rename.

---

## 2. Is the 547 vs 595 budget honest?

**547 as the post-island reference identity is arithmetically honest. The package is not honest about live vs target, and the island chunk as written invites a literal 547 that cannot ship.**

Live `minimumShellBudget` (`src/app/layout.ts` 457–461) is **595**, not 547:

```
height = appBar(48) + shellChrome(24) + minChartHeight(360)
       + header(32) + 3 * rowHeight(25) + tabBar(36) + padding(20)
       = 595
```

Headroom vs `MIN_SUPPORTED.height` 600 is 5px. Live Toolbar is **52** (`App.tsx` 1213–1214). The book uses 48. Real chrome is 4px tighter than the test models. `canvas.tabBar` 36 is phone-only (`max-width: 699`) and is still in the desktop 600px sum.

Published island identity (correct if 75 means `3 * rowHeight` 25, tabBar omitted, vertical chrome = `2 * islandInset` 8):

```
2*8 + 44 + 360 + 32 + 75 + 20 = 547
```

547 ≤ 600 (53px headroom). Width unchanged: `rail + threadPaneWidthFor(1) + canvas.min + shellChrome` = 40+280+500+24 = 844 ≤ 1024.

Deltas vs live 595: appBar 48→44 (−4), vertical chrome 24→16 (−8), omit desktop tabBar 36 (−36). 595−48 = 547.

**What the unified plan gets wrong (honesty, not the 547 sum):**

1. It never names **595** as live. C-cicada-island says "update tests to 547" as if 547 were the current book.
2. Acceptance "Live Toolbar is not 52" is false about today. After island it is a post-condition (no 52px Toolbar). As written it reads as a live-code claim.
3. `75` is a bare literal. Wave A: `3×row(75)` is easy to misread as 3×75=225 → 697, which **fails** 600. The island acceptance sum happens to use 75 as a number (safe if copied) but never says `3 * rowHeight (25) = 75`.
4. Goal does not say to **rewrite** `minimumShellBudget`. A worker who only sets `appBar: 44` still has height 591. A worker who pastes `2*8+44+360+32+75+20` as literals makes comfortable `fitsHeight` true at 547 and the existing test "comfortable does not fit a floor viewport" fails or gets deleted. Tokenized comfortable is ~630 and must keep failing the floor.
5. Visual 16px (`heightClass !== 'short'`) is correctly absent from the 547 sum, but the plan never says budget stays on `REFERENCE.islandInset` (8) while `--df-island-inset` is 16 when not short.
6. `layout.ts` still says REFERENCE is a transcription of today's hardcoded app. Changing `appBar` 48→44 without rewriting that comment is the "fix REFERENCE in place" fork Wave A flagged.

547 itself is the right target **after** C-cicada-island, if the function stays tokenized, tabBar stays a token for phone Tabs, `minChartHeight` stays 360, and `shellChrome` stays 24 on **width** only.

---

## 3. must / should / nit

must = cannot implement as written.

### must

1. **C-cicada-type `TEXT_RAMP` "md=14 lg=15 only".** `layout.test.ts` `keeps the ramp rhythm at every density` locks shape `[1,1,1,1,2,2]`. Editing only reference `md`/`lg` yields `10/11/12/14/15/16/18` (shape `[1,1,2,1,1,2]`). Compact stays `[1,1,1,1,2,2]`. The test fails. `layout.ts` forbids that deformation. Design SSOT is a one-step bump of the whole ramp at every density: reference `11/12/13/14/15/17/19` (md=14, lg=15), compact/comfortable/spacious in lockstep.

2. **C-cicada-island budget line.** Acceptance `2*8+44+360+32+75+20=547` plus "update tests to 547" plus "Live Toolbar is not 52" does not rewrite `minimumShellBudget`, does not add `islandInset` to `LayoutTokens` / `layoutFor`, does not drop `t.canvas.tabBar` from height, and invites hardcoded addends. Hardcoded 547 makes comfortable fit the floor (lie). Keeping the old function cannot equal 547 without shrinking `minChartHeight` (forbidden) or collapsing `shellChrome` into 16 (width and height share that token). Cannot land the island chunk as written without inventing the Wave A formula.

### should

- **C-cicada-charts cache key.** Bake `houseRevision: themeId ? null : HOUSE_THEME_REVISION` inside the existing `JSON.stringify` payload. Do not add a 13th positional arg (call sites forget it). Signatures of `computeCacheKey` and `assembleVegaChart` stay. Update `chartTheme.test.ts`: keep hues 0–1 `#1f6b4a` / `#b4532a`; change plot off `#ffffff`; lock 2–5 as slate/ochre/steel/plum. Paper fills in **both** `downscaleImageForAgent` and `ChartRenderService.scalePngDown`.
- **C-cicada-tokens primitives.** Add `status`, `surface.island`, `surface.plot` (plot may alias `surface.paper`). Leftover-blue grep is chrome only (`#007fd4|#0288d1|#1976d2|25, 118, 210`); keep `#0078d4` / `#1565c0` inside `palettes.fluent` / `material`. Neighborhood file list (Allotment, DataSourceSidebar selected, VisualizationView hover, AgentRules, MarkdownEditor, DataView, MessageSnackbar) is the tokens chunk, not a later surprise. Persist v5 + blacklist `chartThumbnails` in this chunk is correct (today `store.ts` blacklist omits them; `useAutoSave` already excludes).
- **C-cicada-island desktop chrome.** Traffic/caption from `electronTitlebarInsets()` become `pl`/`pr` on `IslandHeader`, not a ghost AppBar. Sage inset + header stay `drag`; same `no-drag` list on new pills, workspace card, Auth. `--df-island-inset` is the single sage-facing inset for workspace **and** sidebar (do not hardcode 8px on the rail and 16px on the canvas). Keep `canvas.tabBar` for phone Tabs.
- **C-cicada-cards Depends.** Depend on recipes (`cardRecipeSx`) and island (vis pane already off `radius.pill`) so DataLoadingChat ~1922 does not race the vis pane.
- **C-cicada-qa Depends.** Add C-cicada-type (LanguageScreen / leftover surfaces). Optional first-run overlay shots so the picker and model wall are not a second visual language. Grep gate stays chrome-only.
- **Paths.** `src/app/recipes.ts`. Composites only under `src/components/`: `IslandShell`, `IslandHeader`, `SegmentedPills`, `StatusPill`. ConfigDialog extract to `src/views/ConfigDialog.tsx`.
- **Parallel sidebar ∥ composer.** Default already sequences composer last so IslandHeader model removal is last. Keep that. Do not add a model footer on `DataLoadingChat`.
- Hex that is not in tokens / cicada palette / house theme does not ship.

### nit

- "Live Toolbar is not 52" (once must #2 is patched) should read: in-island header is `tokens.appBar` 44, not the 52px Toolbar.
- Order lists cards → charts; charts Depends is tokens only. Starting charts after tokens is fine; screenshots wait for island.
- C-cicada-settings can stay off the qa Depends list; palettes are not in the named shots.
- `appBar.explore` / `reports` already exist; settings chunk is right not to stub English into ja/ko/fr/de.
- Outer Allotment sash may stay transparent after pill-on-rect is gone; do not restyle it into a thick Cicada bar.
- Persist in tokens, `HOUSE_THEME_REVISION` in charts is a valid split. Do not land a 13th cache-key arg in tokens "to get ahead."

Nits do not require another round.

---

## Plan change (must)

**C-cicada-type** Goal: replace `TEXT_RAMP reference md=14 lg=15 only` with: bump the whole `TEXT_RAMP` at every density one step at the small end so reference is `11/12/13/14/15/17/19` (`md=14`, `lg=15`), compact / comfortable / spacious in lockstep, keeping the 1-1-1-1-2-2 rhythm. Do not edit only `md` and `lg`. Acceptance already: no `DENSITY_SCALE` or `thread.cardWidth` edits. Rhythm tests stay.

**C-cicada-island** Goal/Acceptance: replace "Update minimum screen budget tests to 547" and "Budget formula 2*8+44+360+32+75+20=547. Live Toolbar is not 52." with:

Live `minimumShellBudget` is **595** (book `appBar` 48 + `shellChrome` 24 + 360 + 32 + `3 * rowHeight` 25 = 75 + `tabBar` 36 + 20). Live Toolbar is 52; the book is 48. **547 is the post-island reference identity, not live.**

Rewrite `minimumShellBudget` height to tokenized:

```
2 * t.islandInset + t.appBar + t.canvas.minChartHeight
+ t.grid.headerHeight + 3 * t.grid.rowHeight + t.canvas.padding
```

Reference identity: `2*8 + 44 + 360 + 32 + 75 + 20 = 547`. 75 is `3 * rowHeight` (25), never 3×75. Do not hardcode the addends. Omit `t.canvas.tabBar` from height; keep the token for phone Tabs. `shellChrome` stays 24 on **width** only. Add `islandInset: 8` to `LayoutTokens` and scale it in `layoutFor`. Budget uses `REFERENCE.islandInset` (8), never visual 16. `LayoutProvider` publishes `--df-island-inset`: `heightClass === 'short'` → `tokens.islandInset`, else `16px`. Do not shrink `minChartHeight`. Keep `describe('minimum screen budget')` comfortable-does-not-fit (~630). Rewrite the REFERENCE file comment (it is no longer a transcription of the pre-island app). In-island header is `appBar` 44, not the 52px Toolbar. CTA still visible at 1024×600.
