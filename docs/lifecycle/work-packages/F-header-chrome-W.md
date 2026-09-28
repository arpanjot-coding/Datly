# Work package - F-header-chrome + F-loader-anim

- **Status:** ACCEPTED
- **Kind:** W
- **Session focus:** desktop
- **Ship targets:** web, desktop (same renderer; no desktop-only fork)
- **Features:** F-header-chrome, F-loader-anim
- **Source:** DISPATCH-FALLBACK 2026-08-19. Prior [plan] stall wrote a chrome-only draft that omitted About and loader. Manager merged Wave A notes + this-message About markup.
- **Lane:** BUILD
- **Blast:** small

## Ask / out of scope

**F-header-chrome**
1. Header language pills (and compact overflow language list) go away. Later language change is Settings `#config-language` only.
2. Move the bottom-right circular (i) (`MessageSnackbar` FAB) into IslandHeader next to the terminal icon. Keep native min/max/close. Do not overlay them.
3. Remove the header About pill ("Can you remove the about section here"). Keep `/about` and `About.tsx` for deep links and the demo banner. Keep the App pill.

**F-loader-anim**
Replace AnvilLoader BinaryGrid 0/1 with the Datly fire logo (`df-logo.svg`) at 52x48, opacity pulse only. Same component on first paint and session Backdrop. Keep label and action slots.

**Out of scope**
- First-run LanguageScreen rewrite
- A new header language Select
- Custom titlebar buttons or titleBarOverlay restyle
- Locale JSON / house campaign
- New palette
- Composer / landing CTA
- Deleting the About page
- F-model-card (separate job)
- C-grid-clipboard / data-IDE
- Android / iOS this job

## Meaning

**F-header-chrome.** A desktop analyst uses a quiet titlebar: Datly mark, App, settings, logs (local), system messages. Language lives in Settings. About is not a top-nav item.

**F-loader-anim.** First paint and session wait show the Datly fire mark breathing, not a 0/1 grid.

## Verdict

**SHAPE** (logged). Slimmer header: no 20-locale toolbar, no About nav. Loader is **FIT**.

SUPERSEDES F-i18n-W text that kept toolbar LanguageSwitcher.

Not ASK: user named the About pill and the language pills. `/about` stays.

## Place / grain

No new route. Same `IslandHeader` on `/`, `/app`. `/about` still routes to About.tsx if opened. No new Home grain.

| Job | Plug-in | After |
|-----|---------|-------|
| Language later | IslandHeader LanguageSwitcher + LanguageMenuItems; ConfigDialog `#config-language` | Delete header/overflow pickers. Keep Settings Select + Ctrl+, / Cmd+, / onOpenPreferences. |
| About nav | TopNavButton `/about`, PageNavMenu About row | Delete header About. Keep App. Keep About.tsx. |
| Messages | MessageSnackbar FAB | Header IconButton beside terminal. Toasts stay bottom-right. |
| Native caption | electronTitlebarInsets | Keep. No overlay controls. |
| Loader | AnvilLoader BinaryGrid | df-logo.svg pulse. App.tsx + DataFormulator session Backdrop unchanged mounts. |

**Header cluster after (LTR, ml auto), landing / app:**

```text
[mark] [App] .... [gear] [terminal if local] [info] [Auth]
```

No About. No language pills. Workspace still has Explore / Reports / Exit as today.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-chrome-messages | No leftover FAB CTA; states on messages trigger. |
| section-grain | n/a | No new Home grain. |
| phone-chrome | n/a | android/ios not this ship set. |
| web-layout | C-chrome-pills | Web ships the same header. |
| desktop-chrome | C-chrome-messages | Titlebar inset, drag/no-drag, no overlay on caption. |
| first-run | n/a | LanguageScreen gate unchanged. |
| value-slide | n/a | No value slides. |
| app-polish | C-chrome-pills | About page stays; header About goes. |
| notifications | n/a | System-messages panel is not reminders. |
| i18n | C-chrome-pills | Keep t() and Settings Select; remove header pickers. |
| hardware-back | n/a | No android. |

## Chunks

| ID | Goal | Depends | Acceptance | Likely files |
|----|------|---------|------------|--------------|
| C-chrome-pills | Remove LanguageSwitcher, LanguageMenuItems, and overflow language rows. Remove header About (TopNavButton to /about and compact PageNavMenu About). Keep App. Keep Settings `#config-language`. Show settings gear on former About-wide path if About header chrome goes away. Do not delete About.tsx or the /about route. Do not touch LanguageScreen. | - | IslandHeader has no language pills, no About nav, no compact About/language items. App remains. `/about` still renders About.tsx. `#config-language` still lists house ids. Ctrl+, still opens Settings language. | `src/components/IslandHeader.tsx` |
| C-chrome-messages | hideTrigger / controlled open on MessageSnackbar. Remove absolute FAB. Visible info IconButton in header after terminal (or gear). Toasts stay bottom-right. no-drag on the new button. | C-chrome-pills | No bottom-right (i) FAB. Info IconButton in header cluster left of caption inset. Click opens the existing messages paper. | `src/views/MessageSnackbar.tsx`; `src/app/App.tsx`; `src/components/IslandHeader.tsx` |
| C-chrome-overflow | Compact overflow: no language, no About. Settings + Messages present. Visible info not overflow-only. desktop.test.ts inset 140 unchanged. | C-chrome-messages | Compact menu has no language and no About. Info visible at compact width. | `src/components/IslandHeader.tsx` |
| C-loader-pulse | Delete BinaryGrid. Import df-logo.svg at 52x48. Opacity pulse only. prefers-reduced-motion: still logo, no animation. Keep label and action API. | - | AnvilLoader shows the fire mark, no 0/1 cells. App first paint and session Backdrop still use AnvilLoader. | `src/components/AnvilLoader.tsx` |

**Order:** C-chrome-pills then C-chrome-messages then C-chrome-overflow. C-loader-pulse is independent (AnvilLoader only) and may run parallel to pills if worktrees.

## Proof

- Lite S9 after chunks: [wf] + [ui-vis] + [connect] + [arch-fit]
- Flags: shipsNotifications false. writesOutput false. siblingFamily false.
- Desktop shot: no About, no language pills, info in header, native caption clear, loader is logo pulse.
- Do not break LanguageScreen, `#config-language`, captionInset 140.

## User questions

None.
