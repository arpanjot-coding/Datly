# Independent verify: L-zh

Locale: `zh` (`src/i18n/locales/zh/*.json`)  
English meaning SSOT: `src/i18n/locales/en/*.json`  
Verifier did not write `zh`. Static copy read only. Tests not executed.

Checks: meaning, Simplified only (no 繁體), grammar/formality, spoken UI, placeholders `{{name}}` / `{{count}}`, no English stubs as the translation (Datly / GitHub / Python and similar brands OK).

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `dataLoading.loadPlan.loadInNewWorkspace` | high | CTA reads as “load a new workspace”. English job is load tables **in** a new workspace. | 在新工作区中加载 |
| `encoding.formulate` / `messages.formulate` | high | Primary action is 生成 (generate). English job is formulate / prepare data for the chart. Same family is 整理数据, 整理并覆盖, and 数据构建 elsewhere, so the button, empty hint, and success toast disagree. | 整理 |
| `encoding.formulateAndOverride` / `messages.formulateAndOverride` | high | 生成并覆盖. `chartRec.formulateAndOverride` is already 整理并覆盖. | 整理并覆盖 |
| `encoding.formulationSucceeded` | medium | 构建 is a third verb for the same formulate job. | {{fields}} 的数据已整理完成。 |
| `config.formulateTimeout` (and hint / timeout errors that quote it) | medium | Settings say 生成超时. If the button becomes 整理, this label no longer matches the control it describes. | 整理超时（秒） |
| `app.duplicate` | medium | Same string as `app.copy` (复制). Duplicate and Copy are not distinguishable. | 创建副本 |
| `errors.internalError` | medium | English is an unexpected error. Chinese blames the server. | 发生了意外错误 |
| `errors.llmAuthFailed` | medium | Says the API key is invalid. English is auth failed, check the key. | 身份验证失败，请检查 API 密钥 |
| `model.active` | medium | 活跃 is not a status chip people say. Pairing with 未启用 is uneven. | 使用中 |
| `model.azureCliAccess` | medium | 账户 {{user}} 获准使用 is stiff and hard to parse. | 你可以使用账户 {{user}} 有权访问的 Azure 模型。 |
| `dataLoading.capabilityHint` | medium | 聚焦 is a calque of “Focus the input”. Not what someone says on empty helper text. | 点击下方输入框可查看示例提示 |
| `sidebar.andMore` | medium | “+{{count}} 更多” is English word order. | 还有 {{count}} 项 |
| `chart.chartBuilder` | medium | 配置 is settings. This label is the builder pane (`VisualizationView`). | 图表构建 |
| `common.dataLoading.loadingThread` | medium | 加载链路 is not “loading”. Thread elsewhere is 线程. | 加载中 - {{index}} |
| `knowledge.threadHeader` / `knowledge.sessionStatsLine` | medium | Analysis thread is 线索 here and 线程 in `dataThread`. | 线程 {{idx}} · {{label}} / 会话 · {{threads}} 个线程 · {{steps}} 个步骤 |
| `db.watchMode` / `dataThread.watchForUpdates` | medium | 监听 is listen. This control auto-refreshes data. | 自动刷新 / 自动检查更新 |
| `dataThread.tablesAvailableToAgent` | medium | 助手 here, Agent on nearby chrome (`Agent 规则`, `chartRec.agent`). | 可供 Agent 使用 {{count}} 张表 |
| `upload.nameYourConnection`, `messages.agent.clarifyExhausted`, `report.imageCopied`, `report.failedToCopyClipboard`, `report.clipboardNotSupported`, `dataThread.startingRun`, `auth.migration.description`, plus 您 in `loader.*.authInstructions` | medium | Onboarding and most chrome use 你. These switch to 您. | Keep 你 (example: 为你的 {{type}} 连接命名。) |
| `sidebar.tableCount` | low | 个表格 vs 张表 used for the same object elsewhere. | {{count}} 张表 |
| `encoding.refreshIdeas` | low | 想法 vs 灵感 used for the same ideas CTA family. | 刷新灵感 |
| `loader.mssql.encrypt` / `trust_server_certificate` | low | leftover English yes/no on a field hint. | 启用加密（是/否） |
| `report.styleExecutiveSummary` | low | 高管摘要 is understandable. 执行摘要 is the usual report label. | 执行摘要 |

## P0 that passed

- First-run: `onboarding.languageTitle` 选择语言, `languageIntro` (native, placeholders n/a), `continue` 继续. Model wall `landing.firstSelectModelPrefix` 请先 plus `model.selectModels` 选择模型. Speakers would say this.
- Nav: `navigation.home` 首页, `data` 数据, `visualization` 可视化, `report` 报告, `chat` 对话, `startExploration` 开始探索. Brands GitHub / Agent kept on purpose.
- Common CTAs: 保存 / 取消 / 关闭 / 删除 / 应用 / 确认 / 下一步 / 加载 / 连接 / 登录.
- Errors: `errors.authRequired` 请先登录, `authExpired`, `fileParseError`, `storageFull`, catalog and LLM timeouts. Placeholders intact.
- Empty: `dataThread.emptySessionTitle` 这里还没有数据, `chart.emptyStateSubtitle`, `logs.empty`, `session.noSavedSessions`, `sidebar.noSessions`, `preview.noTablesToPreview`, `messages.noData` 暂无数据.
- Simplified only: no 繁體 characters in `zh/*.json`.
- Placeholders: `{{name}}`, `{{count}}`, `{{count, number}}`, HTML tags, and i18next `_other` / `_plural` names match `en`.
- No leftover English sentence shipped as the zh string on P0 chrome. Sample English kept where it is a brand, path, code ident, or sample source text (`dataLoading.examples.extractFromTextPrompt`).

## Outcome

**Fail.** First-run, nav, most errors, and empty states are native Simplified Chinese with placeholders intact. Fail the polish bar because P0 CTAs disagree on meaning: formulate is 生成 / 整理 / 构建 on adjacent controls, Duplicate is identical to Copy, and `loadInNewWorkspace` does not mean load in a new workspace. Fix those highs (and the 你 / 您 mix) before calling zh copy done.
