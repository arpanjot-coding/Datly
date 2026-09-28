# Work package - F-cicada-ui Cicada chrome and chart restyle

- **Status:** ACCEPTED
- **Kind:** W
- **Session focus:** desktop
- **Ship targets:** web, desktop
- **Features:** F-cicada-ui
- **Wave A:** W1 neighborhood, W2 ui-expert, W3 arch-expert (all DONE)
- **DISPATCH-FALLBACK:** W4 [plan] stalled (15 tools, no named file ~124s). Manager wrote this package from Wave A + design SSOT. 2026-08-19.
- **Wave C r1:** UI ok (no must). Arch must-fix: TEXT_RAMP whole-ramp bump; island budget rewrite. Patched 2026-08-19. r2 arch only.

## Ask / out of scope

Verbatim: `/autonomous-developer desktop <review the pland and the images then update the ui>`

Review the Cicada design doc and Dribbble refs, then restyle Datly chrome and house Vega charts to that visual language.

**Out of scope**

- Cicada Preview / Codex / Design tabs, Voice, credits, Upgrade-to-Business, Figma Connect, purple 12-column specimens
- Chat-only editor; hiding the encoding shelf
- Professional data-IDE (F-data-ide / IDE-01)
- Tailwind / shadcn / a second component kit
- Google Sans; Night / dark theme
- Silent Data Formulator rename; Python/npm package rename
- Backend / assemble-pipeline / user `encoding.scheme` / Flint `THEME_PRESETS` changes
- Unwinding LanguageScreen or the model wall
- Deleting the sidebar Sessions tab
- Changing `radius.sm` 1.5 to 2
- Pasting English into ja/ko/fr/de
- Android / iOS this job

## Meaning

Make the shipped Datly chrome and house Vega charts read as Cicada editorial light (sage field, cream islands, one forest accent, paper plots) while the user job stays catalog, data thread, encode/chart/grid, optional report.

Who: desktop (and web renderer) analysts already using Datly.

Entry → steps → success: open landing and workspace; sage islands; forest primary; paper charts; no leftover Fluent blue; titlebar drag still works; min window 1024x600 still shows primary CTAs.

## Verdict

**SHAPE** (logged, Wave A ui-expert + arch-expert). Fits the product job. IA does not need a user decision.

Not FIT: live chrome is still Data Formulator (full-bleed AppBar, persisted `fluent`, white plots, leftover blue). Island + header-in-island + paper house is a real shape change.

Not ASK: Preview/Codex/Voice/chat-only are explicit non-goals.

Not UNFIT if we keep MUI, `tokens.ts`, `DATLY_CHART_THEME`, Allotment, existing panes.

**What we slim**

- Steal look only. Keep landing / workspace / About.
- Keep sidebar `sources | sessions | knowledge`. Header workspace card is a compact duplicate of `WorkspaceMenu`, not a Sessions replacement.
- Model picker stays in `IslandHeader` until C-cicada-composer lands footer on landing stacked input + thread `SimpleChartRecBox`. No model footer on `DataLoadingChat`.
- Forest is chrome and series hue 0. Keep live hues 0-1 (`#1f6b4a`, `#b4532a`). Replace sage cluster at 2-5 only.
- Keep `radius.sm: 1.5`. Add `xs` / `xl` / `island`.

## Place / grain

No new route. Restyle three existing places.

| Place | Live | After |
|-------|------|--------|
| First-run language | `LanguageScreen` overlay z 2000 | Same gate. Tokens-only paint. Not inside IslandHeader. |
| Model wall | `DataFormulator` overlay z 1000 | Same wall. Island/paper card. |
| Landing | Hero + stacked composer under full-bleed AppBar | One cream IslandShell. IslandHeader variant=landing. |
| Workspace | AppBar + DataSourceSidebar + Allotment | Sage field; sidebar island; workspace island with in-island header. |
| About | About.tsx under AppBar | IslandShell + IslandHeader variant=about. Keep About/App nav. |
| Charts | DATLY_CHART_THEME via assembleVegaChart | House plot = surface.paper. Compiler contract unchanged. |

Explore/Reports is `viewMode` SegmentedPills in the workspace header only. Not a replacement for About/App.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-cicada-island | Empty/error/CTA and island chrome. C-cicada-cards also applies. |
| section-grain | n/a | Restyle existing landing/workspace/About. No new Home grain. |
| phone-chrome | n/a | android/ios not in ship set for this job. |
| web-layout | C-cicada-qa | Web is a ship target. Dual-width proof on C-cicada-qa. |
| desktop-chrome | C-cicada-island | Titlebar drag/no-drag, min size, IslandHeader insets. |
| first-run | n/a | LanguageScreen stays. This job does not change first-run order. |
| value-slide | n/a | Product has no value slides. |
| app-polish | n/a | Icons and legal are not this job. |
| notifications | n/a | No reminders. |
| i18n | C-cicada-settings | New chrome strings en+zh only. |
| hardware-back | n/a | No android. |

## Chunks

| ID | Goal | Depends | Acceptance |
|----|------|---------|------------|
| C-cicada-tokens | Expand tokens (xs/xl/island; keep sm 1.5). Extract createDatlyTheme to src/app/theme.ts. Kill leftover chrome blues. dfSlice paletteKey cicada. Persist v5 fluent to cicada and chartThumbnails {}. Blacklist chartThumbnails. Drop Roboto (keep Roboto Mono). Allotment --df-focus-border. Keep outer separator transparent. | - | Grep `#007fd4|#0288d1|#1976d2|25, 118, 210` under src/ excluding palettes.fluent/material is empty. New users get cicada. Persisted fluent migrates. Thumbnails reset. App still compiles visually (no island yet). |
| C-cicada-recipes | MUI overrides. recipes.ts SxProps only. Unmounted IslandShell, SegmentedPills, StatusPill. Extract ConfigDialog.tsx. | C-cicada-tokens | Composites exist, unused in AppShell. ConfigDialog no longer inlined in App.tsx. |
| C-cicada-island | Mount sage + islands. Shared IslandHeader (landing/workspace/about). Model picker stays in header. Keep About/App. Wire Explore/Reports. Mechanical WorkspaceMenu.tsx extract (still a dialog). Add islandInset 8 to LayoutTokens/layoutFor. appBar 44. Rewrite minimumShellBudget height to tokenized 2*islandInset + appBar + minChartHeight + headerHeight + 3*rowHeight + padding (omit tabBar from height; shellChrome stays on width only). Budget uses REFERENCE.islandInset 8, never visual 16. LayoutProvider --df-island-inset: short → tokens.islandInset else 16px. Vis pane off radius.pill. Desktop drag on sage + header only; no-drag on new pills/workspace card/Auth. electronTitlebarInsets become pl/pr on IslandHeader. Rewrite the REFERENCE transcription comment. | C-cicada-recipes | No full-bleed AppBar. CTA visible at 1024x600. Live minimumShellBudget is 595 today (book appBar 48 + shellChrome 24 + 360 + 32 + 3*25 + tabBar 36 + 20). Post-island reference identity is 547 (2*8+44+360+32+75+20). 75 is 3*rowHeight(25), never 3x75. Do not hardcode addends. Comfortable still fails the floor (~630). In-island header is tokens.appBar 44, not the 52px Toolbar. Model picker still reachable. Do not shrink minChartHeight. |
| C-cicada-sidebar | Sidebar island + Sessions restyle (do not delete). StatusPill. Compact header workspace card. Delete WorkspaceMenu/AppFC DEBUG logs. Sage-facing margin var(--df-island-inset). | C-cicada-island | Sessions tab remains. Selected tint is forest/ink, not Material blue. Both islands share inset. |
| C-cicada-composer | appearance footer on landing stacked AgentChatInput + SimpleChartRecBox. Then remove header model. No footer on DataLoadingChat. | C-cicada-island | Model reachable from landing + thread composers. Header no longer shows it. DataLoadingChat still inline. |
| C-cicada-cards | Thread/example/encoding/dialog radii. Selected = forest hairline (chrome, not encoding.scheme). DataLoadingChat rectangular canvas off pill. | C-cicada-recipes, C-cicada-island | No 3px/6px literals on thread cards. DataLoadingChat canvas matches vis pane radius. |
| C-cicada-charts | House plot paper. Categorical 2-5 slate/ochre/steel/plum (same on categoricalExtended). Keep 0-1. Tooltip CSS. Paper PNG/report fills in downscaleImageForAgent and scalePngDown. Bake houseRevision inside existing computeCacheKey JSON when themeId is null (no 13th arg). Recolor #76c6ff icons. | C-cicada-tokens | themeId null uses paper plot. Hues 0-1 unchanged. Refresh does not restore white thumbs. Encodings and THEME_PRESETS untouched. |
| C-cicada-type | Bump whole TEXT_RAMP at every density one step at the small end. Reference becomes 11/12/13/14/15/17/19 (md=14, lg=15). Compact/comfortable/spacious in lockstep. Keep 1-1-1-1-2-2 rhythm. LanguageScreen/About leftover paint only (keep LanguageScreen 52px drag strip and zIndex 2000; do not wrap in IslandShell). | C-cicada-island | Rhythm tests stay. No DENSITY_SCALE or cardWidth edits. Do not edit only md and lg. |
| C-cicada-settings | Settings shows Cicada + Mono. Advanced iff DEV_MODE. Reduced-motion. en+zh chrome strings (appBar.explore already exists). | C-cicada-recipes | Production Settings has two palettes unless DEV_MODE. ja/ko/fr/de not stubbed in English. |
| C-cicada-qa | Dead Sass. Leftover white overlays. Grep gate (chrome only). Desktop chrome shot + 1024x600 + 1280x800 web. Overlay shots: LanguageScreen, model wall. | C-cicada-island, C-cicada-charts, C-cicada-cards, C-cicada-type | Shots: desktop-landing-default, desktop-workspace-default, desktop-workspace-min-w1024h600, web-workspace-default-w1280. Titlebar visible. Drag/no-drag honest. |

**Order:** tokens → recipes → island → (sidebar ∥ composer) → cards → charts → type → settings → qa.

C-cicada-sidebar and C-cicada-composer may run in parallel after island (disjoint files if composer does not edit IslandHeader until the last step of composer; sequence composer after sidebar if both touch IslandHeader). Default: sidebar then composer so IslandHeader model removal is last.

## Proof

- Campaign / S9: `[wf]` + `[ui-vis]` + `[connect]` + `[arch-fit]` after chunks Accepted.
- Flags: shipsNotifications false. writesOutput false. siblingFamily false.
- Desktop: titlebar visible; min 1024x600 CTA; drag/no-drag.
- Web: 1280 workspace shot (ship target).
- Chart QA: bar, line, scatter, pie, map, KPI, tooltip, restyle variant, thumbnail after refresh.

## User questions

None. SHAPE is logged. BUILD proceeds.
