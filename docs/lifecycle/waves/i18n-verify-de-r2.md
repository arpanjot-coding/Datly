# Independent verify r2: L-de

Slice: `L-de` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `de` and did not apply the r1 fix. Static re-read of `src/i18n/locales/de/*.json` against English meaning SSOT `src/i18n/locales/en/*.json` and against r1 `docs/lifecycle/waves/i18n-verify-de.md`. Tests not executed.

Scope: r1 highs, r1 mediums, P0 onboarding/nav/CTAs.

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|

No remaining rows. Highs from r1 are gone.

## Highs (r1)

- `dataThread.emptySession` now: "Bitten Sie den Agenten unten, Daten zu laden. Sie erscheinen hier, sobald sie bereit sind." Grammar and job match EN. Pass.
- `appBar.joinDiscord` now: "Discord beitreten." Verb restored. Pass.

## Mediums from r1 (spot-check)

All applied: `errors.validationError` Validierungsfehler; `appBar.pipInstall` Mit pip installieren; `chart.emptyStateChatHint` with "aus"; `chart.deleteChartYes`/`deleteChartCancel` Löschen/Abbrechen; `landing.tagline` with verb; `chart.msgEncodingEmpty` Ziehen Sie Felder…; `upload.contentExceedsSizeLimit` Registerkarte Datenbank, placeholders intact.

## P0 onboarding / nav / CTAs

- Onboarding: `onboarding.languageTitle` Wählen Sie Ihre Sprache; `languageIntro` Sie + Datly; `continue` Weiter.
- Nav: `navigation.*` German labels; `appBar.session|explore|reports|data|about` German.
- Core CTAs: Speichern, Abbrechen, Schließen, Löschen, Weiter, Anmelden, Hochladen.

Sie register held (no du). Placeholders on touched strings intact.

## Slice outcome

Pass. Highs closed. No rewrite.

Not exercised: live Deutsch switch, CTA clip at 960×640, runtime interpolation.
