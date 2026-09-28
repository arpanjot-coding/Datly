# Independent verify r2: L-ja

Locale: `ja`  
Follow-up to `docs/lifecycle/waves/i18n-verify-ja.md`. Verifier did not write `src/i18n/locales/ja/`. Static read only. Product files not edited.

Pass gate: `config.language` is 言語, and listed highs/mediums from r1 are fixed. Also re-read P0 onboarding and nav.

## Highs and mediums (r1)

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| config.language | high | none. Now `言語` in `config`. Settings row is native. | n/a |
| workspace.errorOccurred | medium | none. Now `エラーが発生しました。` so the App link can follow. | n/a |
| landing.tagline | medium | none. Now `テーブルの物語を、見える形に。` | n/a |
| about.dataHandlingText | medium | none. First clause is browser-only storage. | n/a |
| report.createdWithAI | medium | none vs r1 text. Now `Datly の AI で作成`. | n/a |
| onboarding.languageTitle | medium | none. Overlay h1 is `言語を選択`. Continue stays `続ける`. | n/a |
| dataLoading.sectionTry | medium | none. Now `やってみる`. | n/a |
| sidebar.largeTableChatPrompt | medium | none. `これらは` matches “These”. Placeholders intact. | n/a |
| knowledge.replay | medium | none. Now `再実行`. | n/a |
| dataLoading.examples.extractFromTextPrompt | medium | none. `為替一定ベース` throughout. No leftover 定額通貨. | n/a |

## Remaining lows (not in pass gate)

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| session.quickResume | low | Still `すぐ再開`. Clipped menu label. | すぐに再開 |
| chart.emptyStateOrPickType | low | Still dictionary form on a sentence. | または、チャートの種類を選んで自分で始めることもできます |
| chart.iLikeIt | low | Still past-tense `気に入りました` on a toggle. | 気に入った |
| model.default | low | Still `デフォルト`. | 既定 |
| encoding.default | low | Still `デフォルト`. | 既定 |
| dataLoading.capabilityHint | low | Still `フォーカスする`. | 下の入力欄を選ぶと、例のプロンプトが表示されます。 |
| loader.local_folder.authInstructions | low | Still points at **ファイルを選ぶ**. Form control is `フォルダーを選ぶ`. | **フォルダーを選ぶ** をクリックするか、ディレクトリパスを貼り付けてください。 |

## P0 onboarding and nav

Nav (`navigation.*`, `appBar.session` / `explore` / `reports` / `about`, footer) unchanged and still native. First-run: `言語を選択`, intro です/ます, `続ける`. Model wall prefix `まずは` plus `model.selectModels` `モデルを選択`.

## Slice outcome

Pass. `config.language` is 言語. All r1 highs and mediums are fixed in the ja trees.

Not a fail here: `report.createdWithAI` plus `app.name` still concatenates to `Datly の AI で作成 Datly` in `ChartifactDialog.tsx`. The ja string matches the r1 suggestion. If a later pass touches it, use a prefix such as `AI を使って作成:` so Datly is not doubled.

Lows above can wait. Not exercised: live `changeLanguage('ja')`.
