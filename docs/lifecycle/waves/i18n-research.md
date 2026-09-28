# Feature research - F-i18n-picker / F-locales

- **Status:** COMPLETE
- **Updated:** 2026-08-19
- **Wave:** 2 W2 (lite feature research)
- **Agent:** [research]
- **Kind:** REPORT (do not implement)
- **Jobs:** desktop language picker; native UI copy for every id already on the in-app list
- **Ship targets:** desktop (session focus); also web
- **SSOT for "the list":** `LANGUAGE_LABELS` in `src/app/App.tsx` (`en`, `zh`, `ja`, `ko`, `fr`, `de`). Confirmed against code this wave. Not a 20-id house table.

Skip this turn: store listing copy; extra house locales not on the in-app list (es, pt-BR, it, ru, and the rest). Demand for those exists in the category, but it is not strong enough against the user's listed ids to expand this campaign.

---

## Seeds (inventory only)

What we already have, from the map and code, not invented:

- Stack: i18next + react-i18next + i18next-browser-languagedetector. Fallback `en`. Detect order: `localStorage`, then `navigator`. Persist in `localStorage`.
- Locale trees: `src/i18n/locales/en/*` and `src/i18n/locales/zh/*` (chart, common, dataLoading, encoding, errors, loader, messages, model, navigation, upload). Keys aligned by unit test.
- Toolbar `LanguageSwitcher` (ToggleButtonGroup) plus compact overflow menu rows. Hidden when `AVAILABLE_LANGUAGES.length <= 1`.
- Labels for `ja`, `ko`, `fr`, `de` in `LANGUAGE_LABELS` with **no locale files**.
- Server default `AVAILABLE_LANGUAGES`: `en,zh` (`dfSlice` + `py-src/data_formulator/app.py` env). Extra labels never appear unless the env is widened.
- No first-run language overlay. First hard gate is the model-select wall.
- Vega time locale sync exists for the current i18n language.

User ask (verbatim, from feature-ask): language picker, and publish the app into all languages already on the list, translated well.

---

## Category norms (desktop / Electron-class / data tools)

Data-tool desktops almost never put a language **card wall** in front of first work. They auto-detect OS or browser locale, then hide a later change in Help, Settings, or Options. Web/Electron cousins (Notion, Figma, Slack, Obsidian) follow the same later-Settings pattern, with OS detect on first visit.

What they share:

1. Detect OS / browser language on first launch. Do not force a pick if the match is supported.
2. Always allow an override. OS language is not the user's language (DBeaver Chinese-OS-wants-English is the canonical ticket).
3. Later change lives in Settings / Options / Help, not only a chrome chip.
4. Native apps often require a restart. Web/Electron apps can refresh in place. Datly is the latter.
5. Listing a language without shipping strings is treated as a lie (Steam store language tags; KNIME "English only" is at least honest).

First-run **language screens** exist in OS installers, Steam install language, and some ecommerce (Zara country/language on entry). They are rare in BI and SQL IDEs. Datly still needs a first-run pick because: (a) the user asked; (b) the model wall is already a hard gate, so language must be decided *before* that wall for non-English users; (c) the current toolbar is invisible when the server only advertises `en,zh`.

---

## Feature research - F-i18n-picker

### They do (who, URL)

**Tableau Desktop / Reader (BI desktop peer).** Auto: Windows locale if supported, else English. Change: **Help > Choose Language**, then restart. UI language is separate from workbook locale (numbers, dates, maps). Not a first-run overlay; not a toolbar chip.

- https://help.tableau.com/current/reader/desktop/en-us/language.htm
- https://graphed.com/blog/how-to-change-language-in-tableau

**Power BI Desktop (BI desktop peer).** Windows Store build installs all languages and follows Windows. Standalone installer picks a default language. Later change: **File > Options and settings > Options > Regional settings > Application Language**. Separate knobs for model language and import locale. Service: Settings > Language, or follow the browser. Desktop does not ship RTL (Hebrew/Arabic).

- https://learn.microsoft.com/en-us/power-bi/fundamentals/supported-languages-countries-regions

**VS Code (Electron desktop, coding-IDE analogue).** Ships English. Detects OS UI language and **prompts** to install a Language Pack. Later: Command Palette **Configure Display Language** (searchable list of locale names). Restart required. CLI `--locale=fr` for a session.

- https://code.visualstudio.com/docs/configure/locales

**JupyterLab (data-tool category).** Language packs are extra pip/conda installs. Change: **Settings > Language** submenu of installed packs, confirm, browser refresh. No first-run picker.

- https://jupyterlab.readthedocs.io/en/4.4.x/user/language.html

**DBeaver (SQL IDE desktop peer).** Auto from OS. Change: **Window > Preferences > User Interface** dropdown, Apply, restart. Fallback: `-nl XX` in `dbeaver.ini` when the install dir is not writable. Supported set includes en, zh, ja, ko, fr, de (plus others we are **not** adding this turn).

- https://dbeaver.com/docs/dbeaver/UI-Language/

**Obsidian (Electron desktop, first-run analogue).** Language on the **vault picker** at launch **and** Settings > General > Language. Two places, one preference. Users notice the dual surface.

- https://forum.obsidian.md/t/individual-display-language-setting-for-each-vault/22877
- https://obsidian.md/help/language

**Notion / Figma / Slack (desktop+web Settings row).** No first-run language wall. Dropdown under Settings / Preferences / Language & region. Figma also has a bottom-right "Change language" and a Settings row. Slack: profile > Preferences > Language & region. Native names in the list. Figma's listed set includes en, ja, ko, fr, de (plus es, pt-BR, which we skip).

- https://www.notion.com/help/change-your-language
- https://help.figma.com/hc/en-us/articles/6956360971415-Change-your-language-preference
- https://slack.com/help/articles/215058658-Manage-your-language-preferences

**UX research (placement, labels, flags).** NN/g: default to browser language; put the switcher in a top corner on desktop; list each language **in that language** (Deutsch, not German); never flags-only. W3C: do not use flag icons to indicate languages. Smashing: avoid auto-redirect; decouple language from country; native names; globe/translate icon, not flags. Smartling: dropdown for many languages; buttons/list for a few; modal/overlay for first visit when you must ask.

- https://www.nngroup.com/articles/language-switching-ecommerce/
- https://www.w3.org/International/questions/qa-link-lang#flags
- https://www.smashingmagazine.com/2022/05/designing-better-language-selector/
- https://www.smartling.com/blog/language-selector-best-practices
- https://simplelocalize.io/blog/posts/flags-as-language-in-language-selector/

### Users ask / hate (source)

- **OS language is wrong for me.** DBeaver: "My operating system language is Chinese, so DBeaver interface language is Chinese, but I want to change to English." https://github.com/dbeaver/dbeaver/issues/2838 Related: language reset after updates; change fails in write-protected installs. https://github.com/dbeaver/dbeaver/issues/20878
- **No translation at all, and we need it.** KNIME staff, 2021: "Right now, KNIME software only uses the English language in its interface." Brazilian company users not fluent in English. Forum users want at least menus and the task bar. https://forum.knime.com/t/problems-with-language/37223
- **Language listed but not real.** Steam, 640 upvotes: store tags 15 languages; MT makes the product "totally unplayable"; example "chest" mistranslated across locales. Top replies: label MT honestly, or do not claim the language. "No translation is preferred" vs "I'd much rather have the bad translation than have the game be entirely inaccessible." Datly takeaway: do not put ja/ko/fr/de on the picker until files exist. https://old.reddit.com/r/Steam/comments/1jn5awy/machine_translation_is_a_huge_problem_that_need/
- **Switcher hard to find / auto-guess wrong.** NN/g: users look top-right, then top-left; footer is missed; flag-only ASOS target was too small. AliExpress auto-translate produced "funny translations"; a Mexico user preferred English. https://www.nngroup.com/articles/language-switching-ecommerce/
- **Auto-redirect / IP guess.** Smashing: Tokyo visitor redirected to Japanese with no obvious override. Do not lock language to geo. https://www.smashingmagazine.com/2022/05/designing-better-language-selector/
- **Market access.** CSA Research, cited: 80% of users will not purchase software without local language support. https://rewritebar.com/articles/localization-best-practices (citing Acclaro / CSA)

### We already have

Toolbar toggle + compact menu; i18next persist; OS/browser detect; en+zh files; labels for ja/ko/fr/de **without files**; server list defaults to en,zh so the extra labels usually never render; **no first-run overlay**; **no Settings language row**; model wall is the first blocking screen.

### Include: **yes**

### Why (not clone-only)

The user asked for a picker. The current control is a toolbar chip that (1) hides when the server list is `en,zh`, (2) advertises ja/ko/fr/de that cannot load, (3) is easy to miss in compact overflow, (4) sits after the model wall, so a non-English first-run user cannot choose language before the first hard gate. Data tools prove a **later Settings row** is table stakes (Power BI, DBeaver, Notion, Slack). A **first-run pick** is justified here because Datly already blocks on model select, and because detect-only fails for bilingual analysts (DBeaver tickets). Do not clone Tableau's restart, VS Code's marketplace packs, or Power BI's three regional knobs. Do not clone flag grids. Ship: detect, first-run only when unset, persist, Settings row, keep a compact later switcher.

### This job: picker look

| Surface | Look | Why |
| --- | --- | --- |
| First-run (no persisted locale) | Full-screen list of **six native-name rows** (or equal cards). One Continue. Pre-select navigator match if it is on the list. | Six items: a dropdown wastes the empty first-run; a 40-language modal is overkill (Booking/Airbnb). Native names: NN/g + Smartling. Cards vs a stacked list is the same job at n=6; prefer a single-column selectable list so keyboard and screen readers stay simple. |
| Flags | **No** | W3C: flags are countries. zh is not a PRC/ROC choice. fr is not France vs Canada. |
| Labels | Endonyms: English, 中文, 日本語, 한국어, Français, Deutsch. Optional ISO code as secondary text (`en`, `zh`, …). Globe or Translate icon on the screen, not a flag. | NN/g Tip 4; current toolbar already uses mixed EN/中文/日本語. Keep that, add the missing endonyms for FR/DE. |
| After persist | Skip first-run forever for that profile. | Obsidian/VS Code remember; NN/g "remember my choice". |
| Later Settings | One row: Language, native-name dropdown, applies immediately (no restart). Same six ids. | Power BI / DBeaver / Notion / Slack. Toolbar chip can stay as a shortcut once `AVAILABLE_LANGUAGES` is the full list, but Settings is the discoverable path when chrome collapses. |
| Toolbar | Keep, do not make it the only path. Compact overflow already exists. | NN/g top-corner habit. Hidden today when list length is 1. |
| RTL-ready plumbing | `dir` / `lang` on root; no Arabic/Hebrew locale this turn. | Power BI Desktop skips RTL. Notion supports it later. Do not block ja/ko/fr/de on RTL. |

Do not insert the picker *after* the model wall. Language first, then the existing model-select wall. Do not delete the model wall to make room (feature-ask A3).

---

## Feature research - F-locales

### They do (who, URL)

Serious desktop data tools that claim a language actually ship UI chrome in that language (menus, buttons, messages). Tableau and Power BI translate "menus, buttons, messages, and other elements"; data itself is not auto-translated; a few features stay English (Power BI Q&A). Jupyter and VS Code ship language **packs**, not empty menu items. DBeaver documents a real code per language.

Quality bar from localization practice, not a style book:

- Buttons: short verb that names the result (Apple HIG: "Erase", not "OK"). Translate the **action**, not the English words. https://developer.apple.com/design/human-interface-guidelines/alerts
- Empty states: say what to do next, not a literal of "Nothing here yet". Transcreate onboarding, empty states, first-run. https://rewritebar.com/articles/localization-best-practices
- Errors: no blame, next step, no "Oops". Literal English idioms ("You're all set", "Oops, something went wrong") read as calques. Natural: Todo listo / Ya está, not word-for-word. https://simplelocalize.io/blog/posts/why-machine-translation-fails-ui-strings/
- Length: German ~30–40% longer, French ~20–25%. Buttons and tabs overflow if you paste MT. https://www.drizz.dev/post/localization-layout-testing
- Formality: ja/ko/fr/de have register that English "you" does not. Pick one (product: polite professional, not teen-app tú / ため口) and keep it.
- Plurals and placeholders: do not split sentences across keys; keep `{{name}}` / i18next plurals. zh already has `_plural` keys in dataLoading.
- Terminology: workspace, chart, encoding, model, session, agent stay glossary-stable. Do not independently translate product nouns every screen.

### Users ask / hate (source)

- MT UI is a **fake language**. Steam thread above; "chest" example. Top comment: disclose MT or do not claim the language.
- Indie/gamedev consensus (mixed): some prefer no translation over bad; some prefer bad over none. For **analyst UI** (errors, empty states, buttons), bad translation costs trust: RewriteBar opener, "billing copy sounds robotic, and support tickets start with 'I don't trust what this means.'" https://rewritebar.com/articles/localization-best-practices
- Short strings fail MT: "Close" is cerrar vs cerca; "Get started" is not a calque. https://simplelocalize.io/blog/posts/why-machine-translation-fails-ui-strings/
- Literal translation that ignores meaning on CTAs and errors. https://gtelocalize.net/localization-errors/ (blocked here; same claim in Lokalise UI localization: native, not dictionary). https://lokalise.com/blog/ui-localization/
- KNIME: users asked for Portuguese/Spanish chrome; vendor still English-only. Honesty > a stub list.

### We already have

English is meaning SSOT. Simplified Chinese files exist and key-match English; they still need a **native verify**, not a "file present" check (feature-ask A4). ja, ko, fr, de: labels only.

### Include: **yes** (exactly the in-app list)

### Why (not clone-only)

The user asked to publish into **all languages already on the list**, "translated well." Shipping the picker without ja/ko/fr/de files repeats the Steam failure mode we already have in labels. Shipping files without a picker leaves them undiscoverable (server still `en,zh`; toolbar hidden). Do not machine-dump. Native phrasing for buttons, empty states, and errors is the quality bar; glossary + independent verify, not a style book.

### This job: which locales

| Id | This turn | Notes |
| --- | --- | --- |
| `en` | yes (SSOT) | Lock keys; do not rewrite English to make other languages easier unless a key is broken. |
| `zh` | yes (verify + fill gaps) | Already present. Native pass required. Simplified only (`zh`, not zh-TW). |
| `ja` | yes (new tree) | Match en keys. |
| `ko` | yes (new tree) | Match en keys. |
| `fr` | yes (new tree) | Match en keys. Watch length on toolbar/buttons. |
| `de` | yes (new tree) | Match en keys. Longest expansion risk. |
| Other house ids | **no** this turn | Log as later if demand appears. es/pt-BR show up on Figma/Notion/DBeaver lists; not on ours. |

Widen server `AVAILABLE_LANGUAGES` default to the six ids **only when** those trees exist. Until then, do not advertise them.

---

## Compare table

| Capability | They have (who) | We have | Users want? (source) | Include? | Why |
| --- | --- | --- | --- | --- | --- |
| OS/browser detect + persist | Tableau, Power BI, VS Code, i18next detector (us) | yes (localStorage, navigator) | yes (NN/g tip 1: do not make them use the switcher) | yes | Keep. First-run only if nothing persisted. |
| First-run language screen | Rare in BI; Obsidian vault picker; VS Code pack prompt; Zara/BMW-style ask-if-unsure | no | yes for this user; mixed in category | yes | Model wall is already first. Language must precede it. Six native-name rows, not flags. |
| Settings / Options language row | Power BI Options, DBeaver Preferences, Notion, Figma, Slack | no (toolbar only) | yes (DBeaver tickets: override OS; KNIME: cannot find a change at all) | yes | Discoverable path when toolbar collapses. Immediate apply, no restart. |
| Toolbar / Help chrome switcher | Tableau Help menu; our ToggleButtonGroup | yes (hidden if list length <= 1) | mixed (NN/g top corner; data tools bury it) | yes (keep, not sole path) | Useful shortcut after first-run. Do not rely on it. |
| Claimed locale = real files | Tableau/PBI/DBeaver ship chrome; Steam users hate fake tags | en+zh files; ja/ko/fr/de labels only | yes (Steam 640; KNIME English-only is at least honest) | yes | Do not show an id without a tree. |
| Native UI copy (not MT calque) | Power BI/Tableau professional chrome; SimpleLocalize/Lokalise norms | zh exists, unverified here; others missing | yes (Steam MT; RewriteBar "I don't trust what this means"; NN/g AliExpress) | yes | Buttons, empty states, errors get a native pass. |
| Restart to apply | Tableau, VS Code, DBeaver, Jupyter refresh | n/a (i18next can switch live) | users hate extra restart when avoidable | no | Stay live-switch. Sync Vega locale on change (already exists). |
| Language packs / marketplace | VS Code, JupyterLab | bundled JSON | no for this job | no | Six locales, small tree. Bundle them. |
| Separate UI vs data locale | Tableau workbook locale; Power BI import/model language | UI language only; cell formatting via Intl | mixed (analyst dates) | later | Out of this ask. Do not add a second locale knob. |
| Flags on the picker | Common on ecommerce; rejected by W3C | no | users recognize flags, experts reject them for language | no | Languages, not countries. zh/fr/en have no honest single flag. |
| RTL locales (ar, he) | Notion yes; Power BI Desktop no; Slack no | no | real, not this list | later | Plumbing only (dir/lang). No ar/he files. |
| Extra locales (es, pt-BR, it, ru, …) | Figma, Notion, DBeaver, PBI long lists | not on `LANGUAGE_LABELS` | category yes (KNIME PT); not this ask | no this turn | User named the in-app list. Revisit if demand is named. |
| Store listing localization | PBI/Tableau marketing sites | n/a | skip | no | Explicit skip. |
| Auto-redirect by IP | Audi/Backcountry (hated) | no | users hate (Smashing, NN/g) | no | Detect language, never geo-lock. |

---

## P0 / P1 (picker vs campaign)

Do not ship one without the other. A picker that lists ja with English chrome is the Steam failure. Files that the server never advertises stay invisible.

### P0 (this job)

**F-i18n-picker**

1. Treat persisted i18n language as first-run complete. If missing, show the six-row native-name screen, Continue writes `localStorage`, then existing model wall.
2. Settings row: Language, same six endonyms, live `changeLanguage`.
3. Default `AVAILABLE_LANGUAGES` to the six ids **once files exist**. Toolbar chip may remain.
4. Root `lang` (and `dir` ready). Do not build ar/he.

**F-locales**

1. New trees `ja`, `ko`, `fr`, `de` matching en keys.
2. Native pass on P0 chrome: app bar, first-run, model wall, empty data/chart states, errors, primary buttons.
3. Native verify of existing `zh` (not "file present").
4. Key-parity test like today's en/zh test, for all six.
5. Glossary lock: session, workspace, chart, encoding, model, agent. Product name stays Datly / Data Formulator as in English UI.

### P1 (after this job)

- Drop the toolbar chip if Settings + first-run cover it (measure; do not delete now).
- Number/date locale independent of UI language (Tableau workbook locale).
- Community or vendor pass on long help/demo strings.
- Extra locales only if a named ask appears.

### Not this job

- Store listings.
- House 20.
- Replacing i18next.
- Translating user data, SQL, or Python.
- Deleting the model-select wall.

---

## UI translation notes (short, not a style book)

1. **Buttons:** verb of the result. ja/ko often drop a dummy object; de/fr will be longer. Do not pad with English syntax.
2. **Empty states:** instruction + next action. Transcreate. Do not calque "Get started" / "You're all set".
3. **Errors:** what happened + what to do. No "Oops". Keep refresh/retry as native verbs (zh already uses 刷新).
4. **Register:** polite professional in ja (です/ます), ko (해요 or 합니다, pick one and stick), fr (vous), de (Sie).
5. **zh:** Simplified only. Do not mix 繁體.
6. **Length:** visually check de and fr on the toolbar, dialogs, and encoding shelf.

---

## Sources

Desktop / data-tool pickers

- https://help.tableau.com/current/reader/desktop/en-us/language.htm
- https://learn.microsoft.com/en-us/power-bi/fundamentals/supported-languages-countries-regions
- https://code.visualstudio.com/docs/configure/locales
- https://jupyterlab.readthedocs.io/en/4.4.x/user/language.html
- https://dbeaver.com/docs/dbeaver/UI-Language/
- https://github.com/dbeaver/dbeaver/issues/2838
- https://forum.knime.com/t/problems-with-language/37223
- https://forum.obsidian.md/t/individual-display-language-setting-for-each-vault/22877
- https://www.notion.com/help/change-your-language
- https://help.figma.com/hc/en-us/articles/6956360971415-Change-your-language-preference
- https://slack.com/help/articles/215058658-Manage-your-language-preferences

Switcher UX

- https://www.nngroup.com/articles/language-switching-ecommerce/
- https://www.w3.org/International/questions/qa-link-lang#flags
- https://www.smashingmagazine.com/2022/05/designing-better-language-selector/
- https://www.smartling.com/blog/language-selector-best-practices
- https://simplelocalize.io/blog/posts/flags-as-language-in-language-selector/

Quality / demand

- https://old.reddit.com/r/Steam/comments/1jn5awy/machine_translation_is_a_huge_problem_that_need/
- https://simplelocalize.io/blog/posts/why-machine-translation-fails-ui-strings/
- https://lokalise.com/blog/ui-localization/
- https://rewritebar.com/articles/localization-best-practices
- https://developer.apple.com/design/human-interface-guidelines/alerts
- https://www.drizz.dev/post/localization-layout-testing

Internal inventory

- `src/app/App.tsx` `LANGUAGE_LABELS`, `LanguageSwitcher`
- `src/i18n/index.ts`
- `src/app/dfSlice.tsx` `AVAILABLE_LANGUAGES`
- `py-src/data_formulator/app.py` env default `en,zh`
- `docs/lifecycle/feature-ask.md`
- `docs/lifecycle/TRACKING.md` D-locale-set
