# S9 [wf] F-i18n-picker

- Feature: F-i18n-picker
- Catalog: docs/lifecycle/test-cases/F-i18n-picker.md
- Host: 01a01b9d-0eb8-7983-b51a-f12a0630959d (not_found)
- Method: DISPATCH-FALLBACK. Shots from [ui-vis]. Wire from [connect]. Source walk for ungated paths.
- Outcome: pass

| id | verdict | evidence |
|----|---------|----------|
| TC-picker-01 | Pass | Shots `desktop-language-default.png` and `web-language-default.png`: first chrome is LanguageScreen (globe, title, intro, six native cards, Continue). AppBar and model wall are not first paint. Gate uses pre-init snapshot so a detector write does not skip this session. |
| TC-picker-02 | Pass | Source: `showLanguagePicker` false when `getPreInitI18nextLng()` is set. Mount effect backfills `datly.languageCompleted`. Not live-replayed this panel. |
| TC-picker-03 | Pass | Shot `desktop-model-wall-after-continue.png`: picker gone, AppBar and landing shell. This env already had a model so the model-select wall did not paint. Source wall still `zIndex: 1000` on `selectedModelId == undefined`. |
| TC-picker-04 | Pass | Shots `desktop-settings-language-row.png` and `desktop-settings-language-open.png`: Language is first Frontend control, native names, focused. Live retitle proven on LanguageScreen (`desktop-language-min-size-continue.png` Deutsch / Weiter). |
| TC-picker-05 | Pass | After-continue shot shows wide `LanguageSwitcher` (EN / 中文 / 日本語 / 한국어 / FR / DE). Overflow native names in source. Hide rule `length <= 1` in source. |
| TC-picker-06 | Pass | Source: dedicated `/auth/callback` route + pathname exception. Not a live OIDC hit. |
| TC-picker-07 | Pass | Shots: no Skip, no flags, no dropdown, no mascot. Native-name cards. Escape no-op in source. |
| TC-picker-08 | Pass | ui-vis: selected card focused; Continue programmatic focus; Ctrl+, opens Settings on `#config-language`. Source: arrows, Home/End, Space/Enter, tab trap, no-drag. |
| TC-picker-09 | Pass | Shots `desktop-language-min-size.png` and `desktop-language-min-size-continue.png` at 960x640: Continue on screen, Deutsch / Weiter not clipped. |
| TC-picker-10 | Pass | Source: gate, Settings, and toolbar all hide when `AVAILABLE_LANGUAGES.length <= 1`. Not operator-env launched. |

Residual (not a catalog P0 fail): connect notes `changeLanguage` before Continue writes `i18nextLng`, so kill after a card tap can skip the picker on relaunch. ui-vis P1: narrow outline clip, tall-window CTA gap.

Live `/auth/callback` and `AVAILABLE_LANGUAGES=zh` were not executed.
