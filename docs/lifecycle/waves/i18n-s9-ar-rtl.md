# S9 leftover [ui-vis] Arabic RTL

- Feature: F-locales / F-i18n-picker
- Chunk: C-i18n-ar-rtl-s9
- Host: 01a01c56-35d7-7680-859f-7b7842d3a823 (not_found at harvest; PNGs stable)
- Sidecar: docs/test-runs/.worker-done/C-i18n-ar-rtl-s9.md
- Named shots:
  - docs/test-runs/i18n-locales-2026-08-19/shots/desktop-language-ar-rtl.png
  - docs/test-runs/i18n-locales-2026-08-19/shots/web-language-ar-rtl.png
- Spec: docs/test-runs/i18n-locales-2026-08-19/routes.json (desktop-language-ar-rtl, web-language-ar-rtl)
- Outcome: Accept leftover shot. Capture ok. dir=rtl.

Base `http://127.0.0.1:5173`. Routes click `العربية` then evaluate `document.documentElement.dir === 'rtl'` (throw otherwise). Both PNGs written.

## Manager visual review: confirm

Desktop 1440x900 and web 1280x720:

- LanguageScreen chrome (globe well, title اختر لغتك, Arabic intro, Datly kept, house native-name cards, primary متابعة). No Skip. No flags. No AppBar.
- Selected `العربية`: accent ring, tint fill, trailing check on the **left** (RTL). Native names sit on the **right**.
- Intro and title are Arabic. Continue is متابعة and fully on screen.
- Capture evaluate proves `html dir=rtl`. Layout matches that (not LTR leftovers on the picker).

## Residual (not P0)

- House 20 cards overflow the list; the last visible card is clipped by the scroller above Continue. Continue itself is not clipped. Same class as W10 V-tall-cta-gap, not a job-blocking crop.
- Intro still wraps mid-phrase (existing P2 V-intro-wrap).
- Native Electron frame not in these renderer shots.

No second [ui-vis]. No product edits. Do not mark F-i18n-picker or F-locales Done (gate-check still FAIL polish/quality/ship).
