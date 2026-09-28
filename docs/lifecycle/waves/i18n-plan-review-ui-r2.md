# Plan review r2 (ui): F-i18n-W

Job: F-i18n-picker. Plan: `docs/lifecycle/work-packages/F-i18n-W.md`. Round 2 of 2.

## Must closed?

yes

Round 1 must was the new-install gate vs detector cache. C-picker-gate, Place/grain, D-language-first, and C-i18n-plumbing now snapshot `localStorage['i18nextLng']` before the first detector cache write (or `caches: []` until Continue). LanguageScreen shows when `languageCompleted` is missing and that pre-init snapshot is empty, even if the detector later writes a guess. Returning users skip on the pre-init snapshot and backfill `languageCompleted`. Continue is the only write of `languageCompleted` plus the confirmed locale. Overlay keeps `RouterProvider`. Allowlist length `<= 1` skips the picker. Cards intersect `AVAILABLE_LANGUAGES`.

SHAPE is unchanged: six locales `en` `zh` `ja` `ko` `fr` `de`; keep i18next; overlay above the model wall.

## must

None.

## should

- Run the snapshot in `localePersist` / `src/i18n/index.ts` before `i18n.init`. `AppFC` reads that captured value. Do not re-read `localStorage['i18nextLng']` after init to decide the gate. Already in C-i18n-plumbing; keep it in the impl.
- Do not let the model wall or AppBar flash under AnvilLoader. Gate after `configLoaded`; first visible paint is LanguageScreen (already in C-picker-gate acceptance).

Neither blocks implement-as-written.

## nit

- C-picker-settings acceptance still says "the same six native names". Goal already filters by `AVAILABLE_LANGUAGES`. Default allowlist is six; operator list still applies.
- Single language phase can omit house pill dots.
- Toolbar En / Fr / De remains optional density; S9 can prefer full native short words.

Nits do not need another review round.

## Plan change

n/a (no remaining must)

## Verdict

ok
