# Header chrome neighborhood (F-header-chrome)

Inventory for a desktop landing header work package. Map only. Do not treat this as an implementation plan.

Session focus: desktop. Ship: web + desktop. `LanguageSwitcher` lives in shared renderer UI, so a header change lands on both unless gated.

## Screenshot (`docs/lifecycle/waves/header-chrome-markup.png`)

Desktop landing (`IslandHeader` variant `landing`) on Windows overlay chrome.

| Markup | What it is | User note |
|--------|------------|-----------|
| Top-center language pills (`AR` `中文` `NL` `EN` … `FIL`) | `LanguageSwitcher` `ToggleButtonGroup` of every `AVAILABLE_LANGUAGES` id | "only have the drop down in the settings" |
| Top-right `_ □ ×` | Native Windows `titleBarOverlay` min / max / close. Not React. No app-drawn caption title. | boxed, unlabeled beyond the region |
| Bottom-right circular `(i)` | `MessageSnackbar` system-messages FAB | "add it on the top neat the terminal icon" |

Also visible, not boxed: Datly mark + wordmark, About / App pills, settings gear, terminal icon immediately left of the native caption buttons. No `AuthButton` (typical local desktop: no OIDC).

## 1. Circular (i): MessageSnackbar FAB

Confirmed. Not an about-info control. It is the system-messages launcher in `MessageSnackbar`.

| Fact | Evidence |
|------|----------|
| Mount | `AppShell` always renders `<MessageSnackbar />` under the router outlet. `src/app/App.tsx:251` |
| FAB | `IconButton` `position: "absolute", bottom: 16, right: 16`, `zIndex: 10`. `src/views/MessageSnackbar.tsx:185-209` |
| Default icon | `InfoIcon` when severity is info/default. `src/views/MessageSnackbar.tsx:205-208` |
| Label | `t('messages.viewSystemMessages')` → `"view system messages"`. `src/views/MessageSnackbar.tsx:184` · `src/i18n/locales/en/messages.json:25` |
| Action | Opens the system-messages paper (`setOpenMessages(true)`). Latest toast is a separate bottom-right `Snackbar`. |
| Positioning ancestor | Outer `AppShell` `Box` is `position: 'absolute'` full window (`src/app/App.tsx:222-240`), so the FAB is window bottom-right, not island-relative. |

Work package intent from markup: keep the system-messages surface; move the trigger into the header cluster next to `TerminalOutlinedIcon`. Closest existing pattern is `LogViewerDialog` `hideTrigger` plus an `IslandHeader` icon (`src/views/LogViewerDialog.tsx:80-88`, `170-184`).

Do not confuse with `InfoIcon` in `ExplComponents.tsx` (chart UI, not this FAB).

## 2. LanguageSwitcher mounts

Component is local to `IslandHeader` (not exported). `src/components/IslandHeader.tsx:85-122`.

Behavior:

- Reads `state.serverConfig.AVAILABLE_LANGUAGES`. Hidden when missing or `length <= 1`. `:91`
- `ToggleButtonGroup` exclusive, one `ToggleButton` per language. `:94-120`
- Labels from `SHORT_LANGUAGE_LABELS` (`AR`, `中文`, `NL`, `EN`, … `FIL`). `:50`, `src/i18n/houseLocales.ts:50-71`
- Change: `i18n.changeLanguage(value)` only. No `persistI18nextLng` / `setLanguageCompleted`. `:97`

`IslandHeader` is mounted in three variants:

| Variant | Caller | Path |
|---------|--------|------|
| `landing` | `DataFormulatorFC` when no active workspace | `src/views/DataFormulator.tsx:1063` |
| `workspace` | `DataFormulatorFC` in session | `src/views/DataFormulator.tsx:1058` |
| `about` | `About` | `src/views/About.tsx:99` |

### Every language-picker mount in this header

| Surface | When | What |
|---------|------|------|
| Landing / workspace wide | `isAppPage && !isCompactToolbar` | `<LanguageSwitcher />` then gear + terminal. `:530-536` |
| About wide | `isAboutPage && !isCompactToolbar` | `<LanguageSwitcher />` after hidden `ConfigDialog`. `:569-573` |
| Compact overflow (landing / workspace / about) | header width `< 900` (`COMPACT_TOOLBAR_WIDTH`) | `ToolbarOverflowMenu` default `showLanguages={true}` renders `LanguageMenuItems`. `:240-248`, `:279` |
| `LanguageMenuItems` | compact menu only | Native-name `MenuItem` list, still every `AVAILABLE_LANGUAGES` id. `:142-171` |

Compact is a `ResizeObserver` on the header element (`:126-137`). Threshold is header box width, not window width. Windows overlay adds `pr: 140`, so compact trips earlier than 900px window.

User note "only have the drop down in the settings" applies to **all four header mounts** (two pill rows + compact menu list), not landing only.

## 3. Settings language Select (already a dropdown)

`ConfigDialog` already has an MUI `Select` dropdown, not pills.

| Fact | Evidence |
|------|----------|
| Control | `<Select id="config-language" …>` with `MenuItem` per language. `src/views/ConfigDialog.tsx:117-137` |
| Label id | `config-language-label`. `:114-118` |
| Group | `id="config-language-group"`. `:113` |
| Shown when | `availableLanguages.length > 1`. `:54`, `:112` |
| Labels | `NATIVE_LANGUAGE_LABELS` (full names). `:132` |
| Change | `i18n.changeLanguage(value)`. `:123-126` |
| Focus API | prop `focusLanguage`; `autoFocus={focusLanguage}` plus `getElementById('config-language')?.focus()` after 50ms. `:38`, `:60-66`, `:120` |

Gear trigger: default `hideTrigger={false}` renders `SettingsOutlinedIcon`. `:86-100`. About wide and compact paths pass `hideTrigger` so the gear is hidden; the dialog still exists for Ctrl+, / IPC.

**Gap if header pills go away:** About wide has no visible settings gear (`:571`). About compact overflow items are logs + YouTube only, no settings (`:551-565`). Language on About would then be Ctrl+, / Electron Preferences only unless the work package adds a settings entry there.

Landing / workspace wide already show the gear next to the terminal (`:534`).

## 4. Terminal icon and header cluster siblings

Header terminal is `LogViewerDialog` default trigger: `TerminalOutlinedIcon` `IconButton`. `src/views/LogViewerDialog.tsx:170-184`.

Gated on `serverConfig.IS_LOCAL_MODE` (desktop local yes; hosted no). `IslandHeader.tsx:535`, `:573`.

Landing / workspace **wide** right cluster, left to right (`:530-544` then `:593-595`):

1. `LanguageSwitcher` (pills)
2. `ConfigDialog` gear
3. `LogViewerDialog` terminal (local mode)
4. workspace only: vertical `Divider` + Exit
5. `AuthButton` in `df-no-drag` (renders nothing when anonymous and no OIDC)

Screenshot cluster is gear + terminal, then native overlay. Markup wants `(i)` "on the top near the terminal icon" → insert into that inner `Box` (`:533-536`), typically after terminal (or between gear and terminal). Keep `aria-label` / tooltip (`messages.viewSystemMessages`).

Other `TerminalOutlinedIcon` sites (not this cluster): `App.tsx` error-boundary and startup loader; `ModelSelectionDialog.tsx:568`. Do not move those.

## 5. Titlebar / window chrome

### Overlay vs native frame

| Platform | Frame | Overlay buttons | Insets from preload |
|----------|-------|-----------------|---------------------|
| Windows | `titleBarStyle: "hidden"` + `titleBarOverlay` height 52, color `#f3f5f0`, symbol `#1c231d` | OS min / max / close (screenshot) | `captionInset: 140`, `trafficInset: 0`, `titleBarOverlay: true` |
| macOS | `hidden` + `trafficLightPosition: { x: 14, y: 18 }` | traffic lights | `captionInset: 0`, `trafficInset: 78` |
| Linux | `titleBarStyle: "default"` (native frame) | none in renderer | overlay flag false → insets `{ left: 0, right: 0, overlay: false }` |

Sources: `electron/main.cjs:112-135`, `electron/preload.cjs:5-11`, `src/app/desktop.ts:11-20`.

Geometry: overlay height **52** (`TITLEBAR_HEIGHT`) equals island inset **8** + `appBar` **44** (`src/app/layout.ts:107-131`). Caption buttons occupy the top-right 52px of the **window**, including sage inset. Header `pr: titlebar.right` keeps React controls out of that strip.

### Drag / no-drag

| Layer | Rule |
|-------|------|
| `.df-titlebar` | `-webkit-app-region: drag`. `src/index.css:41-44` |
| Controls inside it | `no-drag` on `button`, `a`, `input`, `[role=button|radio|radiogroup]`, MUI input/select. `:46-56` |
| `IslandHeader` | always `className="df-titlebar"` plus `pl`/`pr` from `electronTitlebarInsets()`. Overlay also sets `WebkitAppRegion` in sx. `IslandHeader.tsx:407-426` |
| `AppShell` | `className="df-titlebar"` when `titlebar.overlay`. Makes the sage field draggable. `App.tsx:223` |
| `IslandShell` body | `df-no-drag`. Header slot is the drag island chrome. `src/components/IslandShell.tsx:12-31` |
| First-run `LanguageScreen` | full-screen drag; buttons `no-drag`. `LanguageScreen.tsx:144-147` |

### Does header content collide with native controls?

**Caption buttons:** On the marked-up Windows shot, `_ □ ×` sit in the reserved 140px. Gear + terminal sit immediately left of that strip. Pills stop before the overlay. `electronTitlebarInsets` + `pr: 140` is doing its job. Unit lock: `tests/frontend/unit/app/desktop.test.ts:24-33` expects `{ left: 0, right: 140, overlay: true }`.

**Crowding (the real header bug):** Twenty `ToggleButton`s with `minWidth: 40` (`IslandHeader.tsx:106`) plus logo, nav, gear, terminal, optional auth, plus 140px caption. At default 1440 it fits (screenshot). Between compact threshold (~900 header px) and ~1300 it will clip or sit against the overlay cluster. Removing pills is the collision fix, not shrinking `captionInset`.

**Do not** reimplement min/max/close in React. Desktop law: content not under overlay controls; drag on empty chrome; `no-drag` on buttons (`desktop-react-ui.md`).

Web / `?desktop=1` without preload: insets zero, no overlay class unless `window.electronAPI.titleBarOverlay` is set.

## 6. First-run LanguageScreen (must stay)

Do not delete or skip `LanguageScreen`.

Gate in `AppFC` (`src/app/App.tsx:448-456`):

- `configLoaded && authChecked`
- not dismissed this session
- `!getLanguageCompleted()`
- `!getPreInitI18nextLng()` (pre-init snapshot only; detector must not fake a returning user)
- `AVAILABLE_LANGUAGES.length > 1`
- not `/auth/callback`

Continue: `persistI18nextLng(selected)` then `setLanguageCompleted(true)` then `i18n.changeLanguage`. `LanguageScreen.tsx:64-69`. Title id `language-screen-title` (`:179`). `IslandHeader.openPreferencesToLanguage` **returns without opening Settings** while that node exists (`:377-378`).

Returning user with `i18nextLng` already in storage: `App.tsx:303-307` sets `languageCompleted` so the picker stays skipped.

## 7. Ctrl+, / Electron Preferences → Settings focused on language

Already wired. Keep it.

| Step | Where |
|------|-------|
| Mac menu | `Preferences...` `accelerator: "CommandOrControl+,"` → `sendOpenPreferences()`. `electron/main.cjs:55-70` |
| Win / Linux | `before-input-event` Ctrl+, (no meta/alt/shift). Darwin skipped here (menu owns it). `electron/main.cjs:89-109` |
| IPC | `open-preferences`. `main.cjs:43-52` |
| Preload | `electronAPI.onOpenPreferences`. `electron/preload.cjs:12-20` |
| Renderer subscribe | `window.electronAPI?.onOpenPreferences?.(openPreferencesToLanguage)`. `IslandHeader.tsx:401-404` |
| Renderer shortcut | same `openPreferencesToLanguage` on Ctrl+, / Cmd+, . `:383-399` |
| Action | `setSettingsFocusLanguage(true); setSettingsOpen(true)` unless `#language-screen-title` present. `:377-381` |
| Dialog | `ConfigDialog` `focusLanguage={settingsFocusLanguage}` focuses `#config-language`. |

Web gets the renderer keydown path without IPC.

## 8. Tests that would break if LanguageSwitcher is removed

Searched `tests/` for `LanguageSwitcher`, `AVAILABLE_LANGUAGES`, language pills, `MessageSnackbar` FAB, `config-language`, `LanguageMenuItems`, `SHORT_LANGUAGE_LABELS`, `viewSystemMessages`. **No test imports or asserts those symbols.**

| File | Relation | Break if pills / FAB move? |
|------|----------|----------------------------|
| `tests/frontend/unit/app/desktop.test.ts` | overlay insets `{ right: 140 }` | **No** unless `captionInset` / `electronTitlebarInsets` change |
| `tests/frontend/unit/app/i18nLocales.test.ts` | en vs zh/ja/ko/fr/de key parity | **No** |
| `tests/frontend/unit/app/errorHandler.test.ts` | comment only: dispatch reaches MessageSnackbar | **No** (does not render FAB) |
| `tests/frontend/unit/app/AuthButton.test.tsx` | header sibling | **No** if `AuthButton` stays |
| `tests/frontend/unit/electron/lib.test.ts` | URL / backend spawn | **No** |
| `tests/backend/agents/test_agent_diagnostics.py` | DiagnosticsViewer JSON shape | **No** if snackbar list UI remains |

There is **no** IslandHeader / ConfigDialog / LanguageScreen unit test in `tests/frontend/unit/`. Removing pills is low test-break risk and **uncovered**. Work package should add tests if the campaign requires them: compact overflow has no language rows; Settings `#config-language` still lists house ids; LanguageScreen still gates; FAB/header trigger still opens messages; desktop inset still 140.

## 9. File table

| Path | Role | Likely change |
|------|------|----------------|
| `src/components/IslandHeader.tsx` | Pills, compact language menu, gear/terminal cluster, Ctrl+, / IPC | **yes** (remove `LanguageSwitcher` + `LanguageMenuItems`; optional header messages trigger; maybe About settings visibility) |
| `src/views/MessageSnackbar.tsx` | FAB `bottom:16 right:16` + message list | **yes** if trigger moves to header (`hideTrigger` or split trigger) |
| `src/app/App.tsx` | `MessageSnackbar` mount, LanguageScreen gate | **no** for gate; maybe pass snackbar open state if header owns trigger |
| `src/views/ConfigDialog.tsx` | Settings language `Select` `#config-language` | **no** (already the dropdown). Touch only if About needs a visible trigger |
| `src/views/LogViewerDialog.tsx` | Terminal trigger pattern | **no** (copy pattern, do not fold messages into logs) |
| `src/views/onboarding/LanguageScreen.tsx` | First-run picker | **no** (sacred stay) |
| `src/i18n/localePersist.ts` | `i18nextLng`, `datly.languageCompleted` | **no** |
| `src/i18n/index.ts` | i18next init, detector caches | **no** |
| `src/i18n/houseLocales.ts` | ids + short/native labels | **no** |
| `src/app/dfSlice.tsx` | default `AVAILABLE_LANGUAGES` (20 house ids) | **no** |
| `src/app/desktop.ts` | `electronTitlebarInsets` | **no** unless inset math is wrong (screenshot says it is not) |
| `src/index.css` | `.df-titlebar` drag / no-drag | **no** unless new header control roles need `no-drag` |
| `src/components/IslandShell.tsx` | island + drag split | **no** |
| `src/views/DataFormulator.tsx` | landing / workspace header | **no** |
| `src/views/About.tsx` | about header | **no** unless About needs a settings entry in the page, not header |
| `src/app/AuthButton.tsx` | trailing header control | **no** |
| `electron/main.cjs` | hidden + overlay, Ctrl+, | **no** |
| `electron/preload.cjs` | `captionInset: 140`, `onOpenPreferences` | **no** |
| `src/types.d.ts` | `ElectronAPI` | **no** |
| `tests/frontend/unit/app/desktop.test.ts` | inset contract | **no** unless insets change |
| `py-src/data_formulator/app.py` | server `AVAILABLE_LANGUAGES` | **no** |

## 10. Sacred contracts

Do not break these. Header chrome is layout, not i18n policy.

| Contract | Meaning |
|----------|---------|
| **i18next** | Single `translation` namespace. `fallbackLng: 'en'`. `supportedLngs` = house ids + `tl`. Detector order `localStorage` then `navigator`. Caches empty until armed. `src/i18n/index.ts` |
| **AVAILABLE_LANGUAGES** | Runtime list from `/api/app-config` / env, default 20 house ids. Switcher, Settings, and LanguageScreen all read this. Default FE: `dfSlice.tsx:347`. Server: `py-src/data_formulator/app.py`. Removing pills must not shrink the list. |
| **languageCompleted** | `localStorage` key `datly.languageCompleted`. First-run complete flag. `localePersist.ts:2,49-55`. LanguageScreen Continue sets it. Do not set it from header or Settings. |
| **persistI18nextLng** | Writes `i18nextLng` and arms detector persist. First-run Continue only (`LanguageScreen.tsx:66`). Settings / header `changeLanguage` persist only **after** arm (returning session). Do not call this from a removed switcher rewrite unless duplicating Continue. |
| **LanguageScreen** | First consumer screen when list length > 1 and no pre-init lng / completed flag. Must stay. |
| **Settings dropdown** | `#config-language` is the post-onboarding picker. Markup says this is the only chrome picker. |
| **Windows caption inset** | `captionInset` 140 / `pr` on header. Do not park new header icons in the overlay strip. |
| **Ctrl+,** | Opens Settings focused on language; no-ops on LanguageScreen. |

House locale ids (labels only; do not fork): `ar zh nl en fr de el hi it ja ko pl pt ro ru es th tr vi fil` (`src/i18n/houseLocales.ts:2-23`). Alias `tl` → `fil`.

## Suggested work package (for Manager, not impl)

1. Remove `LanguageSwitcher` and compact `LanguageMenuItems` from `IslandHeader` (landing, workspace, about).
2. Leave `ConfigDialog` language `Select` as the only in-app chrome picker. Leave LanguageScreen.
3. Move system-messages trigger from FAB to the header icon cluster next to the terminal. Preserve list + latest toast.
4. If About loses its only visible language UI, add a settings control to About (gear or overflow item). Do not leave About on shortcut-only.
5. Do not change Electron overlay, `captionInset`, first-run persist, or `AVAILABLE_LANGUAGES`.
6. Add the missing UI tests listed in §8 if this campaign Accepts on tests.

Web ships the same header. No `isDesktopRuntime` gate unless a later brief says desktop-only.
