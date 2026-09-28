# Project map inputs — §6 conventions + quality

Source: [explore] W2 01a01ad8-8e9a-79a1-951a-d5c5a183a604. Manager persist. Not Accept.

Brownfield tree at Datly. Owners are skill refs only; do not re-stack.

## 6. Conventions

| Check | Fit/gap | Path | Owner | notes |
|-------|---------|------|-------|-------|
| Root `.gitignore` ephemeral marker | Fit | `.gitignore` | gitignore-hygiene.md | Marker present. Pre-existing ignore of `scripts/`, `design-docs/`, `deploy-scripts/`. `*env` plus `.env.*` can hide `.env.template`. `package-lock.json` ignored; lockfile is `yarn.lock`. |
| Scripts: dev / build / test / typecheck | Gap | package.json, pyproject.toml, tsconfig.json, vitest.config.ts, pytest.ini, eslint.config.js, README.md, local_server.bat, .github/workflows | quality.md | Frontend: yarn start/build/test/lint. No typecheck script. Backend: uv + pytest. No ruff/mypy. CI builds; does not run full yarn test or backend suite. ESLint many TS/React rules off. |
| Stack matches repo | Fit | package.json, src/, py-src/, pyproject.toml | stack-baseline.md | React 18 + TypeScript + Vite + Yarn; Python 3.11+ Flask. Styling MUI 7 + Emotion + Sass, not Tailwind. Do not re-stack. |
| Topology | Fit | src/, py-src/, packaging/, tests/ | project-topology.md | Single FE + Python package. Desktop is pywebview + PyInstaller, not Electron. |
| Tokens / one visual system | Gap | tokens.ts, layout.ts, index.css, App.tsx, scss/, ChartTemplates, DataView, AgentChatInput | ui-craft.md | Dual UI: MUI theme, tokens.ts, CSS vars, leftover Sass with hardcoded hex. Agent chat is not one control. |
| Tests exist on P0 paths | Gap | tests/backend, tests/frontend/unit, docs/lifecycle | feature-test-cases.md | Automated tests exist. No docs/lifecycle/test-cases catalog. P0 UI (ChartTemplates, DataView, viz/report/agent composer) thin. CI does not execute suites. |
| Consumer installable | Gap | packaging/icons, desktop.py, About.tsx, ExampleSessions, project-state.json | app-polish.md · onboarding.md | Icons are product art. Desktop branded loading HTML. No first-run language-first overlay. About is marketing. targets.desktop.inScope false. |
| Locales | Partial | src/i18n, App.tsx | cross-cutting.md | i18next + t(), en+zh, toolbar switcher. LANGUAGE_LABELS lists ja/ko/fr/de with no files. |
| Ship capabilities detected | Gap | project-state.json | detect-capabilities · production-bar.md | Init defaults. writesFiles false while app downloads CSV/zip and reports. Auth live in code, not a capabilities row. |

## 7. Quality + risks

- Tests / CI: Vitest and pytest wired locally. GitHub Actions build artifacts; not full test or typecheck gates.
- Security: .env.template placeholders. sk- strings are test fixtures.
- Craft debt: dual visual stacks; agent chat density not one control.
