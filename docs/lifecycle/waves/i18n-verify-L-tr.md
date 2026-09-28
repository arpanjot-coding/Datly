# Independent verify: L-tr

Slice: `L-tr`  
Verifier did not write the original `tr` tree. Static read of `src/i18n/locales/tr/*.json` against English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

First pass failed on informal sen CTAs (`dene` / `başla` / `aç` in multi-word chrome), missing ğ/ş/ö/ü (`klasorunuzun`, `sirket`), analysis replay as media `oynat`, encoding aggregate clipped to SUM (`Topla`), and unreadable `Azl` short labels. Those keys were rewritten in `tr` only, then re-checked. English was not edited.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 | Pass | String-leaf key set equals `en` for each of the 10 filenames. Vega locale arrays are not counted as string leaves. | Same 10 JSON names. Structural `"key":` line counts match file-for-file: `common` 993, `chart` 222, remaining eight files 665 combined (`encoding` `messages` `upload` `model` `dataLoading` `loader` `navigation` `errors`). Parent keys sit on the same lines. `chart.vegaLocale` `periods` / `days` / `shortDays` / `months` / `shortMonths` are arrays in both (not string leaves). Format strings `dateTime` / `date` / `time` are present. Turkish day and month names are filled (Pazar, Ocak, Şubat) and match official d3-time-format `tr-TR` (including `AM`/`PM` periods). | n/a |
| A2 | Pass | Register siz throughout UI copy, not informal sen. Dotted/dotless i and ğ ş ö ü ç where the word needs them. Meaning matches the English job. | Addressed copy uses siz: `onboarding.languageTitle` Dilinizi seçin, `languageIntro` değiştirebilirsiniz, `chart.emptyStateTitle` hazır mısınız / verilerinizi, `chartRec.couldYouClarify` Açıklar mısınız?, `chatDialog.you` Siz, `db.askAgentPrompt` yardım edin. Questions are mısınız / misiniz, not mısın. Short command stems on buttons (Kaydet, Sil, Yeniden dene as Retry) stay the Turkish UI convention. First pass had sen on P0 CTAs (`navigation.tryOnlineDemo` demoyu dene, `startExploration` Keşfe başla) and ASCII-stripped `klasorunuzun` / `sirket`; rewritten. `encoding.aggregate` first pass was Topla (SUM); rewritten to Toplama. Knowledge replay first pass used oynat (media play); rewritten to yeniden çalıştır. `knowledge.replayPrompt` first pass had sütun göndermelerini; rewritten to sütun başvurularını. Card label Türkçe lives in `NATIVE_LANGUAGE_LABELS`, not in the locale JSON. | n/a |
| A3 | Pass | Placeholders `{{name}}` / i18next plural suffixes / HTML tags such as `<refreshAction>` and `<strong>` match `en`. | Sampled tokens match by name: `{{count}}`, `{{name}}`, `{{table}}`, `{{message}}`, `{{count, number}}`, `{{sampleSize}}` / `{{totalSize}}`, `{{shown}}` / `{{total}}`, `{{content}}`, `{{live}}`. Plural suffixes present on both: `textTurnEarlier_other`, `tablesAvailableToAgent_other`, `earlierTurns_other`, `columnCount_one` / `_other`, `dataLoading` `loadedCount_plural`, `previewColumns_plural`, `previewShowingRows_plural`, `failedSteps_plural`, `partialFailure_plural`. `appBar.errorOccurred` keeps `<refreshAction>…</refreshAction>`. `workspace.deleteConfirm` keeps `<strong>{{name}}</strong>` and `{{id}}`. Loader CLI spans keep `<user>` `<host>` `<port>` `<database>` `<name>` `<server>`. `dataLoading.chatHint` is `""` in both trees. `landing.demoBannerBody` + `demoBannerCta` + `demoBannerSuffix` rebuild …için kurulum kılavuzuna bakın. | n/a |
| A4 | Pass | No leftover English stubs shipped as the translation. Allow Datly, GitHub, Chartifact, Python, Azure, Vega-Lite, BETWEEN, CONTAINS, Spec, Discord, DuckDB, ECharts, Chart.js, LiteLLM. | P0 strings are Turkish, not pasted English. Connector tokens `BETWEEN` / `CONTAINS` kept. `chart.gallery.spec` Spec kept. Brands Datly, GitHub, Chartifact, Python, Azure, Vega-Lite, Discord, DuckDB, ECharts, Chart.js, LiteLLM stay. `loader.mssql.encrypt` / `trust_server_certificate` keep `(yes/no)` because `mssql_data_loader.py` writes those literals into the ODBC string. `editDataMemory` is `data-memory.md` in both. Vega periods `AM`/`PM` match official d3 `tr-TR`. | n/a |
| A5 | Pass | P0 chrome is native: navigation, onboarding.languageTitle, onboarding.languageIntro, onboarding.continue, primary CTAs, errors, empty states. | `navigation.*`: Ana sayfa, Veri, Görselleştirme, Rapor, Sohbet, Hakkında; startExploration Keşfe başlayın; tryOnlineDemo Çevrimiçi demoyu deneyin. `onboarding.languageTitle` Dilinizi seçin. `languageIntro` Datly bu dili her yerde kullanır. Daha sonra Ayarlar'dan değiştirebilirsiniz. `continue` Devam. CTAs: Kaydet, İptal, Kapat, Sil, Devam, Yükle, Bağlan, Oturum aç. `errors.*` native (Kimlik doğrulama gerekli, Oturumun süresi doldu. Lütfen yeniden oturum açın, Erişim reddedildi). Empty: `dataThread.emptySessionTitle` Burada henüz veri yok, `emptySession` Aşağıdaki ajandan…, `chart.emptyStateTitle` / `emptyStateSubtitle`, `session.noSavedSessions`, `sidebar.noSessions` / `emptyTree` / `emptyWorkspace`, `logs.empty`, `preview.noTablesToPreview`, `messages.noMessages` / `noData`. | n/a |
| A6 | Pass | Product name stays Datly. Glossary-stable product nouns: session, workspace, chart, encoding, model, agent. | Datly appears in the same nine leaves as `en` (`app.name`, `app.loadingProduct`, `landing.modelTip`, `refresh.installLocallyForUpload`, `db.confirmDeleteTableLoaded`, `auth.loginTitle`, `onboarding.languageIntro`, `upload.installLocallyTooltip`, `loader.mssql.authInstructions`). session is oturum. chart is grafik. encoding is kodlama. model is model. agent is ajan. workspace is çalışma alanı on the main tree (`workspace.importZip`, `upload.upgrade.featureWorkspaces`, `dataLoading.loadPlan.loadInNewWorkspace` / `addToCurrent`). `loader.databricks.authInstructions` Databricks çalışma alanı is the Databricks product workspace, not Datly workspace. | n/a |
| A7 | Pass | No em dashes. Watch length on toolbar and buttons. | No `—` in `src/i18n/locales/tr/*.json`. EN em dashes were recast as periods or dropped (`chart.emptyStateSubtitle`, `errors.authExpired`, `dataLoading.stopped` is `durduruldu`). Short controls stay short: `session.resetButton` Sıfırla, `db.asc` / `desc` Art. / Az. (first pass Azl was unreadable; rewritten), `encoding.ascShort` ↑ art., `chart.addChart` Grafik ekle, `onboarding.continue` Devam. | n/a |

## Rewritten keys (first pass Fail, then re-check Pass)

| Key | First-pass problem | After rewrite |
|-----|--------------------|---------------|
| `navigation.startExploration` | P0 CTA used sen `başla`. | Keşfe başlayın |
| `navigation.tryOnlineDemo` | P0 CTA used sen `dene`. | Çevrimiçi demoyu deneyin |
| `about.startExploration` | Same sen stem as nav. | Keşfe başlayın |
| `about.tryOnlineDemo` | Phrase used sen `aç` (EN job is Open workspace). | Çalışma alanını açın |
| `dataLoading.sectionTry` | Chip used sen `dene`. | Bir görev deneyin |
| `upload.folderPathPlaceholder` | Missing ğ/ş/ö/ü: klasorunuzun. | /veri/klasörünüzün/yolu |
| `loader.superset.url` | Missing ş: sirket. | … https://bi.şirket.com |
| `loader.superset.authInstructions` | Same sirket in the example URL. `{{none}}` n/a. | `https://bi.şirket.com` |
| `encoding.aggregate` | Topla is SUM, not the aggregate shelf (sum / avg / count). | Toplama |
| `encoding.ascShort` / `descShort` | `azl` was unreadable on the encoding shelf. | ↑ art. / ↓ az. |
| `db.asc` / `db.desc` | Same `Azl` clip on the import sort control. | Art. / Az. |
| `knowledge.replay` | oynat is media play, not replay this analysis. | Yeniden çalıştır |
| `knowledge.replayTooltip` | Same oynat. | Bu analizi geçerli veri üzerinde yeniden çalıştır |
| `knowledge.replayBusy` | Same oynat. | Ajan meşgul. Yeniden çalıştırmadan önce işini bitirmesini bekleyin. |
| `knowledge.replayNoData` | Same oynat. | Bir iş akışını yeniden çalıştırmadan önce bir veri kümesi yükleyin. |
| `knowledge.replayStarted` | Same oynat. | İş akışı geçerli veri üzerinde yeniden çalıştırılıyor… |
| `knowledge.workflowsDescription` | Same oynat on the workflows blurb. | …yeniden çalıştırabileceği… |
| `knowledge.distillHint` | Same oynat. | …yeniden çalıştırması… |
| `knowledge.distillSessionHint` | Same oynat. | …yeniden çalıştırabileceği… |
| `knowledge.workflowsHint` | Same oynat. | …Yeniden çalıştırın. |
| `knowledge.replayPrompt` | column references became sütun göndermelerini. `{{content}}` kept. | …sütun başvurularını… |

## Slice outcome

All seven listed checks Pass after the key rewrites. L-tr goal (native Turkish P0 chrome, siz, ğ ş ı İ ö ü ç, placeholders intact, Datly kept) is met in source.

Not a fail here: short Retry / Test buttons stay `Yeniden dene` / `Dene` (Turkish UI command stem, not sen address). `config.language` is Dil in both trees.

Not exercised in this verify: live `changeLanguage('tr')`, CTA clip at 960×640, or i18next interpolation at runtime.
