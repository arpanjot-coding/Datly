# UI-expert: F-header-chrome

Feature: F-header-chrome  
Session focus: desktop. Ship: web + desktop (same `IslandHeader`, no desktop-only fork).  
Do not implement. Do not plan other jobs.

Markup SSOT: `docs/lifecycle/waves/header-chrome-markup.png`

## Markup (three boxes)

| Box | What is boxed | User note | Meaning |
|-----|---------------|-----------|---------|
| 1 | Header language pills (AR … FIL `ToggleButtonGroup`) | "only have the drop down in the settings" | Remove header language chrome. Later change is Settings `Select` only. |
| 2 | Native Win min / max / close, top-right | none | Keep native OS chrome. Do not draw app min/max/close. Do not park header icons in the caption overlay. |
| 3 | Circular `(i)` FAB, absolute bottom-right | "add it on the top neat the terminal icon" | Move system-messages trigger into the header icon cluster, beside the terminal. |

## 1. Meaning

Clear duplicate language chrome from the header, leave native window buttons alone, and put the system-messages control next to the log terminal in the existing header cluster.

Out of scope: first-run `LanguageScreen`; a new header language dropdown; a second Settings picker; custom titlebar buttons; Electron `titleBarOverlay` restyle; locale JSON; new palette / tokens; composer or landing CTA; hosted log endpoints.

## 2. Place / plug-in

No new route. No store shape. Same header on `/`, `/app`, `/about`.

| Job | Live plug-in | After |
|-----|----------------|-------|
| Language later path | `LanguageSwitcher` + `LanguageMenuItems` in `src/components/IslandHeader.tsx`; Settings `Select` `id=config-language` in `src/views/ConfigDialog.tsx` | Delete header/overflow pickers. Keep Settings Select + `focusLanguage` / Ctrl+, / Cmd+, / `onOpenPreferences`. |
| Native caption | `electronTitlebarInsets()` in `src/app/desktop.ts`; `IslandHeader` `pl` / `pr`; `.df-titlebar` drag / no-drag | Keep. Do not add overlay controls. |
| Messages trigger | `MessageSnackbar` FAB in `src/views/MessageSnackbar.tsx` (mounted `AppShell` in `src/app/App.tsx`) | Header `IconButton` beside `LogViewerDialog`. Toasts stay bottom-right. |

## 3. Approach

Layers: header chrome only. Tokens and `IconButton` recipes already on gear / terminal.

### Delete

- `LanguageSwitcher` (wide App + About).
- `LanguageMenuItems` and `ToolbarOverflowMenu` `showLanguages` (default true today).
- `SHORT_LANGUAGE_LABELS` / `TranslateIcon` / `LANGUAGE_LABELS` imports if unused after the cut.
- Absolute FAB on `MessageSnackbar` (`position: "absolute", bottom: 16, right: 16`, white circle, scale hover). That control must not remain a landing-corner CTA.

Do not delete: `ConfigDialog` language `Select`; `openPreferencesToLanguage`; `language-screen-title` guard; i18next.

### Move / add

- Split or extend `MessageSnackbar`: keep last-message `Snackbar` + history panel in `App.tsx` (all `AppShell` routes). Export a header trigger (same `hideTrigger` / `open` / `onOpenChange` pattern as `LogViewerDialog`, or a `MessageHistoryButton` plus a small provider in `AppShell` so IslandHeader can open the panel without Redux).
- Header trigger: existing gear `IconButton` sx (`p: 0.5`, `text.secondary`, no new colors). Keep `aria-label={t('messages.viewSystemMessages')}`. Quiet severity via existing `color={buttonSeverity}` is fine; do not restyle as a FAB.
- About wide today uses `ConfigDialog hideTrigger` because language pills were the later path. After pills go, **show the gear** on About wide (drop `hideTrigger` there). Compact About overflow must gain a Settings row (it has none today).

### Header cluster after (LTR, `ml: auto`)

Wide App / landing / workspace:

```text
[gear] [terminal if IS_LOCAL_MODE] [info] [ | Exit if workspace] [Auth]
```

Wide About:

```text
[gear] [terminal if IS_LOCAL_MODE] [info] [YouTube] [Auth]
```

Compact: overflow items (no language block, no language divider):

```text
Explore / Reports (workspace only) · Settings · Logs if local · Messages · Exit if session
About compact: Settings · Logs if local · Video
```

Keep a **visible** info `IconButton` at every header width (not overflow-only). Logs stay local-gated and compact-overflow as today. Info is the always-on sibling "near the terminal".

Do not place any of these in `captionInset` / traffic-light pad. Cluster stays inside `IslandHeader` content; `pr: titlebar.right` (Win overlay ~140) and `pl: titlebar.left` (Mac ~78) unchanged. `AuthButton` stays last in-flow, still `df-no-drag`. Linux `overlay: false`: full-width header, native frame outside the renderer.

Web: same cluster, insets 0.

### Do not

- Add a header language `Select` or menu.
- Fork `IslandHeader` for desktop.
- Change `electron/main.cjs` overlay color/height unless a real clip is proven.
- Touch `src/i18n/locales/*`.
- Make chrome icons the landing primary CTA (composer stays).

## 4. Verdict draft: FIT

Blast: small. Plug-in is `IslandHeader` + `MessageSnackbar` trigger + existing Settings row. Sacred contracts (LanguageScreen, i18next, `config-language`, Ctrl+,, `IS_LOCAL_MODE` logs, `electronTitlebarInsets`) stay.

Not ASK: no IA or store change. Not UNFIT: matches house later-path (Settings after first-run). Prior i18n plan kept toolbar pills as convenience; this job removes them because the user said so. That is the ask, not a silent slim.

## 5. Risks / unified plan must not break

- **LanguageScreen first-run:** do not fold it into the header; keep `AppFC` gate, `language-screen-title`, overlay drag / no-drag.
- **Ctrl+, / Cmd+, / `onOpenPreferences`:** still opens Settings and focuses `#config-language`. Skip when LanguageScreen is up.
- **Compact overflow:** after deleting `LanguageMenuItems`, About compact has no Settings unless the overflow (or visible gear) is added.
- **IS_LOCAL_MODE:** terminal / log overflow only when local. Info and Settings stay on hosted web.
- **Web vs desktop:** one header. Insets only via existing `electronTitlebarInsets`. Do not overlay caption buttons; do not invent Linux/Mac custom controls.
- **Drag:** new info button must be `no-drag` (already covered by `.df-titlebar button` and the overlay `sx` list).
- **Toasts:** moving the trigger must not drop the latest-message `Snackbar` or `displayedMessageIdx` wiring. Panel still clears via existing actions.
- **Composer:** landing primary remains `AgentChatInput`, not gear / terminal / info.

## 6. Suggested chunks

- W-chrome-pills
- W-chrome-messages
- W-chrome-overflow
