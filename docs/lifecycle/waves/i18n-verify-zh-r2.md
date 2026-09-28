# Independent verify: L-zh r2

Locale: `zh` (`src/i18n/locales/zh/*.json`)  
English meaning SSOT: `src/i18n/locales/en/*.json`  
Verifier did not write `zh` and did not apply the r1 fix. Static copy read only. Tests not executed.

Re-check of r1 highs plus P0 onboarding, nav, CTAs, errors, empty. Checks: meaning, Simplified only, grammar/formality, spoken UI, placeholders intact, no English stubs as the translation (Datly / GitHub / Python OK).

| Key | Severity | Problem | Suggested native wording |
|-----|----------|---------|--------------------------|
| `encoding.formulationFailed` | medium | Success is now 数据已整理完成. Fail still says 构建, a leftover third verb for formulate. | 数据整理失败。 |
| `upload.watchMode` / `upload.watchModeStatus` | medium | `db.watchMode` is 自动刷新. Upload still says 监听模式. | 自动刷新 / 自动刷新： |
| `dataThread.autoRefreshTooltip` | low | Interval text is 自动刷新, tail still says 停止监听. | 每 {{interval}} 自动刷新 - 点击修改间隔或停止自动刷新 |
| `dataLoading.loadAllTables` | low | 个表格 vs 张表 used for the same object on nearby load CTAs. | 加载全部 {{count}} 张表 |

## R1 highs (re-checked)

| Key | R1 | Now |
|-----|----|-----|
| `dataLoading.loadPlan.loadInNewWorkspace` | 载入新工作区 | 在新工作区中加载 |
| `encoding.formulate` / `messages.formulate` | 生成 | 整理 |
| `encoding.formulateAndOverride` / `messages.formulateAndOverride` | 生成并覆盖 | 整理并覆盖 |
| `app.duplicate` | 复制 | 创建副本 |
| `encoding.formulationSucceeded` | 数据构建成功 | {{fields}} 的数据已整理完成。 |
| `config.formulateTimeout` (+ hint, quoted timeout errors) | 生成超时 | 整理超时（秒） / 整理过程 / 「整理超时」 |
| `errors.internalError` | 服务器内部错误 | 发生了意外错误 |
| `errors.llmAuthFailed` | API 密钥无效 | 身份验证失败，请检查 API 密钥 |
| `model.active` | 活跃 | 使用中 |
| `model.azureCliAccess` | 获准使用 | 你可以使用账户 {{user}} 有权访问的 Azure 模型。 |
| `dataLoading.capabilityHint` | 聚焦 | 点击下方输入框可查看示例提示 |
| `sidebar.andMore` | +{{count}} 更多 | 还有 {{count}} 项 |
| `chart.chartBuilder` | 图表配置 | 图表构建 |
| `common.dataLoading.loadingThread` | 加载链路 | 加载中 - {{index}} |
| `knowledge.threadHeader` / `sessionStatsLine` | 线索 | 线程 |
| `db.watchMode` / `dataThread.watchForUpdates` | 监听 | 自动刷新 / 自动检查更新 |
| `dataThread.tablesAvailableToAgent` | 助手 | 可供 Agent 使用 {{count}} 张表 |
| 您 mix | 您 on 10+ strings | no 您 in `zh/*.json` |
| `sidebar.tableCount` | 个表格 | {{count}} 张表 |
| `encoding.refreshIdeas` | 刷新想法 | 刷新灵感 |
| `loader.mssql.encrypt` / `trust_server_certificate` | yes/no | 是/否 |
| `report.styleExecutiveSummary` | 高管摘要 | 执行摘要 |

Placeholders `{{type}}`, `{{user}}`, `{{fields}}`, `{{count}}`, `{{interval}}`, `{{seconds}}` still present on the rewritten strings.

## P0 that still match

- First-run: `onboarding.languageTitle` 选择语言, `languageIntro` uses 你, `continue` 继续. Model wall `landing.firstSelectModelPrefix` 请先 plus `model.selectModels` 选择模型.
- Nav: 首页 / 数据 / 可视化 / 报告 / 对话 / 开始探索. GitHub and Agent kept as brands.
- CTAs: 保存 / 取消 / 关闭 / 删除 / 应用 / 确认 / 下一步 / 加载 / 连接 / 登录 / 整理 / 整理并覆盖 / 创建副本 / 在新工作区中加载 / 继续.
- Errors: 请先登录, 登录已过期，请重新登录, 文件解析失败, 发生了意外错误, 工作区存储空间已满，请释放磁盘空间后重试。 Placeholders intact.
- Empty: 这里还没有数据, chart empty subtitle, 日志文件为空。, 还没有保存的会话, 没有找到表, 暂无数据.
- Simplified only. No English stub as the zh string on P0 chrome.

## Outcome

**Pass.** R1 highs are gone. Formulate, Duplicate, and load-in-new-workspace now match the English job. Formality is 你. P0 onboarding, nav, CTAs, errors, and empty states are native Simplified Chinese with placeholders intact. Remaining rows are leftover nits (formulation fail still says 构建, upload watch still 监听). Not highs. Not a fail.
