# Plan review (ui): F-cicada-ui-W

Job: F-cicada-ui. Plan: `docs/lifecycle/work-packages/F-cicada-ui-W.md`.
Reviewer: Wave C [ui-expert]. Report only. Prior note: `docs/lifecycle/waves/cicada-ui-expert.md`.

## Verdict

ok

## Ships the job?

Yes. Steal look, keep Datly places. The five wreck-risks are written as keep/restyle, not delete/re-IA.

| Risk | Live | Plan as written |
|------|------|-----------------|
| LanguageScreen | Overlay `zIndex: 2000` in `AppFC`, sage canvas, 52px drag spacer, `no-drag` on cards/Continue, `id="language-screen-title"` blocks Preferences | Same gate. Tokens-only paint. Not inside IslandHeader. Out of scope: unwinding. first-run order unchanged. |
| Sessions | Sidebar rail `sources \| sessions \| knowledge`; header `WorkspaceMenu` is a second switcher | Restyle, do not delete. Header card is a compact duplicate, not a replacement. |
| Encodings | User `encoding.scheme` and Flint `THEME_PRESETS` win over house | Out of scope. C-cicada-charts: encodings and `THEME_PRESETS` untouched. House only when `themeId` is null. Hues 0-1 stay. |
| Titlebar drag | Overlay AppBar `.df-titlebar` + Toolbar `no-drag` list; LanguageScreen has its own overlay drag | C-cicada-island: drag on sage + header. House-law: IslandHeader insets. Proof: drag/no-drag. LanguageScreen overlay drag is already independent of AppBar. |
| 600px budget | Live `minimumShellBudget` = 595 with book `appBar` 48 (Toolbar is 52). `MIN_SUPPORTED` 1024x600. Comfortable does not fit. | Island formula `2*8+44+360+32+75+20=547`. CTA visible at 1024x600. Live Toolbar is not 52. Do not buy inset by shrinking the chart (minChartHeight stays 360 in the sum). |

Meaning, out of scope, Place/grain, and chunk order match the prior UI note (tokens → recipes → island → sidebar then composer → cards → charts → type → settings → qa). Model picker stays in the header until composer. No footer on `DataLoadingChat`. `radius.sm` stays 1.5. No English stubs in ja/ko/fr/de.

## must

None.

The plan can be implemented as written without wrecking those five. Gaps below are should/nit, not a rewrite.

## should

- **C-cicada-island budget rewrite.** Change `minimumShellBudget` to `2 * islandInset(8) + appBar(44) + minChartHeight(360) + grid.headerHeight(32) + 3 * rowHeight (25) = 75 + padding(20) = 547`. Drop desktop `canvas.tabBar` (36) from the **height** sum; keep the token for phone Tabs. Keep `shellChrome` for **width** only. `MIN_SUPPORTED` stays `{ width: 1024, height: 600 }` (547 is the budget, not the floor). Keep `describe('minimum screen budget')`: compact/reference `fitsHeight`, comfortable does not, `clampDensityForViewport` still restores a fit. Visual 16px is `--df-island-inset` when `heightClass !== 'short'`, **not** in the budget. Add `islandInset` to `LayoutTokens` and `layoutFor`. Rewrite the `layout.ts` comment that says REFERENCE is a transcription of today's hardcoded app when `appBar` becomes 44. Do not shrink `minChartHeight`.
- **Titlebar after AppBar dies.** Put `.df-titlebar` (or equivalent) on the sage inset **and** `IslandHeader` only. Island bodies, Allotment, encoding shelf, and charts stay default (not drag). Keep the live no-drag list (`button, a, input, [role=button], .MuiInputBase-root, .MuiSelect-root`) and add it on `SegmentedPills`, the workspace card, the footer model pill, and Auth. Move `electronTitlebarInsets()` to `pl`/`pr` on `IslandHeader`, not a ghost AppBar. pywebview / `?desktop=1` (`overlay: false`) must not clip CTAs.
- **LanguageScreen in C-cicada-type.** Paint only (paper cards, forest check). Do not wrap it in `IslandShell` / `IslandHeader`. Keep overlay `zIndex: 2000`, `inert` on the router, `language-screen-title`, overlay drag, and the **52px** dedicated drag strip (52 is fine; it is not in `minimumShellBudget`). Continue stays on screen at 1024x600. Do not lower or restack the model wall (`zIndex: 1000`, `appearance="inline"`).
- **Encodings vs selected chrome.** C-cicada-cards forest hairline is selected **chrome** (thread / shelf / dialog), not `encoding.scheme`. Bake `HOUSE_THEME_REVISION` inside the existing `computeCacheKey` JSON (`houseRevision` when `themeId` is null). Do not add a 13th positional argument.
- **C-cicada-type ramp.** Bump the whole `TEXT_RAMP.reference` one step so the 1-1-1-1-2-2 rhythm still holds (`md=14`, `lg=15` is the named check, not "only those two keys"). Shift compact/comfortable/spacious in lockstep. Update `index.css` `--df-text-md`. Still no `DENSITY_SCALE` or `thread.cardWidth` edits.
- **C-cicada-qa proof.** Shot LanguageScreen and the model-wall overlays so first-run is not a second visual language. Wait on C-cicada-type (and sidebar if Sessions restyle should appear in workspace shots). Titlebar visible **and** drag/no-drag on the desktop shots.

## nit

- Name the web shot `web-workspace-default-w1280` as 1280x800.
- Replace sage cluster on `categoricalExtended` slots 2-5 the same way as `categorical`; keep overflow sage/ink as last resorts.
- `IslandHeader variant=about` (and landing): hide Explore/Reports; About has no model control today.
- Phone web `max-width: 699px`: island radius steps to `lg` so 28px corners do not eat the 36px Thread/Canvas tab bar. Desktop session does not block on this.
- Chart QA matrix already in Proof (bar, line, scatter, pie, map, KPI, tooltip, restyle variant, thumbnail after refresh). Keep it when implementing C-cicada-charts.
- Map PNG icons can stay; not blocking.

Nits do not need another review round.

## Plan change (must)

n/a
