# W-agents - product LLM agents + bus F-ids (DISPATCH-FALLBACK)

- **Status:** COMPLETE (Manager fallback)
- **Date:** 2026-08-20

## A. Product LLM agents

Keys from `agent_config.py` `AGENT_REASONING_EFFORT` plus extra files.

| Agent id | File / route | User-visible job | Data it touches | Platform gap |
|----------|--------------|------------------|-----------------|--------------|
| analyst | `analyst/agent.py` `/api/agent/analyst-streaming` | Unified analyst: inspect, visualize, ask_user; load skills | Workspace parquet via Python/DuckDB | No warehouse pushdown; scripts forbidden from network/`os` |
| (skill) core | `analyst/skills/core` | execute_python_script, inspect_source_data, visualize, ask_user | Loaded tables only | "Analyse data already in the workspace" |
| (skill) data-loading | `analyst/skills/data-loading` | list/find/describe/probe; propose_connection; propose_data_operation | Connector catalog; read-only probes | Must not emit source SQL; bounded probes |
| (skill) report | `analyst/skills/report` | write_report with chart:// embeds | Thread + charts | Document share, not data share |
| data_loading_chat | `agent_data_loading_chat.py` `/data-loading-chat` | Standalone loading chat | Connectors | Parallel to analyst skill |
| data_load | `agent_data_load.py` `/process-data-on-load` | Type inference on load | Incoming table | Not scale |
| data_transform / data_rec | agent_config only (legacy loop) | Chart/transform recommendation | Workspace | Largely replaced by AnalystAgent |
| interactive_explore | agent_config | Exploration ideas | Workspace | Sidecar ideas, not compute |
| workflow_distill | `agent_workflow_distill.py` | Chat trail -> replayable workflow MD | Session events | Replay still on loaded tables unless F-workflow-db lands |
| chart_restyle | `agent_chart_restyle.py` `/chart-restyle` | Restyle Vega-Lite | Chart spec | UX |
| chart_insight | agent_config | Title + takeaways | Chart | UX |
| code_explanation | `agent_code_explanation.py` `/code-expl` | Describe derived fields | Transform code | Audit trail |
| sort_data | `agent_sort_data.py` `/sort-data` | Natural sort | Small lists | Helper |
| simple | `agent_simple.py` `/nl-to-filter` `/workspace-name` `/classify-chart-intent` | NL filter spec, names, intent | Schema only | Filter becomes load query, still import |
| starter_questions | `agent_starter_questions.py` `/derive-starter-questions` | Starter prompts | Schema | Onboarding |
| language | `agent_language.py` | Inject UI locale into prompts | None | House law, not data plane |
| diagnostics | `agent_diagnostics.py` | Agent health | None | Ops |

Analyst SKILL.md is explicit: **you analyse data already in the workspace**. Missing warehouse tables require the data-loading skill, then user-confirmed materialize. Probes are read-only. "Do not generate source-specific SQL."

## B. Software Bus vs current F-ids (before this report)

| F-id | Job | Bus tags | TRACKING status | Layer |
|------|-----|----------|-----------------|-------|
| F-auth | Signup login logout | [be] store+session landed; screens paused | not_started rollup; Phase A partial | SaaS wrapping |
| F-billing | Portal billing/usage | [explore][ui] DONE; C-bill-scaffold CHILD-KILL | not_started | SaaS wrapping |
| F-workspace | History + live share | planned in F-saas-W | not_started | SaaS collab |
| F-data-acl | Read vs write | planned | not_started | Governance (needed) |
| F-sql | SQL drawer | SHAPE drawer | not_started | Analysis power-user |
| F-sql-guard | Block destructive SQL | planned | not_started | Safety |
| F-context-graph | Cheap long threads | P1 | not_started | Agent efficiency |
| F-workflow-db | Replay workflow on DB | W ACCEPTED; C-wf-sheet CHILD-KILL | not_started | Data-plane adjacent |
| F-header-chrome, F-loader-anim, F-model-card, F-cicada-ui | Chrome | leftover BUILD | frontend_only / not_started | Not platform |
| F-data-ide, F-clean-grid, … | IDE chrome | prior Kind R | mixed | Tool-feel, not lakehouse |

**Finding:** bus agents were implementing **accounts, portal, and chrome**. They were not implementing a lakehouse. That matches a professional hosted app. It does not match "easy work with big data like Databricks" as the storage/compute plane.

## C. Holes (no product agent, no F-id)

- Elastic compute / SQL warehouse we host
- Unity Catalog we own (we only *browse* theirs)
- Scheduled Lakeflow-style jobs
- Delta Sharing / live table share
- Query cost metering
- Streaming ingest
- SCIM / org directory
- Query-in-place / federation (partial probe exists, analysis still copies)
