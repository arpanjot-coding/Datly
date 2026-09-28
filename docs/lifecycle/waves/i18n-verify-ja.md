# Independent verify: L-ja

Locale: `ja`  
Verifier did not write `src/i18n/locales/ja/`. Static read against English meaning SSOT `src/i18n/locales/en/*.json`. Product files not edited.

Checks: meaning, です/ます, spoken UI (button / title / error), placeholders, leftover English (Datly allowed).

P0 covered: nav (`navigation.json`, `appBar`, `sidebar`, `footer`), first-run (`onboarding.*`, `landing.*`, model wall `model.selectModels`), CTAs, `errors.json` plus upload/session/workspace errors, empty states (`dataThread.emptySession*`, `session.noSavedSessions`, `chart.noChart` / `emptyState*`, `logs.empty`, `sidebar.emptyTree` / `noSessions`). Sample beyond P0: Settings label, report attribution, data-loading assistant, knowledge replay, extract example.

## Verdict table

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| config.language | high | Missing in ja (also missing in en). Settings uses `t('config.language', { defaultValue: 'Language' })`, so the later language row stays English after 日本語. P0 leftover stub. | 言語 |
| workspace.errorOccurred | medium | Prefix is a full stop sentence. App then appends the refresh link and a hardcoded `. `. Reads as 「エラーが発生しました。セッションを再読み込み.」 which a speaker would not say on an error line. | エラーが発生しました。 |
| landing.tagline | medium | Job is the marketing line “See the story in your tables.” Current 「テーブルの中の物語を、見えるように。」 is unfinished translation-flavored copy, not です/ます, not a line someone would put on the landing. | テーブルの物語を、見える形に。 |
| about.dataHandlingText | medium | 「ブラウザーのみではデータはブラウザー内に保存」 garbles the first clause. Meaning should be browser-only storage, not “if browser-only, then stored in the browser.” | データはブラウザー内のみに保存 • ローカルインストールは本機の Python で実行。オンラインデモはサーバー側で処理（保存しません） • LLM にはプロンプト付きの小さなサンプルだけが渡されます |
| report.createdWithAI | medium | Composed as `{createdWithAI} {app.name}` → 「AI で作成 · Datly」. Does not say created with AI using Datly. The middle dot does not read as を使って. | Datly の AI で作成 |
| onboarding.languageTitle | medium | Overlay h1. 「言語を選んでください」 is a spoken request, not a title. です/ます ください is wrong register for a heading. Continue 「続ける」 is fine. | 言語を選択 |
| dataLoading.sectionTry | medium | Chip / section CTA for “Try a task.” 「作業を試す」 is stiff and not what someone taps. | やってみる |
| session.quickResume | low | Menu label. 「すぐ再開」 is clipped. A speaker would say すぐに or use a noun label. | すぐに再開 |
| chart.emptyStateOrPickType | low | Empty-state sentence in dictionary form. Nearby title/subtitle already use です/ます / ませんか. | または、チャートの種類を選んで自分で始めることもできます |
| chart.iLikeIt | low | Toggle. 「気に入りました」 is past-tense report, not a control label. | 気に入った |
| model.default | low | EN “Default.” Elsewhere ja uses 既定 (`session.resetToDefault`). 「デフォルト」 is a leftover English loan on a control. | 既定 |
| encoding.default | low | Same loan as `model.default`. | 既定 |
| dataLoading.capabilityHint | low | 「入力欄にフォーカスすると」 is calque of “focus.” | 下の入力欄を選ぶと、例のプロンプトが表示されます。 |
| sidebar.largeTableChatPrompt | medium | Sample agent prompt. 「次は全体を取り込むには大きすぎます」 misreads “These are too large.” Placeholders `{{connector}}` `{{tables}}` `{{large}}` are intact. | 「{{connector}}」から次のテーブルを読み込みたいです: {{tables}}。これらは全体を取り込むには大きすぎます: {{large}}。テーブル全体ではなく、フィルター、サンプリング、または集計した一部の読み込みを手伝ってください。 |
| knowledge.replay | medium | Sample CTA. 「再生」 sounds like media play, not replay this analysis on current data. | 再実行 |
| dataLoading.examples.extractFromTextPrompt | medium | Sample extract text. 「定額通貨ベース」 is the wrong term for constant currency. Placeholders none. | 為替一定ベース（定額通貨ベースをすべて置き換え） |
| loader.local_folder.authInstructions | low | Points at **ファイルを選ぶ**, but the control on that form is `upload.selectFolder` 「フォルダーを選ぶ」. | `root_dir` にデータファイルのあるローカルディレクトリを指定してください。 **対応形式:** CSV、TSV、Parquet、JSON、JSONL、Excel（.xlsx/.xls） **フォルダーを選ぶ** をクリックするか、ディレクトリパスを貼り付けてください。 |

## What passed

- Nav, first-run Continue, model-wall 「まずは」 + 「モデルを選択」, auth guest/sign-in, and primary empty/error strings match the job and sound like UI Japanese.
- Sentence copy is です/ます. Buttons and nav correctly stay 体言止め (保存, 続ける, 探索を始める). That split is what a speaker would say.
- Sampled placeholders stay intact: `{{count}}`, `{{name}}`, `{{table}}`, `{{message}}`, `{{count, number}}`, `<refreshAction>`, `<strong>`. `dataLoading.previewShowingRows` reorders `{{shown}}` / `{{total}}` on purpose and keeps both.
- No pasted English sentences in the ja JSON trees. Datly, GitHub, Discord, pip, CSV, product APIs, and path examples are acceptable leftovers.
- `landing.demoBannerBody` + `demoBannerCta` + `demoBannerSuffix` rebuild a real Japanese sentence around the guide link.

## Slice outcome

Fail. P0 chrome is mostly native, but Settings still shows English “Language”, and the keys in the table need a rewrite pass (then re-verify those rows only).

Not a ja-file fail: `config.language` is also absent from en. ja should still add 言語 so the Settings row is native.

Not exercised: live `changeLanguage('ja')` in the running app.
