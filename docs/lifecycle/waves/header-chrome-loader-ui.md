# UI-expert: F-loader-anim

Feature: F-loader-anim  
Session focus: desktop. Ship: web + desktop (same `AnvilLoader`, no desktop-only fork).  
Do not implement. Do not restyle the landing page. Do not touch `IslandHeader`.

Locked look (ASK, 2026-08-19): Datly logo pulse. Same fire mark as the landing. Breathing opacity. No 0/1 digits. No BinaryGrid.

## 1. Meaning

Replace the first-paint and session wait mark with a still Datly fire logo that breathes in opacity, so loading reads as brand wait instead of a 3x12 0/1 grid.

Out of scope: landing hero restyle; `IslandHeader` logo; `OidcCallback` PNG spinner; `LanguageScreen`; model-wall overlay; new loader route or store; new tokens or palette; `windowWipe` (thread / interaction cards); desktop-only fork; custom titlebar; BinaryGrid reused anywhere else.

## 2. Place / plug-in

No new route. No store shape. One component, two existing mounts. Call sites keep `label` and `action`.

| Place | Live plug-in | After |
|-------|----------------|-------|
| First paint (config + auth gate) | `AnvilLoader` in `src/app/App.tsx` when `!(configLoaded && authChecked)`. Label `t('app.loadingProduct')`. Desktop action: "View backend log" `Link` + `LogViewerDialog`. Height default `100vh`. | Same gate, same slots. Mark becomes logo pulse. |
| Session wait overlay | `Backdrop` + `AnvilLoader` in `src/views/DataFormulator.tsx` when `sessionLoading`. Height `"100%"`, `sx={{ width: '100%' }}`. Label `sessionLoadingLabel` or `t('session.loadingSessions')`. Action: Cancel `Button`. | Same Backdrop, zIndex 999, cancel still dismisses `sessionLoading`. |
| Mark implementation | `BinaryGrid` inside `src/components/AnvilLoader.tsx` (ROWS 3, COLS 12, `setInterval` 120ms, Courier 0/1) | Delete `BinaryGrid`. Import `src/assets/df-logo.svg` (same asset as landing `DataFormulator.tsx` hero). CSS opacity pulse only. |

Do not add a third loader. Do not change `App.tsx` / `DataFormulator.tsx` props unless a slot is accidentally dropped.

## 3. Approach

Swap the inner mark in `AnvilLoader` only. Keep the outer column: centered, `gap: 3`, `height` / `sx` passthrough, label + action row.

### Delete

- `BinaryGrid`, `ROWS`, `COLS`, `CYCLE_MS`, `fadeIn`, and the `useState` / `useEffect` / `useState` interval that flips cells.
- Any 0/1, Courier grid, or per-cell `primary.main` / `text.disabled` coloring.

Keep: `AnvilLoaderProps` (`height`, `label`, `action`, `sx`). Keep the existing label `Typography` (secondary, Courier, letter-spacing, uppercase, its own `pulse` 2.5s). Keep `{action}` unstyled by the loader.

### Add (in `AnvilLoader` only)

- `import dfLogo from '../assets/df-logo.svg'`
- Decorative `Box component="img"` `src={dfLogo}` `alt=""` (the label already names the wait).
- Size vs landing: landing hero is `{ xs: 40, sm: 52 }` × `{ xs: 36, sm: 48 }`. Header mark is `height: 22`. Model wall / About use 56×52. Loader is a wait mark, not a title: use the landing sm size **52×48** (fixed, not a second responsive hero). Slightly larger than the header chip, same fire as first landing paint, not a 96px splash that fights the Backdrop.
- Motion: reuse or rename the existing opacity keyframes (`0%/100%` 0.4, `50%` 1, `ease-in-out`, ~2.5s infinite). Opacity only. No scale, rotate, translate, or SVG path animation. No baked hex override; the SVG already carries gold / ember / fuel. Do not `filter` it to `primary.main`.
- `prefers-reduced-motion: reduce`: `animation: none` on the mark, rest opacity ~0.9 so the logo stays visible. Theme `MuiCssBaseline` already crushes duration to `0.01ms`; still set the local rule so the mark does not freeze at the 0.4 keyframe. Interval-driven BinaryGrid never honored this; the CSS pulse must.
- Optional: `aria-busy` on the outer box when a label is present. Do not invent a spinner role that duplicates the label.

### Do not

- Restyle the landing `dfLogo` `img` in `DataFormulator.tsx`.
- Touch `IslandHeader`, About, DataThread empty mark, or `OidcCallback` (`df-logo.png` + `CircularProgress`).
- Fork a desktop loader. Web and Electron share this component; first-paint desktop only adds the log `action`.
- Keep `BinaryGrid` behind a prop or flag.

## 4. Verdict: FIT

Blast: small. Plug-in is the existing `AnvilLoader` inner mark. API and both mounts stay. Look is locked. No IA, no store, no token fork. Sacred first-run gate and session Backdrop stay as wrappers.

Not ASK: target look is specified. Not SHAPE: we are not inventing a new wait place.

## 5. Risks

- **LanguageScreen first-run:** `AppFC` still shows `AnvilLoader` until `configLoaded && authChecked`, then the overlay. Do not fold the picker into the loader. Do not keep the loader mounted under `LanguageScreen`. Pulse must not change that gate or `inert` / `aria-hidden` on the router box.
- **Session Backdrop:** height is `"100%"` inside an absolute Backdrop (`zIndex: 999`, blur). Logo must not reintroduce default `100vh` and overflow the island. Cancel must remain clickable (`df-no-drag` already covers buttons; do not make the logo a button).
- **Tests:** no `AnvilLoader` / `BinaryGrid` unit tests today. i18n gate notes treat AnvilLoader as first chrome until config+auth; those stay valid if the component name and gate are unchanged. Visual / first-paint shots will show fire instead of digits; update shots if a capture matrix includes loading. Do not add a test that asserts 0/1 cells.
- **Theme pulse vs label pulse:** both can share the same keyframes. If reduced-motion is global, label and mark both go still; that is correct.
- **Asset:** use `df-logo.svg`, not `df-logo.png`. Landing and header already import the SVG.

## 6. Suggested chunks

- W-loader-pulse
