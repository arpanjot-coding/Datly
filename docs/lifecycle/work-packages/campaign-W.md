# Work package - UI leakage + theme surfaces (REPORT)

- **Status:** ACCEPTED
- **Kind:** W
- **Lane:** REPORT (standalone UI tester + screen-flow campaign)
- **Session focus S:** desktop (Electron)
- **Ship targets:** web, desktop (same renderer; no desktop-only fork)
- **Related feature ids (do not mark Done):** F-header-chrome, F-loader-anim, F-cicada-ui
- **Paused / out:** F-workspace-W DRAFT (history + D-free-saas) is not this campaign
- **Evidence slug:** `docs/test-runs/ui-leakage-theme-2026-08-23/`
- **Runtime note:** Electron may already be running via `node electron/dev.cjs` (Vite `:5173`, `?desktop=1`). Reuse it. Do not capture screenshots in this plan step. Do not start testers from this package.

## Ask / out of scope

**Ask (verbatim intent, REPORT walk then later BUILD)**

Do a full detailed UI test: there is a lot of UI leakage. Redesign the logo of the app and the loading animation (they are consistent with each other and do not match the theme). Improve the color scheme of the buttons and related chrome.

This package is the **tester campaign** that inventories leakage and theme miss. It is not a product redesign plan and not an execution plan in `docs/plans/`.

**In scope**

1. UI leakage on every in-scope screen and state: overlap, clip, crop, overflow, pills/chips outside crop, content under titlebar, min-window clip (`desktop-react-ui.md`).
2. App logo / icon / wordmark versus current theme tokens.
3. Loading animation: `electron/loading.html` splash and in-app loaders (`AnvilLoader`).
4. Button color scheme versus theme tokens (primary, secondary, ghost/text/toolbar, danger, icon buttons, soft).
5. Light and dark **if both ship**. Production Settings currently ships Cicada (default editorial light) and Mono. Night / dark is not a shipped palette; do not invent a dark theme for this walk. Shoot Cicada and Mono.
6. Dual-viewport proof: desktop (min `1024x600` plus a comfortable size) and web (same renderer, at least one non-desktop width such as `1280`).
7. House-law oracle copy under the evidence slug (`house-laws.md`, `capabilities.md`) plus flow-map, control inventory, and widgets grain.

**Out of scope**

- `[impl]` chunks, restyle, token rewrite, logo redraw, splash rewrite, button recode
- A Kind E file under `docs/plans/`
- Marking F-header-chrome, F-loader-anim, or F-cicada-ui Done
- F-workspace-W (history / free SaaS) and any C-bill / live-share work
- Android / iOS device-qa (not in S, not in ship set)
- Starting testers or taking shots from this DRAFT
- Backend / connectivity campaign, artifact-export proof, data-IDE features
- Hardcoded Chinese in campaign artifacts (English only)

Redesign of logo, loader, and button colors is later BUILD after the user picks Kind R report IDs.

## Meaning

Datly is a shipped desktop + web analyst workspace (Electron renderer + Vite). Chrome is Cicada (sage canvas, forest primary, cream islands). The fire logo (`df-logo.svg`) and the in-app pulse loader share that gold-bonfire mark. The Electron splash (`electron/loading.html`) still paints a BinaryGrid 0/1 on `#fafafa` with Fluent `#1976d2`. The user reports leakage across the shell and a brand/theme split: mark + loaders feel like one family, buttons and field do not.

This campaign walks the live UI like a tester (`testers.md`, `ui-tester.md`, `screen-flow-audit.md`, `test-campaign.md` type E). Testers record crop fails and theme-lock misses against `tokens.ts` / `theme.ts`. They do not restyle.

Who: Manager Accept + `plan-check --campaign`; then `[explore]` / `[ui-vis]` / `[wf]` after the plan gate.

Entry, steps, success: Accept this DRAFT; run C-map then C-vis then C-wf (C-theme-surfaces may run with C-map); Manager merges a Kind R report; user names IDs before any BUILD.

## Verdict

**CAMPAIGN (REPORT).** Not FIT / SHAPE for a new product. Not a chrome redesign work package.

The product job (load data, analyst chart, optional report) stays. This run proves leakage and theme-lock gaps on shipped surfaces. Logo / splash / button color changes wait for named Kind R IDs.

Not ASK: the user named leakage, logo, loading animation, and button colors.

Not UNFIT: walk uses existing routes and tokens; no new Home grain.

## Place / grain

No new route. No new Home section. Testers walk live places and write ephemeral evidence under `docs/test-runs/ui-leakage-theme-2026-08-23/` (delete that folder when the campaign Completes; keep the Kind R report).

| Place | Kind | Why it is in |
|-------|------|----------------|
| Electron splash | `electron/loading.html` | Loader / theme miss; first paint before Vite |
| LanguageScreen | first-run overlay | Ships; leakage + theme on the language-first gate |
| Landing `/` | page | Logo, header chrome, composer CTAs, empty |
| Model wall | overlay | Full-screen gate; buttons + crop |
| Workspace `/app` Explore | page | Titlebar, islands, sidebar, pills, encoding, grid |
| Workspace Reports | `viewMode` | Second root; grain / Repeats |
| About `/about` | page | Wordmark, legal, header |
| Settings / ConfigDialog | dialog | Palette Cicada vs Mono; language; buttons |
| Data loading / connectors | pane + dialogs | Chips, overflow, CTA crop |
| Data thread / vis / table | panes | Pills, icon buttons, min-window clip |
| Messages / menus / toasts | overlays | Shot before and after open |
| Native titlebar | desktop chrome | Inset, drag / no-drag, content under caption |

C-map must list every overlay the inventory finds (WorkspaceMenu, connector pickers, auth if shown). Do not skip a node because code looks fine.

**Seed inventory pointers (do not copy these files into the package; C-theme-surfaces cites them):**

- Logo / icon / wordmark: `src/assets/df-logo.svg` (gold bonfire); header mark in `src/components/IslandHeader.tsx`; window icon `packaging/icons/data-formulator.ico` / `.icns` from `electron/main.cjs`
- Splash: `electron/loading.html` (BinaryGrid, `#1976d2`, `#fafafa`, Courier)
- In-app loader: `src/components/AnvilLoader.tsx` (`df-logo.svg` 52x48 opacity pulse); mounts on first paint (`src/app/App.tsx`) and session Backdrop
- Tokens / buttons: `src/app/tokens.ts` (`surface`, `palettes.cicada`, `palettes.mono`); `src/app/theme.ts` (`createDatlyTheme`, `MuiButton`, `MuiIconButton`, soft / toolbar variants); `src/app/recipes.ts` for composite sx
- Theme lock: `usability.md` §3; default `paletteKey` `cicada`; no Night palette in Settings

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-vis | |
| section-grain | C-map | |
| phone-chrome | n/a | Product does not ship Android or iOS phone chrome (S is desktop Electron; ship set is web + desktop). |
| web-layout | C-vis | |
| desktop-chrome | C-vis | |
| first-run | C-wf | |
| value-slide | n/a | Product does not ship value-slide art. |
| app-polish | C-theme-surfaces | |
| notifications | n/a | Product does not ship reminders or local alerts (in-app MessageSnackbar is not a reminder fire). |
| store-review | n/a | Product does not ship an in-app or store rating ask. |
| shareability | n/a | Product does not ship OS share of a visual artifact. |
| i18n | C-wf | |
| hardware-back | n/a | Product does not ship Android hardware Back (S is desktop Electron). |

## Chunks

Campaign steps only. No `[impl]`.

| ID | Goal | Depends | Acceptance | Status | Why (if not DONE) |
|----|------|---------|------------|--------|-------------------|
| C-map | `[explore]`: flow-map + control inventory + widgets grain / Repeats + `house-laws.md` + `capabilities.md` under `docs/test-runs/ui-leakage-theme-2026-08-23/`. Copy applicable `house-laws.md` map rows. N/A a row only when `capabilities.md` says the product does not ship that capability. Seed nodes from Place / grain; add every overlay found. | - | Folder exists with `flow-map.md`, control `inventory.md`, `widgets.md`, `house-laws.md`, `capabilities.md`. Every in-scope screen has inventory rows. Section-grain Repeats filled for landing vs workspace vs About. | IN PROGRESS | Writer live, wave 2 |
| C-vis | `[ui-vis]`: dual-viewport shots of every in-scope screen and state (empty / loading / error / success / open overlay). Leakage: overlap, clip, crop, overflow. Must include logo, loader / splash, buttons, titlebar chrome. Desktop min `1024x600` plus comfortable. Web width (e.g. `1280`) on the same renderer. Cicada and Mono. Manager `read_file` on failing PNGs. | C-map | Matrix 100% shot. Each row notes Visual OK or fail (overlap / clip / crop / titlebar / min-window). Logo, `loading.html`, `AnvilLoader`, primary / secondary / ghost / danger / icon buttons, and caption inset are in the shot list. House-law chrome rows (`ui-craft`, `web-layout`, `desktop-chrome`) ticked. | PENDING | Depends on C-map |
| C-wf | `[wf]`: tap every in-scope control. Dual check: correct job + professional crop. Theme lock vs tokens (button color, leftover Fluent blue, logo hue vs forest / sage). Walk LanguageScreen (language first). Flag hardcoded chrome strings that skip `t()` (splash English is a finding, not a rewrite here). | C-map, C-vis | Inventory Tapped / Correct / Crop OK complete. First-run and i18n house-law rows ticked. Theme-lock misses listed against `tokens.ts` / `theme.ts`, not vibe. | PENDING | Depends on C-map and C-vis |
| C-theme-surfaces | `[explore]` inventory only (no redesign): where logo, `electron/loading.html` / loader animation, and button color tokens live, and how they miss the theme. Findings go to the Kind R report later. Cite paths; do not paste whole files. | - | Short inventory note in the test-run folder (e.g. `theme-surfaces.md`) covering mark, splash, AnvilLoader, window icon, `MuiButton` / `MuiIconButton` / recipes, Cicada vs Mono, and the fire-vs-forest miss. No `[impl]`. | IN PROGRESS | Writer live, wave 2 |

**Order:** C-map first. C-theme-surfaces may run in parallel with C-map (read-only). C-vis after C-map. C-wf after C-vis so taps have before/after shots.

**Testers (after Accept + plan-check + plan gate):** `[explore]` C-map + C-theme-surfaces; `[ui-vis]` C-vis; `[wf]` C-wf. Manager Reflects into Kind R. Do not spawn `[impl]`.

## Proof

- Campaign / S9: type E screen-flow (`screen-flow-audit.md`) + UI tester boards (`testers.md`). Layers: visual (C-vis), journey taps (C-wf), house-law oracle (C-map artifacts + ticks on C-vis / C-wf).
- Flags: shipsNotifications false. writesOutput false (this campaign does not prove exports). siblingFamily false.
- Pass is not: code read, one Home shot, toast, or "looks fine."
- Kind R path (Manager after testers): `docs/lifecycle/reports/` (keep). Test-run folder is ephemeral.
- Electron already up: `node electron/dev.cjs` + Vite `:5173`. Do not double-start. Do not shoot from the plan worker.

## User questions

- (none)
