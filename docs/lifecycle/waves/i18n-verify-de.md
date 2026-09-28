# Independent verify: L-de

Slice: `L-de` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `de`. Static read of `src/i18n/locales/de/*.json` against English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

Scope: P0 (nav, onboarding, CTAs, errors, empty) plus a sample of the rest.

Checks: meaning match; Sie register; umlauts/ß; native button/title/error phrasing; placeholders intact; no leftover English stubs (Datly OK).

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `dataThread.emptySession` | high | Empty-state grammar is broken. "welche zu laden" has no object, so the job ("load some data") is not said. | Bitten Sie den Agenten unten, Daten zu laden. Sie erscheinen hier, sobald sie bereit sind. |
| `appBar.joinDiscord` | high | Toolbar CTA dropped the verb. Reads as an English leftover ("Discord") vs EN "Join Discord". | Discord beitreten |
| `errors.validationError` | medium | "Prüffehler" is not native error phrasing for a validation failure. | Validierungsfehler |
| `appBar.pipInstall` | medium | Toolbar CTA is leftover English ("pip install"). | Mit pip installieren |
| `chart.emptyStateChatHint` | medium | "probieren" without "aus" is incomplete German. | Probieren Sie das Chatfeld unten links aus. |
| `chart.deleteChartYes` | medium | Confirm-dialog CTA is lowercase "löschen". German buttons start with a capital. | Löschen |
| `chart.deleteChartCancel` | medium | Same confirm pair: lowercase "abbrechen". | Abbrechen |
| `landing.tagline` | medium | Verb dropped vs EN "See the story in your tables." | Sehen Sie die Geschichte in Ihren Tabellen. |
| `chart.msgEncodingEmpty` | medium | Calque of "Put data fields to chart builder". | Ziehen Sie Felder in den Diagrammeditor oder beschreiben Sie, was Sie möchten! |
| `upload.contentExceedsSizeLimit` | medium | All-caps DATENBANK is leftover from EN DATABASE shout. Placeholders `{{limit}}` `{{size}}` stay. | Inhalt überschreitet das Limit von {{limit}} MB. Aktuelle Größe: {{size}} MB. Für große Datensätze die Registerkarte Datenbank verwenden. |
| `dataLoading.capabilityHint` | low | "Fokussieren Sie das Feld" is English "Focus the input". | Klicken Sie in das Feld unten, um Beispielprompts zu sehen. |
| `encoding.tooltip` | low | Leftover English channel label. | Kurzinfo |
| `dataThread.hmm` | low | Leftover English stub. | hm… |
| `loader.databricks.authInstructions` | low | Databricks click path left in English (Connection details, Settings, Developer, Access tokens). Field placeholders and code spans stay. | Registerkarte **Verbindungsdetails**. Kopieren Sie **Serverhostname** und **HTTP-Pfad**. Profilbild → **Einstellungen → Entwickler → Zugriffstoken → Neues Token erzeugen**. |

## What passed

- Onboarding: `onboarding.languageTitle` / `languageIntro` / `continue` are Sie, native ("Wählen Sie Ihre Sprache", "Weiter"), Datly kept.
- Nav: `navigation.*` and `appBar.session|explore|reports|data|about` are German labels, not English stubs.
- Core CTAs: Speichern, Abbrechen, Schließen, Löschen, Weiter, Anmelden, Hochladen match German UI infinitives.
- Errors: rest of `errors.*` reads as German failure copy (Anmeldung erforderlich, Zugriff verweigert, Sitzung abgelaufen).
- Empty: `emptySessionTitle`, `messages.noMessages`, `chatDialog.noHistory`, `sidebar.noSessions`, `knowledge.noItems`, `preview.noTablesToPreview` are native.
- Register: no du/dein/dich. Sie/Ihre/Ihnen used on addressed strings.
- Orthography: umlauts present (Größe, wählen, für, öffnen). ß used where required (Schließen, groß). Reform "muss" / "dass" is correct, not a missing ß.
- Placeholders: `{{name}}` / `{{count}}` / `{{count, number}}` / `_one` `_other` `_plural` / `<refreshAction>` / `<strong>` match en. Datly untranslated.

## Slice outcome

P0 chrome is mostly native Sie German. Fail rewrite on `dataThread.emptySession` and `appBar.joinDiscord`. Remaining table rows are polish, not a tree rewrite.

Not a fail here: product nouns (Datly, GitHub, Discord, Backend, DataFrame, Heatmap, Boxplot, Streamgraph) and command tokens (`pip`, `az login`) left in English.

Not exercised in this verify: live Deutsch switch, CTA clip at 960×640, or i18next interpolation at runtime.
