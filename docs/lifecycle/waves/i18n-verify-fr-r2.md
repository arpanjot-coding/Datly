# Independent verify r2: L-fr

Slice: `L-fr` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Verifier did not write `fr` and did not apply the r1 six-key rewrite. Static re-read of `src/i18n/locales/fr/*.json` against English meaning SSOT `src/i18n/locales/en/*.json` and against r1 `docs/lifecycle/waves/i18n-verify-L-fr.md`. Tests not executed.

Scope: r1 rewritten keys, P0 (nav, onboarding, CTAs, errors, empty), vous, accents, placeholders, leftover English, `config.language`.

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `landing.firstSelectModelPrefix` | medium | First-run wall concatenates this with `model.selectModels` (`Choisir les modèles`). `D'abord,` wants an imperative, not a capital infinitive. Reads as a calque of `First, let's`. | Commencez par |
| `model.selectModels` | medium | Pair of the row above. Infinitive plural on the inline CTA. Vous on the wall would match `model.selectModel` / `pleaseSelectModel`. | choisissez un modèle |
| `errors.dbQueryError` | medium | Missing `de`. Native error phrasing is `requête de base de données`, not `requête base de données`. | Erreur de requête de base de données |
| `chart.deleteChartYes` | low | Confirm CTA is lowercase `supprimer`. French dialog buttons start with a capital. Pair: `deleteChartCancel` `annuler`. | Supprimer |
| `chart.deleteChartCancel` | low | Same confirm pair: lowercase `annuler`. | Annuler |
| `loader.cosmosdb.authInstructions` | low | Azure click path left in English (`*Keys*`). Field names and code spans stay. | … sous *Clés* de votre compte Cosmos DB. |
| `loader.local_folder.authInstructions` | low | Points at **Parcourir**. The folder control is `upload.selectFolder` (`Choisir un dossier`). | Cliquez sur **Choisir un dossier** pour ouvrir un sélecteur de dossier, ou collez un chemin de répertoire. |

## R1 rewritten keys (re-checked)

| Key | R1 first-pass | Now |
|-----|---------------|-----|
| `workspace.importZip` | workspace clipped to espace | Importer un espace de travail (.zip) |
| `upload.upgrade.featureWorkspaces` | same clip | Espaces de travail persistants et connaissances de l'agent |
| `dataLoading.loadPlan.loadInNewWorkspace` | dropped de travail | Charger dans un nouvel espace de travail |
| `dataLoading.loadPlan.addToCurrent` | pair of the row above | Ajouter à l'espace de travail actuel |
| `upload.folderPathPlaceholder` | missing accent: donnees | /chemin/vers/votre/dossier/de/données |
| `upload.contentExceedsSizeLimit` | leftover DATABASE shout | … onglet Base de données … (`{{limit}}` `{{size}}` kept) |

All six hold. Glossary workspace is `espace de travail` on those CTAs.

## `config.language`

Present in `fr` and `en`: `Langue`. Settings `t('config.language')` is native. Not a leftover English stub.

## P0 that still match

- Onboarding: `onboarding.languageTitle` Choisissez votre langue; `languageIntro` Datly + Vous pourrez + Paramètres; `continue` Continuer.
- Nav: `navigation.*` Accueil, Données, Visualisation, Rapport, Discussion, À propos, Commencer l'exploration. `appBar.session|explore|reports|data|about` native. GitHub kept as brand.
- CTAs: Enregistrer, Annuler, Fermer, Supprimer, Continuer, Charger, Connexion, Appliquer, Confirmer.
- Errors: Authentification requise; Session expirée. Veuillez vous reconnecter.; Accès refusé; Une erreur inattendue s'est produite; Le stockage de l'espace de travail est plein. Placeholders intact.
- Empty: `dataThread.emptySessionTitle` Pas encore de données ici; `emptySession` Demandez à l'agent…; `chart.emptyStateTitle` / `emptyStateSubtitle`; `session.noSavedSessions`; `sidebar.noSessions` / `emptyTree` / `emptyWorkspace`; `logs.empty`; `preview.noTablesToPreview`; `messages.noMessages`.

Vous register held (vous / votre / vos / veuillez / -ez). No tu / toi / tes as address. Accents present (Français lives on the picker cards, not in the JSON; données, Paramètres, À propos, Choisissez). No em dashes in `fr/*.json`. Sampled placeholders match en: `{{name}}`, `{{count}}`, `{{count, number}}`, `{{limit}}` / `{{size}}`, `<refreshAction>`, `<strong>`, loader `<user>` `<host>` `<port>` `<database>`. Plural suffixes `_one` / `_other` / `_plural` match en.

## Slice outcome

**Pass.** R1 highs are gone. P0 onboarding, nav, CTAs, errors, and empty states are native vous French with accents and placeholders intact. `config.language` is Langue. Remaining rows are leftover nits (model-wall concatenation, missing `de` on a db error, lowercase chart confirm, Azure *Keys*, Browse vs Choisir un dossier). Not highs. Not a fail.

Not a fail here: Datly, GitHub, Discord, Chartifact, Python, Azure, Vega-Lite, BETWEEN, CONTAINS, Spec, Auto, Info, Session, (yes/no) on mssql encrypt because the ODBC string uses those literals.

Not exercised: live `changeLanguage('fr')`, CTA clip at 960×640, or i18next interpolation at runtime.
