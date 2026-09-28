# Plan review r2 (arch-expert) - F-cicada-ui-W

Plan: `docs/lifecycle/work-packages/F-cicada-ui-W.md`  
Reviewer: W5 [arch-expert] round 2. Report only. Do not edit product code.

No em dashes.

---

## Verdict

ok

Both r1 musts are closed in the chunk table. C-cicada-type and C-cicada-island can be implemented as written. No remaining must.

---

## 1. Prior musts

**Must 1 (TEXT_RAMP) is gone.** C-cicada-type Goal: bump the whole `TEXT_RAMP` at every density one step at the small end; reference `11/12/13/14/15/17/19` (`md=14`, `lg=15`); compact/comfortable/spacious in lockstep; keep 1-1-1-1-2-2. Acceptance: rhythm tests stay; no `DENSITY_SCALE` or `cardWidth` edits; do not edit only md and lg. That is the r1 plan change.

**Must 2 (island budget) is gone.** C-cicada-island Goal: `islandInset` 8 on `LayoutTokens`/`layoutFor`; `appBar` 44; rewrite `minimumShellBudget` height to tokenized `2*islandInset + appBar + minChartHeight + headerHeight + 3*rowHeight + padding`; omit tabBar from height; `shellChrome` on width only; budget uses `REFERENCE.islandInset` 8, never visual 16; `--df-island-inset` short → `tokens.islandInset` else 16px; rewrite the REFERENCE transcription comment. Acceptance names live **595** vs post-island identity **547**; 75 is `3*rowHeight(25)`, never 3×75; do not hardcode addends; comfortable still fails the floor (~630); header is `tokens.appBar` 44, not the 52px Toolbar; do not shrink `minChartHeight`. That is the r1 plan change.

---

## 2. Still no must? Can island + type ship as written?

Yes. Tokenized height at reference is 547 ≤ 600. Comfortable stays ~630 and the existing floor assertion stays false. Type bump keeps the rhythm test green. Stack is unchanged: MUI, `tokens.ts`, `DATLY_CHART_THEME`, Allotment, no Tailwind.

r1 shoulds that the manager also folded in (stay closed): `houseRevision` inside existing `computeCacheKey` JSON when `themeId` is null (no 13th arg); paper fills in both PNG downscalers; cards Depends recipes+island; qa Depends type plus LanguageScreen/model-wall overlay shots; titlebar insets as `pl`/`pr` on `IslandHeader`.

---

## must

None.

---

## should

- Keep `canvas.tabBar` as a token for phone Tabs. Island omits it from the height sum only; do not delete the field.
- C-cicada-tokens: add `status`, `surface.island`, `surface.plot` (plot may alias `surface.paper`) beside `xs`/`xl`/`island`. Leftover-blue grep stays chrome only; keep `#0078d4` / `#1565c0` inside `palettes.fluent` / `material`.
- Paths: `src/app/recipes.ts`; composites under `src/components/` (`IslandShell`, `IslandHeader`, `SegmentedPills`, `StatusPill`); ConfigDialog extract to `src/views/ConfigDialog.tsx`.
- C-cicada-charts: update `chartTheme.test.ts` plot off `#ffffff` and hues 2–5; keep 0–1 locked.

## nit

- Outer Allotment sash may stay transparent after pill-on-rect is gone.
- Charts Depends is tokens only; screenshots wait for island. Fine.
- Persist in tokens, house revision in charts remains a valid split.

Nits do not need another review round.

---

## Plan change (must)

n/a
