# Independent verify: L-tr

Slice: `L-tr` in `docs/lifecycle/work-packages/F-i18n-W.md`  
Writer sidecar `docs/test-runs/.worker-done/L-tr.md`. Verifier did not write `tr`. Static read of `src/i18n/locales/tr/*.json` against English meaning SSOT `src/i18n/locales/en/*.json`. Tests not executed.

Scope: P0 (nav, onboarding, CTAs, errors, empty) plus a sample of the rest.

Checks: meaning match; siz register; diacritics ğ ş ı İ ö ü ç; native button/title/error phrasing; placeholders intact; no leftover English stubs (Datly OK).

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `upload.folderPathPlaceholder` | medium | Path example dropped ö and ü (`klasorunuzun`). Diacritic check. | `/veri/klasörünüzün/yolu` |
| `dataLoading.loadPlan.fromSource` | medium | English job is the preposition from, concatenated as `from Postgres`. Turkish `kaynak` is the noun source, so the line reads kaynak Postgres. | `kaynak:` |
| `report.from` | medium | Same clip. EN from. Token sits after `createA` + `chart`. | `şundan` |
| `upload.from` | medium | Same from-to-kaynak clip on upload chrome. | `kaynak:` |
| `encoding.facets` | medium | Yüzey is surface. Vega facet is a small-multiples split. Same family: `gallery.sectionLabels.facets`, `channelColumn_tip` / `channelRow_tip` (yatay/dikey yüzeyler), gallery `entryLabels.facet*`. | `bölmeler` |
| `knowledge.fileNamePlaceholder` | low | `kuralim.md` uses dotted i. Possessive is kuralım with ı. | `ör. kuralım.md` |
| `chart.vegaLocale.periods` | low | AM/PM left in English. Official tr-TR d3 uses ÖÖ / ÖS. Date still slash, not dot. | `["ÖÖ", "ÖS"]` and `"%d.%m.%Y"` |
| `model.testModel` | low | Test became dene (try). Same family: `testAndSave`, `testConnection`, `retest`, `addAndTestModel`. | `Modeli sına` |
| `encoding.descShort` | low | azl is not a readable short of azalan. Pair `db.desc` Azl. | `az.` |
| `db.dropTable` | low | Düşür is a drop calque. Native SQL chrome says sil or kaldır. | `Tabloyu sil` |
| `loader.cosmosdb.authInstructions` | low | Azure click path left as *Keys*. Field names and code spans stay. | Azure Portal *Anahtarlar* bölümünden uç noktayı ve anahtarı alın. |
| `app.filter` | low | Süz is a real verb and matches süzgeç, but speakers tap Filtrele on this control. | `Filtrele` |

## What passed

- Onboarding: `onboarding.languageTitle` Dilinizi seçin; `languageIntro` Datly bu dili her yerde kullanır. Daha sonra Ayarlar'dan değiştirebilirsiniz.; `continue` Devam. Siz possessives and -siniz. Datly kept.
- Nav: `navigation.home` Ana sayfa, `data` Veri, `visualization` Görselleştirme, `report` Rapor, `chat` Sohbet, `about` Hakkında. `appBar.session|explore|reports|data|about` native. GitHub / Video kept as brands. Short commands (Kaydet, Keşfe başla) use the Turkish UI infinitive, not sen pronouns.
- Core CTAs: Kaydet, İptal, Kapat, Sil, Onayla, Uygula, İleri, Yükle, Devam, Oturum aç. Duplicate is Çoğalt, distinct from Kopyala. Formulate family is Hazırla throughout (`encoding.formulate`, `messages.formulate`, timeout copy). `dataLoading.loadPlan.loadInNewWorkspace` Yeni çalışma alanında yükle matches the English job.
- Errors: `errors.authRequired` Kimlik doğrulama gerekli; `authExpired` Oturumun süresi doldu. Lütfen yeniden oturum açın; `accessDenied` Erişim reddedildi; `internalError` Beklenmeyen bir hata oluştu; `storageFull` Çalışma alanı depolaması dolu. `auth.sessionExpired` matches. Lütfen + -ın siz.
- Empty: `dataThread.emptySessionTitle` Burada henüz veri yok; `emptySession` Aşağıdaki ajandan veri yüklemesini isteyin.; `chart.emptyStateTitle` / `emptyStateSubtitle`; `session.noSavedSessions`; `sidebar.noSessions` / `emptyTree` / `emptyWorkspace`; `logs.empty`; `preview.noTablesToPreview`; `messages.noMessages`; `knowledge.noItems`.
- Register: no sen / senin / sana. Addressed copy uses siz / sizin / -ınız / -in / Lütfen (`landing.tagline` Tablolarınızdaki, `chart.msgTable` istediğinizi, `model.pleaseSelectModel` Lütfen bir model seçin, `auth.loginTitle` oturum açın).
- Orthography: ğ ş ı İ ö ü ç present on P0 (Görselleştirme, Dilinizi, İptal, Lütfen, değiştirebilirsiniz, Kimlik). No em dashes in `tr/*.json`. EN em dashes recast as periods.
- Placeholders: `{{name}}` / `{{count}}` / `{{count, number}}` / `{{limit}}` `{{size}}` / `_one` `_other` `_plural` / `<refreshAction>` / `<strong>` match en. Loader CLI spans keep `<user>` `<host>` `<port>` `<database>` `<name>` `<server>`. Datly untranslated. `config.language` is Dil.

## Slice outcome

P0 chrome is native siz Turkish with diacritics and placeholders intact. Remaining table rows are polish (from became kaynak, one path missing ö/ü, facet translated as surface). Not highs. Not a fail.

**Pass.**

Not a fail here: product nouns (Datly, GitHub, Discord, Chartifact, Python, Azure, Vega-Lite, DuckDB, BETWEEN, CONTAINS, Spec) and command tokens (`pip`, `az login`, mssql `(yes/no)` because the ODBC string uses those literals).

Not exercised in this verify: live Türkçe switch, CTA clip at 960×640, or i18next interpolation at runtime.
