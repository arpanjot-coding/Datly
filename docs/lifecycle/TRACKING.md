# Tracking - Datly

## Intent (this message)
- Mode: feature implement (scrape → pipeline → warehouse). Lane: BUILD.
- User: integrate data scrapers; bring data in; clean; insights; structure via a strong accurate pipeline; warehouse scraped data for later use.
- Session: web, desktop. Wave id: scrape-w1.
- Path: docs/lifecycle/feature-ask-scraper.md
- CHILD-KILL orphan: W-ui-leak-map (a88511aa), W-ui-theme-surf (196c156e). UI campaign DEFERRED. Did not kill Electron.
- No [impl] this beat. Wave A consult only.

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Ingest scraper output as loadable tables | F-scraper | maybe | DataLoadMenu, connectors |
| 2 | Structure via transform pipeline | F-pipeline | maybe | clean steps, grid |
| 3 | Warehouse structured results | F-warehouse | no if workspace tables | workspace, analyst |

### Dispatch
Mode: feature implement | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status | Why (if not DONE) |
|----|--------|-----|------|-------|---------|------|--------|-------------------|
| W-scrape-nb | Neighborhood: connectors, load, clean, workspace tables | [explore] | codebase-report feature-ask | - | - | 1 | DONE | |
| W-scrape-res | Category: scrape to warehouse in analyst tools | [research] | product-research feature-ask | - | - | 1 | BLOCKED | CHILD-KILL user: stalled, no files |
| W-scrape-be | F-scraper ingest approach | [be-expert] | feature-ask | - | - | 1 | DONE | |
| W-scrape-ui | Place scrape / pipeline in existing load UI | [ui-expert] | feature-ask | - | - | 1 | DONE | |
| W-pipe-be | F-pipeline approach | [be-expert] | feature-ask | - | Wave A | 2 | DONE | |
| W-wh-be | F-warehouse approach | [be-expert] | feature-ask | - | Wave A | 2 | DONE | |
| W-scrape-plan | Unified W for F-scraper F-pipeline F-warehouse | [plan] | plan-lifecycle | - | Wave A+2 | 3 | DONE | |
| C-scrape-ssrf-fetch | Shared user-URL client is web_utils only | [impl] | F-scraper-W | - | - | 4 | DONE | |
| C-scrape-ssrf-fetch-v | Verify SSRF vs plan | [critic] | F-scraper-W | - | C-scrape-ssrf-fetch | 4b | DONE | |
| C-scrape-loader | WebDataLoader on connectors | [impl] | F-scraper-W | - | C-scrape-ssrf-fetch | 5 | DONE | |
| C-scrape-loader-v | Verify loader vs plan | [critic] | F-scraper-W | - | C-scrape-loader | 5b | DONE | |
| C-wh-ingest-contract | Ingest vs gzip provenance | [impl] | F-scraper-W | - | - | 6 | DONE | |
| C-wh-ingest-contract-v | Verify ingest vs gzip contract | [critic] | F-scraper-W | - | C-wh-ingest-contract | 6b | DONE | |
| C-pipe-hydrate | Explore CLEAN hydrate | [impl] | F-scraper-W | - | - | 7 | DONE | |
| C-pipe-hydrate-v | Verify CLEAN hydrate vs plan | [critic] | F-scraper-W | - | C-pipe-hydrate | 7b | DONE | |
| C-scrape-html-tables | HTML table catalog | [impl] | F-scraper-W | - | C-scrape-loader | 8 | DONE | |
| C-scrape-html-tables-v | Verify HTML catalog vs plan | [critic] | F-scraper-W | - | C-scrape-html-tables | 8b | DONE | |
| C-scrape-ui-type | Add-connection web maps + i18n | [impl] | F-scraper-W | - | C-scrape-loader | 9 | DONE | |
| C-scrape-ui-type-v | Verify web UI maps vs plan | [critic] | F-scraper-W | - | C-scrape-ui-type | 9b | DONE | |
| C-scrape-url-tab | URL tab binds to web connector | [impl] | F-scraper-W | - | C-scrape-ui-type | 10 | DONE | |
| C-scrape-url-tab-v | Verify URL tab web bind vs plan | [critic] | F-scraper-W | - | C-scrape-url-tab | 10b | DONE | |
| C-scrape-agent-bind | Agent Load reuses web connector | [impl] | F-scraper-W | - | C-scrape-url-tab | 11 | DONE | |
| C-scrape-agent-bind-v | Verify agent web bind vs plan | [critic] | F-scraper-W | - | C-scrape-agent-bind | 11b | DONE | |
| C-wh-source-info | Web ingest safe url in yaml | [impl] | F-scraper-W | - | C-wh-ingest-contract | 12 | DONE | |
| C-wh-source-info-v | Verify source-info vs plan | [critic] | F-scraper-W | - | C-wh-source-info | 12b | DONE | |
| C-scrape-refresh | Connector refresh keeps source_info | [impl] | F-scraper-W | - | C-wh-source-info | 13 | DONE | |
| C-scrape-refresh-v | Verify connector refresh vs plan | [critic] | F-scraper-W | - | C-scrape-refresh | 13b | DONE | |
| C-wh-session-reopen | Session save/load keeps connectorId | [impl] | F-scraper-W | - | C-wh-source-info | 14 | DONE | |
| C-wh-session-reopen-v | Verify session reopen vs plan | [critic] | F-scraper-W | - | C-wh-session-reopen | 14b | DONE | |
| C-wh-refresh-provenance | Refresh after reopen, no fake canRefresh | [impl] | F-scraper-W | - | C-wh-session-reopen | 15 | DONE | |
| C-wh-refresh-provenance-v | Verify refresh provenance vs plan | [critic] | F-scraper-W | - | C-wh-refresh-provenance | 15b | DONE | |
| C-wh-gzip-bind | Gzip leftover is not scrape warehouse | [impl] | F-scraper-W | - | C-scrape-agent-bind | 16 | IN PROGRESS | Writer live, wave 16 |

## Prior: UI leakage campaign (DEFERRED)
- Mode: UI test + screen-flow (REPORT). Leftover BUILD (logo / loader / button theme) waits for report IDs.
- User: full detailed UI test (leakage). Redesign logo and loading animation (they match each other, not the theme). Improve button color scheme.
- Lane: REPORT. Wave 1 is [plan] campaign-W only. No [impl] this beat.
- Session focus: desktop. Ship: web, desktop (same renderer). Wave id: ui-leak-w1.
- Related features: F-header-chrome, F-loader-anim, F-cicada-ui. Prior F-workspace-W DRAFT paused (not this message).
- CHILD-KILL: no leftover AD children in this parent. Did not kill Electron (product).

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Full detailed UI leakage walk (overlap, clip, crop, theme miss) | F-header-chrome F-loader-anim F-cicada-ui | no | logo, loader, buttons, chrome |
| 2 | Redesign logo + loader + button colors (BUILD after IDs) | F-header-chrome F-loader-anim | no | brand, loading.html, tokens |

### Dispatch
Mode: UI test | S: desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status | Why (if not DONE) |
|----|--------|-----|------|-------|---------|------|--------|-------------------|
| W-ui-leak-plan | Campaign package for UI leakage + theme surfaces | [plan] | plan-lifecycle testers ui-tester screen-flow | - | - | 1 | DONE | |
| W-ui-leak-map | Control inventory + flow-map + house-laws | [explore] | codebase-report ui-tester house-laws | - | W-ui-leak-plan | 2 | IN PROGRESS | Writer live, wave 2 |
| W-ui-theme-surf | Logo / splash / button token inventory (no redesign) | [explore] | app-polish ui-craft usability | - | W-ui-leak-plan | 2 | IN PROGRESS | Writer live, wave 2 |
| W-ui-leak-vis | Dual-viewport shots: leakage, logo, loader, buttons | [ui-vis] | visual-test ui-tester desktop-react-ui | - | W-ui-leak-map | 3 | PENDING | Depends on W-ui-leak-map |
| W-ui-leak-wf | Tap every in-scope control; theme + crop | [wf] | workflow-test ui-tester | - | W-ui-leak-map | 3 | PENDING | Depends on W-ui-leak-map |
| W-ui-theme | Redesign logo, loader, button tokens | [impl] | app-polish ui-craft design-ui | - | report IDs | later | PENDING | REPORT stop; waiting for user IDs |

## Prior: free SaaS history (paused)
- Mode: feature implement (free SaaS workflow)
- User: keep changes from breaking the app; keep it simple; history section; new project then new chat; check B2B; SaaS login; no payment; no hire team; free and really good.
- Lane: BUILD. Wave A harvested. Unified W READY. Plan gate. No [impl] until approve.
- SHAPE D-free-saas: login required. Free. No Stripe. No hire-team/seats. No live share. History is a section. New project opens a fresh chat. Distill/Play stay. Language first. No KNIME. No SQL as home.
- Session: web, desktop. Wave id: free-saas-w1. Kept Vite :5173 and Flask :5567 (Ready).

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | History section + new project + new chat, keep simple | F-workspace | landing + sessions | DataFormulator, WorkspaceMenu, DataSourceSidebar |
| 2 | Confirm recent auth/workflow changes did not break the product | F-auth F-workflow-db | no | login, Knowledge, replay |
| 3 | B2B check: free SaaS, no pay, no hire team | F-billing | no this ship | none |

### Dispatch
Mode: feature implement | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-hist-nb | Neighborhood: landing history, sessions, new workspace | [explore] | codebase-report | - | - | 1 | DONE |
| W-hist-ui | History section + new project then new chat | [ui-expert] | feature-ask | - | - | 1 | DONE (SHAPE) |
| W-b2b-shape | B2B vs free: no Stripe, no hire team | [arch-expert] | feature-ask | - | - | 1 | DONE (SHAPE D-free-saas) |
| W-reg-wf | Regression: login, load, distill, play still work | [wf] | workflow-test | - | - | 1 | DONE (DISPATCH-FALLBACK) |
| W-plan | Unified W for history + free SHAPE | [plan] | plan-lifecycle | Wave 1 | 2 | DONE (plan-check PASS; READY; not ACCEPTED) |
| C-hist-landing | Landing History above Demos + New project CTA | [impl] | F-workspace-W | - | - | 3 | PENDING (plan gate) |
| C-hist-new-project | New project uses resetForNewWorkspace | [impl] | F-workspace-W | C-hist-landing | 3 | PENDING (plan gate) |
| C-hist-resume | History open still loadWorkspace | [impl] | F-workspace-W | C-hist-landing | 3 | PENDING (plan gate) |
| C-hist-in-session | Header/sidebar New project, Exit stays resetState | [impl] | F-workspace-W | C-hist-new-project | 3 | PENDING (plan gate) |

- Lifetime 01a01e7de0b1 tick: free-saas-w1. Snapshot timeout_ms 0. Wave A hosts 01a01e7c-f39c/f39d/f39e/f39e not_found. CHILD-KILL already_gone. Harvested W-hist-nb (named free-saas-neighborhood), W-hist-ui (SHAPE), W-b2b-shape (D-free-saas). W-reg-wf sidecar/named missing; DISPATCH-FALLBACK Manager wrote wf-regression-free-saas.md (Flask/Vite live; no new Distill/Play P0; History leftover + New-session-exit are this ship). Unified W F-workspace-W.md DISPATCH-FALLBACK. plan-check PASS. Status READY. Did not ACCEPTED. Did not spawn [impl]. Did not spawn a second original Wave A set. Did not spawn Stripe/hire-team/Spark. Flask 01a01e79-e875-7eb0-ae6f-a6ab39f0695a :5567 Ready. Vite 01a01e76-37c6-7cc3-b21b-931cb36819c5 :5173 Ready. Scheduler kept. Not tick 8. Card IN PROGRESS (plan gate). No KNIME. No SQL as home.

### Prior S9 (paused this message)
Mode: feature S9 (BUILD) | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| C-s9-wf | Journeys | [wf] | workflow-test | - | - | 1 | STALL |
| C-s9-ui | Dual-viewport | [ui-vis] | visual-test | - | - | 1 | STALL |
| C-s9-connect | Auth distill replay SQL | [connect] | connectivity-audit | - | - | 1 | DONE |
| C-s9-arch | FIT local MVP | [arch-fit] | architecture-fit | - | - | 1 | DONE WEAK |
| C-s9-wf-r2 | Fallback journeys | [wf] | workflow-test | - | - | 1b | DONE Manager |
| C-s9-ui-r2 | Fallback shots | [ui-vis] | visual-test | - | - | 1b | INVALID loader |
| C-s9-ui-r3 | Recapture | [ui-vis] | visual-test | - | - | 1c | CHILD-KILL orphan (new user message) |
| C-s9-fix-p1 | Replay P1s | [impl] | findings | - | - | 1c | CHILD-KILL orphan (new user message) |
- Lifetime 01a01e722c39 tick 1/8: S9-w1. Snapshot timeout_ms 0. Original testers 01a01e70-c4da-* not_found. elapsedSec 201. CHILD-KILL already_gone. Harvested C-s9-connect (pass, 0 P0), C-s9-arch (WEAK, AF-01 P1), C-s9-wf-r2 (named; F-boot env P0 then Flask up). C-s9-ui-r3 capture 14/14 shots (sidecar still missing). C-s9-fix-p1 no product mtime yet. Did not spawn a second original tester set. Did not spawn Stripe/share/Spark. Did not spawn Wave 2 security. Did not spawn a second [impl]. Flask 01a01e79-e875-7eb0-ae6f-a6ab39f0695a :5567. Vite 01a01e76-37c6-7cc3-b21b-931cb36819c5 :5173. Scheduler kept. Not tick 8. Card IN PROGRESS. No KNIME. No SQL as home.

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Walk login, distill, play, SQL, no-share in detail and fix P0 | F-workflow-db F-auth | no | App, Knowledge, replay, SQL drawer |

### Dispatch
Mode: feature S9 (BUILD) | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| C-s9-wf | Journeys: language, login, signup, distill, play, SQL, no-share | [wf] | workflow-test | - | - | 1 | DONE (via r2 named) |
| C-s9-ui | Dual-viewport shots of those screens + overlays | [ui-vis] | visual-test | - | - | 1 | STALL (r1; see r3) |
| C-s9-connect | Auth, distill, replay, SQL, Share dead | [connect] | connectivity-audit | - | - | 1 | DONE (0 P0, P1 F1-F3) |
| C-s9-arch | FIT vs D-local-free-login | [arch-fit] | architecture-fit | - | - | 1 | DONE (WEAK, AF-01 P1) |
| C-s9-wf-r2 | DISPATCH-FALLBACK journeys | [wf] | workflow-test | - | - | 1b | DONE (Manager report; P0 Flask sqlglot) |
| C-s9-ui-r2 | DISPATCH-FALLBACK dual-viewport | [ui-vis] | visual-test | - | - | 1b | INVALID (loader PNG; API down) |
| C-s9-ui-r3 | Recapture login/signup after Flask up | [ui-vis] | visual-test | - | - | 1c | IN PROGRESS |
| C-s9-fix-p1 | Replay readOnly + busy sheet + signup copy | [impl] | findings F1 F2 F7 | - | - | 1c | IN PROGRESS |
| C-s9-sec | Auth/session/CSRF sample | [security] | security-audit | C-s9-connect | 2 | PENDING |
| C-s9-fix | Auto-fix P0 from harvest | [impl] | findings.md | Wave 1 | 3 | PENDING |

### Prior local MVP (Accepted)
Mode: feature implement | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| C-wf-local-replay | Tables replay: focus first table if none focused | [impl] | F-workflow-db-W | - | - | 1 | DONE |
| C-wf-local-replay-v | Verify A1-A4 pass | [critic] | F-workflow-db-W | - | C-wf-local-replay | 1b | DONE |
| C-wf-distill-cta | Honest distill CTA: chat first then save | [impl] | F-workflow-db-W | - | - | 1 | DONE |
| C-wf-distill-cta-v | Verify A1-A7 pass | [critic] | F-workflow-db-W | - | C-wf-distill-cta | 1b | DONE |
| C-local-mvp | Login required; hide Share | [impl] | F-saas-W SHAPE | - | - | 1 | DONE |
| C-local-mvp-v | Verify login required; Share hidden | [critic] | F-saas-W SHAPE | - | C-local-mvp | 1b | DONE |

- Lifetime 01a01e503f2a tick 1/8: Local MVP VERIFY harvest. Snapshot timeout_ms 0. Critic hosts 01a01e4f-7d8c / 01a01e50-1032 / 01a01e50-1032-bc2f not_found. CHILD-KILL already_gone. Harvested sidecars C-wf-distill-cta-verify C-wf-local-replay-verify C-local-mvp-verify (outcome pass). Named wf-verify-distill-cta A1-A7, wf-verify-local-replay A1-A4, wf-verify-local-mvp A1-A7 X1. Manager ACCEPT named all three. Did not re-implement writers. Did not spawn Stripe/share/Spark/S9. Did not spawn a second critic set. Scheduler 01a01e503f2a deleted. Not tick 8. Card stop. No KNIME. No SQL as home.
- Lifetime 01a01e4c1728 tick 1/8: Local MVP harvest. Snapshot timeout_ms 0. Writer hosts 01a01e4b-* not_found. CHILD-KILL already_gone. Harvested writers C-wf-local-replay C-wf-distill-cta C-local-mvp (named SimpleChartRecBox seedTableId, KnowledgePanel distillNeedChat, App.tsx loginRequired no IS_LOCAL_MODE skip, Share hidden). Harvested critics C-wf-local-replay-v A1-A4 pass, C-wf-distill-cta-v A1-A7 pass, C-local-mvp-v A1-A7 X1 pass. Manager ACCEPT named all three. Scheduler list empty (none pending). Did not spawn S9. Did not spawn a second writer or critic set. Did not re-implement SaaS Wave 1-3. Not tick 8. Card stop. No Spark. No KNIME. No SQL as home. No Stripe.

## Prior: SaaS chrome
- Mode: feature implement (resume F-saas UI)
- User (verbatim): The UI is not reflecting all the changes I have asked to do to make professional data SAAS solutiuon
- Lane: BUILD. D-saas-full already locked. Kind R IDs not named; this beat is the **visible product chrome** they already approved (login, account, workspace history).
- SHAPE: analysis canvas stays Datly. SQL stays a drawer (not this wave). Portal is not a second chart app. No Spark/clusters. Language still first. Share live and SQL drawer stay later phases.
- Session: web, desktop
- Next from state: C-auth-screens (backend store/session/migrate already on disk; AuthButton still returns null without OIDC)

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Email/password login signup logout visible in product | F-auth | yes /login /signup | AuthButton, App.tsx |
| 2 | Workspace history list that looks like SaaS (local, no live share) | F-workspace | no | WorkspaceMenu |

### Dispatch
Mode: feature implement | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| C-auth-screens | Login/signup + AuthButton | [impl] | F-saas-W | app-onboarding | C-auth-session | 1 | DONE |
| C-auth-screens-v | Verify login/signup vs F-saas-W | [critic] | F-saas-W | - | C-auth-screens | 1c | DONE |
| C-ws-sessions | Workspace history list SHAPE | [impl] | F-saas-W | - | - | 1 | DONE |
| C-ws-sessions-v | Verify header A1-A7 pass; B1 sidebar deferred | [critic] | F-saas-W | - | C-ws-sessions | 1b | DONE |
| C-ws-sidebar | Sessions tab same honest states | [impl] | F-saas-W Place | - | C-ws-sessions | 2 | DONE |
| C-sql-guard | SELECT-only SQL API + parser | [impl] | F-saas-W Phase E | - | - | 1 | DONE |
| C-bill-shell | Portal role nav | [impl] | F-billing-W | - | C-bill-scaffold | 1 | DONE |
| C-auth-gate | Language then hosted login | [impl] | F-saas-W | app-onboarding | C-auth-screens | 2 | DONE |
| C-sql-drawer | SQL drawer UI not home | [impl] | F-saas-W | - | C-sql-guard | 2 | DONE |
| C-bill-usage | Usage + plan pages | [impl] | F-billing-W | - | C-bill-shell | 2 | DONE |
| C-auth-gate-v | Verify hosted language-then-login | [critic] | F-saas-W | - | C-auth-gate | 2b | IN PROGRESS |
| C-sql-drawer-v | Verify SQL drawer not home | [critic] | F-saas-W | - | C-sql-drawer | 2b | IN PROGRESS |
| C-ws-sidebar-v | Verify Sessions tab honest states | [critic] | F-saas-W | - | C-ws-sidebar | 2b | IN PROGRESS |
| C-bill-usage-v | Verify usage/plan meters + CTA | [critic] | F-billing-W | - | C-bill-usage | 2b | IN PROGRESS |
| C-sql-guard-v | Verify named A1-A7 pass; timeout later | [critic] | F-saas-W | - | C-sql-guard | 1b | DONE |
| C-bill-shell-v | Critic stale; named export + setPortalSession now live | [critic] | F-billing-W | - | C-bill-shell | 1b | DONE |
| C-wf-replay-prompt | Connector replay prompt | [impl] | F-workflow-db-W | - | sheet exists | 3 | IN PROGRESS |
| C-share-acl | Share sheet + read-only honesty | [impl] | F-saas-W | - | C-auth-screens | 3 | IN PROGRESS |
| C-bill-admin | Seats + org billing | [impl] | F-billing-W | - | C-bill-shell | 3 | IN PROGRESS |
| C-wf-sql-readonly | SELECT-only probe/fetch; refuse source writes | [impl] | F-workflow-db-W | - | - | 3 | IN PROGRESS |
| C-context-graph | Long context graph | [impl] | F-saas-W | - | SQL | 4 | PENDING |

- User 2026-08-20: implement the plan and all remaining features, use as many agents. Operating cap 4. Wave leftovers. No Spark. No KNIME. No SQL-as-home. No second chart app on portal.
- Lifetime 01a01e343270 tick 1/8: Wave 3 only. Snapshot timeout_ms 0. Hosts 01a01e33-fed6/fed7 not_found. Sidecars missing at poll. Named not NEW (admin stubs 07:23, ShareSheet missing, loaders 08-19). elapsedSec 208. CHILD-KILL already_gone. DISPATCH-FALLBACK spawn 01a01e3a-* not_found. Manager wrote C-bill-admin Users.tsx+Billing.tsx, C-share-acl ShareSheet.tsx, C-wf-replay-prompt KnowledgePanel+locales, C-wf-sql-readonly probe_utils+SQL loaders. Sidecars harvested. Did not spawn critics. Did not spawn Wave 1/2. Did not re-implement Wave 1/2 writers. Scheduler remains. Not tick 8. Card IN PROGRESS. No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e349fee tick 1/8 Wave 2 VERIFY: Snapshot timeout_ms 0. Original critics 01a01e34-9ffa-* not_found. Named saas-verify-auth-gate/sql-drawer/ws-sidebar/bill-usage missing. Sidecars C-*-verify.md missing. elapsedSec ~201 (>=120 stall). CHILD-KILL already_gone. DISPATCH-FALLBACK that critic only: C-auth-gate-verify 01a01e38-f002-74f3-8613-b1a6c79b7eb6, C-sql-drawer-verify 01a01e38-f003-7672-b4b6-06e21abd1f16, C-ws-sidebar-verify 01a01e38-f003-7672-b4b6-06ff1ae86cf4, C-bill-usage-verify 01a01e38-f004-7372-9458-cd131b25430d. Did not spawn a fifth. Did not spawn a second original set. Did not re-implement writers. Did not spawn Wave 3 (cap binds; Wave 3 already CHILD-KILL). Scheduler 01a01e349fee kept. Not tick 8, no force-kill. Card IN PROGRESS (verify). No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e2e11d0 tick 1/8: child-lifetime parentAction continue then allHarvested. Snapshot timeout_ms 0. Hosts 01a01e2d-* not_found. CHILD-KILL already_gone. Harvested C-auth-gate C-sql-drawer C-ws-sidebar (named + Manager sidecars). C-bill-usage named Usage.tsx meters + sidecar landed mid-tick (concurrent fallback). Did not spawn a fifth writer. Writer scheduler 01a01e2e11d0 already_gone. Spawned DIFFERENT critics C-auth-gate-verify 01a01e34-9ffa-7030-9d4d-b217d1375a0a, C-sql-drawer-verify 01a01e34-9ffa-7030-9d4d-b22ccd1c6d35, C-ws-sidebar-verify 01a01e34-9ffa-7030-9d4d-b234e9a57a68, C-bill-usage-verify 01a01e34-9ffa-7030-9d4d-b24072780257. Armed verify harvest 01a01e349fee. Did not spawn Wave 3. Did not re-implement Wave 1. Not tick 8, no force-kill. Card IN PROGRESS (verify). No Spark. No KNIME. No SQL-as-home. No second chart app.
- SHAPE: C-ws-sessions is history only (no live share this wave).
- Session lock D-nest-depth-3 (user 2026-08-20): nested subagents allowed to depth 3 (Manager -> child -> grandchild). Skill table still says depth 1; do not edit the skill this beat. Wave 2+ briefs may tell a Wave-1 child to spawn nested helpers. Still count live mixed toward the operating cap. Do not nest writers onto the same files.
- CHILD-KILL stall 214s no named files: C-auth-screens, C-sql-guard, C-bill-shell. DISPATCH-FALLBACK re-spawn. C-ws-sessions harvested in main tree (Datly has no git worktree). Verify spawned.
- Lifetime 01a01e2b4f16 tick 1/8: child-lifetime parentAction continue then stop. Snapshot timeout_ms 0. All three Wave 1 verify sidecars harvested. Manager ACCEPT named: auth-screens A1 A2 A4 A6 A7 X1 (residual A3/A5), sql-guard A1-A7 (defer timeout/P06), bill-shell vs live named export+session. Hosts 01a01e29-c408-* not_found. Duplicate critics 01a01e2e-* not_found. CHILD-KILL already_gone. Wave 2 sidecars already on disk (01a01e2e11d0). Remainder spawn C-bill-usage/C-ws-sidebar 01a01e32-* already_gone, no clobber (files mtime 09:03:50). SHAPE lock-fix Usage CTA See plan not Datly home. Did not re-implement Wave 1. Did not spawn a second Wave 2 set. Did not spawn Wave 3 (already IN PROGRESS). Did not spawn a second critic set. Scheduler 01a01e2b4f16 already_gone. Did not re-arm (Wave 3 concurrent). Not tick 8, no force-kill. Card IN PROGRESS. No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e28a832 tick 3/8: child-lifetime writers parentAction continue, allHarvested true. Sidecars C-auth-screens C-sql-guard C-bill-shell done. Named LoginScreen.tsx sql_guard.py PortalShell.tsx. Hosts 01a01e27-* not_found. CHILD-KILL harvest already_gone. Did not spawn a second writer. Did not spawn a second C-ws-sessions. Did not Accept C-ws-sessions (B1). Did not merge worktrees. Did not spawn Wave 2. Did not spawn C-auth-gate. Scheduler 01a01e28a832 already_gone. Spawned DIFFERENT critics 01a01e2e-* (45s poll not_found). Then verify check: C-sql-guard-verify harvest (named A1-A7 pass, G2 timeout residual), C-bill-shell-verify harvest (fail A1/A2/A4), C-auth-screens-verify pending. parentAction stop. Left 01a01e2db892 and concurrent Wave 2 01a01e2e11d0. Did not arm a third scheduler. Card IN PROGRESS. No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e23b1f6 tick 1/8: Snapshot timeout_ms 0. Hosts 01a01e22-* not_found. CHILD-KILL already_gone. C-ws-sessions-verify sidecar harvested (A1-A7 pass, B1 residual, Manager ACCEPT named). At poll named files missing (~210s stall); DISPATCH-FALLBACK r2 spawned 01a01e28-* then concurrent Manager already wrote named files + sidecars. Harvest C-auth-screens C-sql-guard C-bill-shell (sidecars + LoginScreen.tsx sql_guard.py PortalShell.tsx). Restored LoginScreen named export twin of SignupScreen after clobber (wrong lib/store imports). Residual: sql_guard regex not sqlglot. Did not spawn Wave 2 (HANDOFF critics in progress; scheduler 01a01e28a832 owns next beat). This scheduler 01a01e23b1f6 already gone. Did not nest. Card IN PROGRESS (verify wave). No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e2db892 tick 2/8: child-lifetime parentAction stop. Snapshot timeout_ms 0. C-sql-guard-verify and C-bill-shell-verify already harvested (pass / fail). C-auth-screens-verify sidecar + named still missing. Hosts 01a01e29-c408-* not_found. HANDOFF critics 01a01e2e-44d6-* not_found. CHILD-KILL already_gone. Did not spawn Wave 2 this tick. Did not spawn a second Wave 2 (01a01e2e11d0 already live; TRACKING Wave 2 IN PROGRESS). Did not re-implement Wave 1. Did not spawn a second critic set. Scheduler 01a01e2db892 kept. Not tick 8, no force-kill. Card IN PROGRESS. No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e2a0eec tick 1/8: child-lifetime parentAction stop. Snapshot timeout_ms 0 then re-list. Harvested C-sql-guard-verify (pass A1-A7; Manager ACCEPT named; defer timeout) and C-bill-shell-verify (fail; live named export + setPortalSession already on disk). C-auth-screens-verify sidecar still missing. Hosts 01a01e29-c408-* not_found. CHILD-KILL already_gone. Did not spawn Wave 2 this tick. Did not spawn a second Wave 2. Did not re-implement Wave 1. Did not spawn a second critic set. Scheduler 01a01e2a0eec already gone (duplicate). Re-armed 01a01e2db892. Not tick 8, no force-kill. Card IN PROGRESS. No Spark. No KNIME. No SQL-as-home. No second chart app.
- Lifetime 01a01e1ef973 tick 2/8: child-lifetime parentAction continue. Snapshot timeout_ms 0. elapsedSec 470. C-ws-sessions harvest (sidecar + host completed). CHILD-KILL already_gone. Critic sidecar C-ws-sessions-verify.md outcome fail (B1 Sessions sidebar). Did not Accept. Did not merge. C-auth-screens C-sql-guard C-bill-shell stall no named file. CHILD-KILL stall already_gone (01a01e1d-ee7d-7f53-a14b-feb640a8d1cf, 01a01e1d-ee7e-76c0-866f-0d82812fe794, 01a01e1d-ee7e-76c0-866f-0d95c2202206). DISPATCH-FALLBACK spawned C-auth-screens 01a01e27-b520-7df3-9ab3-ecf69dc5714b worktree, C-sql-guard 01a01e27-b520-7df3-9ab3-ed0869ff6aad worktree, C-bill-shell 01a01e27-b521-76c0-9f40-5aed8d231e85 cwd Datly-Web. Did not spawn a second C-ws-sessions. Did not spawn Wave 2. Did not spawn C-auth-gate. Scheduler 01a01e1ef973 already gone. Re-armed 60s lifetime for the three fallbacks. Card IN PROGRESS. No Spark. No KNIME. No SQL-as-home. No second chart app.

- Mid-feature resume. plan-check already PASS on F-saas-W. No new ASK.

## Prior: platform research (REPORT complete)
- Mode: research + analysis
- User (verbatim): can we analyse and see what agents are doing what features a SAAS solution might need we are not making a tool we are making a solution like making easy owrking with big data like databrick ect...
- Lane: REPORT (complete). Kind R: docs/lifecycle/reports/research-platform-saas-2026-08-20.md
- Session: web, desktop (from ship targets). Portal web only if billing stays in later include.
- Thesis correction: Datly is a hosted data platform for easy work on large data (Databricks-class solution), not a viz tool with SaaS login bolted on.
- CHILD-KILL orphan: C-bill-scaffold, C-wf-sheet, two AD lifetime ticks, scheduler 01a01e0bc752. Log CHILD-KILL orphan.
- Prior F-billing / F-workflow-db / F-saas paused this beat. Do not resume [impl].

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Analyse product+bus agents vs Databricks-class SaaS feature set | F-platform-r (Kind R) | n/a report | none this beat |

### Dispatch
Mode: research | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-us | Datly shipped inventory vs lakehouse platform | [explore] | codebase-report, project-map | - | - | 1 | DONE |
| W-agents | In-app LLM agents + bus F-id ownership | [explore] | agent_config, agents/, analyst/ | - | - | 1 | DONE |
| W-rivals | Databricks Snowflake Fabric Hex platform caps | [research] | product-research | - | - | 1 | DONE |
| W-demand | User demand easy big-data SaaS | [research] | product-research | - | - | 1 | DONE |
| W-report | Kind R compare + agent owners + include | [plan] | artifacts Kind R | W-us W-agents W-rivals W-demand | 2 | DONE |

- 2026-08-20 continue: Wave 1 hosts not_found (compaction). No named files. CHILD-KILL already_gone. DISPATCH-FALLBACK Manager wrote waves/saas-platform-*.md + reports/research-platform-saas-2026-08-20.md. No [impl]. No resume of F-billing/F-workflow-db.
- Analysis done. REPORT stop for IDs.

- Locks to keep visible: D-sql-drawer, D-portal-separate, no KNIME canvas, language first, no Stripe in Flask. Report may recommend changing a lock; do not change it this beat.
- Existing lite SaaS research is login/collab/portal only (`reports/research-saas-2026-08-20.md`). This wave is lakehouse/platform, not a repeat of auth.

## Prior: billing portal (paused)
- Mode: feature implement (Datly-Web billing/usage portal)
- User: we need D:\Coding\Main\Datly - Web as the website of the product so users can control billing, usage
- Lane: BUILD (paused for REPORT)
- Session: web
- Place: empty sibling repo Datly - Web. Not inside analysis canvas.
- SHAPE: marketing + account portal. Individual billing/usage vs enterprise seats. Same Datly tokens. No second chart app.

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Product website: billing, usage, enterprise admin | F-billing | yes (Datly-Web) | product account menu links out later |

### Dispatch
Mode: feature implement | S: web | Ship: web, desktop (portal web only)

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-bill-nb | Empty Datly-Web + product brand tokens | [explore] | codebase-report | - | - | 1 | DONE |
| W-bill-ui | Portal IA individual vs admin | [ui-expert] | web-react-ui, ui-craft | - | - | 1 | DONE |
| W-bill-plan | F-billing-W.md | [plan] | plan-lifecycle | - | - | 1 | DONE |
| C-bill-scaffold | Vite React MUI cicada tokens + router stubs | [impl] | F-billing-W | - | - | 2 | IN PROGRESS |
| C-bill-shell | Role nav individual vs admin | [impl] | F-billing-W | C-bill-scaffold | 3 | PENDING |
| C-bill-usage | Usage + plan pages | [impl] | F-billing-W | C-bill-shell | 4 | PENDING |
| C-bill-admin | Seats + org billing | [impl] | F-billing-W | C-bill-shell | 4 | PENDING |
| C-bill-stripe | Stripe checkout + webhooks on portal backend | [impl] | F-billing-W | C-bill-usage | 5 | PENDING |

- Lifetime 01a01e085b3a tick 1/8: harvest Wave A then plan-check. Snapshot timeout_ms 0. Sidecars W-bill-nb W-bill-ui done. Named neighborhood/ui-expert. Named F-billing-W.md DISPATCH-FALLBACK. W-bill-plan sidecar written at closeout. Hosts not_found. CHILD-KILL already_gone. parentAction continue. Scheduler 01a01e085b3a already gone. plan-check PASS. ACCEPTED. Concurrent already spawned C-bill-scaffold 01a01e0a-bd7a-7122-b121-a8f6c74a8c7a. Left harvest lifetime 01a01e0bc752. Did not spawn a second scaffold. Did not spawn C-bill-shell. Did not resume SaaS screens. Card IN PROGRESS. No Stripe in Flask. No KNIME canvas.

## Prior: workflow-db
- Mode: feature implement
- Intent (this message leftover paused)
- Mode: feature implement (chat workflows run on a database)
- User ask: make workflow from chat, run those flows on that database
- Lane: BUILD
- Session: web, desktop
- SHAPE draft: reuse distill + replay; add DB/connector target. No node canvas.
- SaaS Phase A paused (auth screens CHILD-KILL).
- Lifetime 01a01e038fca tick 2/8: harvest C-wf-replay-target. Snapshot timeout_ms 0. Host 01a01e05-ddac-7313-b37f-4dedd7f8d9c6 not_found this session. Sidecar C-wf-replay-target.md missing. KnowledgePanel RunWorkflowDialog mid-write (Play opens sheet; session dispatch without target; connector confirm close-only stub). SimpleChartRecBox still focusedTableId gate (mtime 19/08). child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not set-chunks. Did not spawn C-wf-replay-prompt. Did not spawn a second C-wf-replay-target. Did not spawn C-wf-sheet. Did not resume SaaS screens. Not tick 8, no force-kill. No KNIME canvas.
- Lifetime 01a01dfe5abe tick 2/8: harvest named W. Snapshot timeout_ms 0. Sidecar W-wf-plan.md done. Named F-workflow-db-W.md full. Host 01a01dfe-3cee-7e32-8542-f99b0641682d not_found. child-lifetime parentAction continue. THIS scheduler already gone. Manager plan-check PASS (complete, honest, fit). House-law fill from the W. Concurrent already spawned C-wf-replay-target 01a01e05-ddac-7313-b37f-4dedd7f8d9c6. Did not spawn a second [impl]. Did not spawn C-wf-sheet. Left 01a01e038fca alone. Did not resume SaaS screens. Card IN PROGRESS. No KNIME canvas.
- Lifetime 01a01e038fca tick 1/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-wf-sheet.md missing. Host 01a01e02-af3d-72d2-96dc-5952cd05f8d6 not_found this session. Other listed C-wf-sheet host 01a01e04-6725-77a3-b1bc-99b02c373f21 not_found. Did not harvest KnowledgePanel mtime. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not spawn C-wf-event. Did not spawn a second C-wf-sheet. Did not resume SaaS screens. Not tick 8, no force-kill. No KNIME canvas.
- Lifetime 01a01dfe5abe tick 1/8: sidecar-only. Snapshot timeout_ms 0. Sidecar W-wf-plan.md missing. Named F-workflow-db-W.md missing. Host 01a01dfe-3cee-7e32-8542-f99b0641682d not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not plan-check. Did not spawn first [impl]. Did not spawn a second W-wf-plan. Did not resume SaaS screens. Not tick 8, no force-kill. No KNIME canvas.

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Chat-captured workflow replay on a chosen database | F-workflow-db | run-target sheet | KnowledgePanel, SessionDistill, connectors |

### Dispatch
Mode: feature implement | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-wf-nb | Neighborhood: distill + replay + connectors | [explore] | codebase-report | - | - | 1 | DONE |
| W-wf-ui | UI specialist run-on-db | [ui-expert] | ui-craft | - | - | 1 | DONE |
| W-wf-be | BE specialist replay on connector | [be-expert] | architecture-fit | - | - | 1 | DONE |
| W-wf-plan | Work package | [plan] | plan-lifecycle | - | Wave A | 2 | DONE |
| C-wf-replay-target | Run-target sheet + event target + connector gate | [impl] | F-workflow-db-W | - | - | 3 | IN PROGRESS |
| C-wf-replay-prompt | Connector replay prompt + 21-locale keys | [impl] | F-workflow-db-W | C-wf-replay-target | 4 | PENDING |
| C-wf-load-then-replay | Load skill scoped to connector_id | [impl] | F-workflow-db-W | C-wf-replay-prompt | 5 | PENDING |
| C-wf-sql-readonly | SELECT-only probe/fetch; refuse source writes | [impl] | F-workflow-db-W | - | - | 5 | IN PROGRESS |
| C-wf-distill-source-stamp | Optional front matter source_connector_ids | [impl] | F-workflow-db-W | C-wf-replay-target | 6 | PENDING |

## Prior: SaaS
- Mode: feature implement (workspaces, accounts, SQL, context)
- User ask: workspace history, shareable collab, signup/login, individual vs enterprise billing portal, data read/write, SQL analysis, long-context graph, SQL sanity guard
- Lane: BUILD
- Session focus: web, desktop
- Ship: web, desktop
- Verdict: ASK cleared 2026-08-20. D-saas-full LOCKED. Professional SaaS: accounts, share, portal, SQL drawer+guard.

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Workspace history + share | F-workspace | yes | WorkspaceMenu, sessions |
| 2 | Signup login logout | F-auth | yes | AuthButton, OIDC |
| 3 | Billing + enterprise admin portal | F-billing | yes | new portal |
| 4 | Data read vs write | F-data-acl | no | connectors |
| 5 | SQL analysis | F-sql | drawer or yes | DataView |
| 6 | SQL guard | F-sql-guard | no | runner |
| 7 | Context graph | F-context-graph | no | agent |

### Dispatch
Mode: feature implement | S: web, desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-saas-nb | Neighborhood: workspace, auth, SQL, agent context | [explore] | codebase-report | - | - | 1 | BLOCKED |
| W-saas-ui | UI: history, share, login, portal | [ui-expert] | ui-craft, web-react-ui | - | - | 1 | DONE |
| W-saas-be | BE: auth, billing, ACL, SQL | [be-expert] | architecture-fit | - | - | 1 | DONE |
| W-saas-arch | Arch SHAPE: SaaS vs local, graph, SQL guard | [arch-expert] | architecture-fit | - | - | 1 | BLOCKED |
| W-saas-research | Lite research accounts + collab + billing | [research] | product-research | - | - | 2 | DONE |
| W-saas-plan | Unified Kind E + campaign W | [plan] | plan-lifecycle, house-laws | - | Wave A | 2 | DONE |
| W-saas-sec | Security: auth + pay | [security] | security-audit | - | - | 2 | DONE |
| C-auth-user-store | Argon2id user store + signup/login API | [impl] | F-saas-W | - | - | 3 | IN PROGRESS |
| C-auth-user-store-verify | Critic vs F-saas-W + P0-1 | [critic] | F-saas-W, saas-security | C-auth-user-store | 3b | DONE |
| C-auth-user-store-fix | P01-reset tokens | [impl] | saas-security P0-1 | C-auth-user-store-verify | 3c | IN PROGRESS |
| C-auth-session | Secure session and CSRF | [impl] | F-saas-W | C-auth-user-store | 4 | IN PROGRESS |
| C-auth-session-verify | Critic vs F-saas-W + P0-2/P0-3 | [critic] | F-saas-W, saas-security | C-auth-session | 4b | DONE |
| C-auth-session-fix | Rotate, sessions CSRF, idle, Origin | [impl] | saas-verify-auth-session | C-auth-session-verify | 4c | IN PROGRESS |
| C-auth-migrate | Bound browser migrate only | [impl] | F-saas-W | C-auth-session | 5 | IN PROGRESS |
| C-auth-screens | Twin login/signup + AuthButton | [impl] | F-saas-W | C-auth-session | 6 | IN PROGRESS |
| C-auth-gate | Language then auth (hosted) | [impl] | F-saas-W | C-auth-screens | 7 | PENDING |

- Lifetime 01a01e038fca tick 1/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-wf-sheet.md missing. Host 01a01e02-af3d-72d2-96dc-5952cd05f8d6 not_found this session. Other listed host 01a01e04-6725-77a3-b1bc-99b02c373f21 not_found. Did not harvest KnowledgePanel mtime. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler 01a01e038fca remains. Did not spawn critic. Did not spawn C-wf-event. Did not spawn a second C-wf-sheet. Left SaaS leftover alone. Not tick 8, no force-kill. No KNIME canvas.
- Lifetime 01a01dfc4dd7 tick 1/8: child-lifetime harvest Wave A then plan. Snapshot timeout_ms 0. Sidecars W-wf-nb W-wf-ui W-wf-be done. Named neighborhood/ui-expert/be-expert. Hosts not_found. CHILD-KILL already_gone. parentAction continue. Scheduler 01a01dfc4dd7 already gone. Named F-workflow-db-W.md DISPATCH-FALLBACK. plan-check PASS. ACCEPTED. Spawned DIFFERENT [impl] C-wf-sheet 01a01e04-6725-77a3-b1bc-99b02c373f21. Left 01a01dfe5abe. Did not spawn a second Wave A. Did not resume SaaS screens. Card IN PROGRESS. No Stripe. No share. No SQL.
- Lifetime 01a01df9d845 tick 3/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-screens.md missing. Host 01a01df9-00aa-7ca2-a83b-9d875a8b0978 not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler already gone (HANDOFF leftover CHILD-KILL; list empty). Did not spawn critic. Did not spawn C-auth-gate. Did not harvest src mtimes. Did not spawn a second C-auth-screens. Left C-auth-session-fix, C-auth-user-store-fix, and F-workflow-db Wave A alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01df9d845 tick 2/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-screens.md missing. Host 01a01df9-00aa-7ca2-a83b-9d875a8b0978 not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest src mtimes. Did not spawn a second C-auth-screens. Left C-auth-session-fix and C-auth-user-store-fix alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01df9d845 tick 1/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-screens.md missing. Host 01a01df9-00aa-7ca2-a83b-9d875a8b0978 not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest src mtimes. Did not spawn a second C-auth-screens. Left C-auth-session-fix and C-auth-user-store-fix alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01df4ae62 tick 2/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-migrate.md missing. Host 01a01df3-d7c5-77e0-a94f-bb3e3e3acd33 not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest py-src mtimes. Did not spawn a second C-auth-migrate. Left C-auth-session-fix and C-auth-user-store-fix alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01df4ae62 tick 1/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-migrate.md missing. Host 01a01df3-d7c5-77e0-a94f-bb3e3e3acd33 not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest py-src mtimes. Did not spawn a second C-auth-migrate. Left C-auth-session-fix and C-auth-user-store-fix alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01df092de tick 1/8: child-lifetime harvest critic. Snapshot timeout_ms 0. Sidecar C-auth-session-verify.md done (outcome fail). Named saas-verify-auth-session.md A1-A3 pass. Fail G3 rotate, G5 sessions CSRF, P02 idle, P03 Origin. Host 01a01def-a30e-7861-b24a-de851c62f72f not_found. CHILD-KILL already_gone. parentAction continue. THIS scheduler already gone. Did not Accept. Did not set-chunks C-auth-session done. Did not spawn C-auth-migrate. Live password_auth already imports csrf.py + rotate_session; remaining G5 / hosted-flag split. Spawned DIFFERENT [impl] C-auth-session-fix 01a01df5-e736-73a2-833a-91125ff669f8 worktree. One 45s poll host not_found. child-lifetime parentAction stop (pending, waiting for files). Left C-auth-user-store-fix alone. Left other live 01a01df4ae62 (C-auth-migrate lifetime) alone. Did not spawn a second migrate. Armed 01a01df75647. No Stripe. No share. No SQL.
- Lifetime 01a01de8a819 tick 3/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-session.md missing. Host 01a01de7-ba16-7e22-b3a4-4ac8f8c0e5ca not_found this session. Other live 01a01def-2738-7e01-9322-a4f1215efe41 left alone. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest py-src mtimes. Did not spawn a second C-auth-session. Left C-auth-user-store-fix and 01a01ded076f alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01de8a819 tick 2/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-session.md missing. Host 01a01de7-ba16-7e22-b3a4-4ac8f8c0e5ca not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest py-src mtimes. Did not spawn a second C-auth-session. Left C-auth-user-store-fix and 01a01ded076f alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01de8a819 tick 1/8: sidecar-only. Snapshot timeout_ms 0. Sidecar C-auth-session.md missing. Host 01a01de7-ba16-7e22-b3a4-4ac8f8c0e5ca not_found this session. child-lifetime parentAction stop (pending, waiting for files). Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest py-src mtimes. Did not spawn a second C-auth-session. Left C-auth-user-store-fix alone. Not tick 8, no force-kill. No Stripe. No share. No SQL.
- Lifetime 01a01de4f9bd tick 1/8: child-lifetime harvest critic. Sidecar C-auth-user-store-verify.md done. Named saas-verify-auth-store.md. A1-A4 pass. P01-reset fail. Host 01a01de4-1f6a-7831-bd18-924efc804b80 not_found. CHILD-KILL already_gone. parentAction continue. THIS scheduler already gone. Did not Accept. Did not spawn a second C-auth-session. Left 01a01de8a819 alone. Spawned DIFFERENT [impl] C-auth-user-store-fix 01a01dec-7da0-7f53-ae6d-60d98a23de22 worktree. One 45s poll host not_found. Fix sidecar pending. Armed 01a01ded076f. No Stripe. No share. No SQL.
- Lifetime 01a01ddd296d tick 1/8: sidecar-only. Sidecar C-auth-user-store.md missing. Host 01a01ddb-e35e-7870-89e6-549a9b023a37 not_found this session; grok session cancelled shutdown at 06:33:52Z (todo 1 still reading). parentAction stop. Card IN PROGRESS. Scheduler remains. Did not spawn critic. Did not harvest py-src mtimes. Not tick 8, no force-kill. No Stripe. No share. No SQL.

## Prior: Models dialog layout
- Mode: feature implement (Models dialog layout)
- User ask (verbatim): can we please improve the model card layout + screenshot
- Lane: BUILD
- Session focus: desktop
- Ship: web + desktop
- Markup: docs/lifecycle/waves/model-card-markup.png
- Research: skipped. Existing dialog layout.
- Leftover: C-chrome-pills Accepted. C-loader-pulse Accepted. C-chrome-messages Accepted. C-chrome-overflow Accepted. Lite S9 PENDING. W-model-plan PENDING. checkpoint: no-git. Do not resume C-grid-clipboard or data-IDE.

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Improve Models dialog layout (truncation, CTA, header, density) | F-model-card | no | ModelSelectionDialog |

### Dispatch
Mode: feature implement | S: desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-chrome-plan | Unified work package: chrome + About + loader | [plan] | plan-lifecycle, house-laws | - | W-chrome-* | 2 | DONE |
| C-chrome-pills | Remove language pills and header About | [impl] | F-header-chrome-W | - | - | 3 | DONE |
| C-chrome-pills-verify | Verify pills vs work package | [critic] | F-header-chrome-W | C-chrome-pills | 3b | DONE |
| C-loader-pulse | AnvilLoader logo pulse | [impl] | F-header-chrome-W | - | - | 3 | DONE |
| C-loader-pulse-verify | Verify loader vs work package | [critic] | F-header-chrome-W | C-loader-pulse | 3c | DONE |
| W-model-nb | Neighborhood: ModelSelectionDialog | [explore] | codebase-report, ui-craft | - | - | 1 | BLOCKED |
| W-model-ui | UI specialist vs screenshot | [ui-expert] | ui-craft, desktop-react-ui, design-ui | design-ui | - | 1 | DONE |
| W-model-plan | Work package F-model-card | [plan] | plan-lifecycle, house-laws | - | W-model-ui | 2 | PENDING |

## Prior: header chrome
- Mode: feature implement (landing header chrome)
- User ask (verbatim): screenshot markup. Header language pills: only have the drop down in the settings. Move the bottom-right (i) to the top near the terminal icon. Native window controls boxed (keep, do not overlay).
- Lane: BUILD
- Session focus: desktop
- Ship: web + desktop
- Markup: docs/lifecycle/waves/header-chrome-markup.png
- Research: skipped for chrome. Loader target look is ASK (one question).

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Header language pills off; language only Settings dropdown. Move system-messages (i) FAB into header next to terminal. Keep native min/max/close inset. | F-header-chrome | no (header cluster) | IslandHeader, ConfigDialog, MessageSnackbar, LogViewerDialog |
| 2 | Replace AnvilLoader binary 0-1 grid (page/session loading) | F-loader-anim | no | AnvilLoader |

### Dispatch
Mode: feature implement | S: desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-chrome-nb | Neighborhood: header, language, messages FAB, terminal, titlebar | [explore] | codebase-report, desktop-react-ui | - | - | 1 | DONE |
| W-chrome-ui | UI specialist vs screenshot markup | [ui-expert] | ui-craft, desktop-react-ui, cross-cutting | - | - | 1 | DONE |
| W-loader-ui | Loader specialist: logo pulse, no digits | [ui-expert] | ui-craft, desktop-react-ui | - | - | 1b | DONE |
| W-chrome-plan | Kind W F-header-chrome + loader | [plan] | plan-lifecycle, house-laws | - | W-chrome-nb, W-chrome-ui | 2 | DONE |
| C-chrome-pills | Remove header language pills + About nav | [impl] | F-header-chrome-W | - | 3 | DONE |
| C-chrome-pills-verify | Verify pills vs work package | [critic] | F-header-chrome-W | C-chrome-pills | 3b | DONE |
| C-chrome-messages | Move system-messages (i) into header | [impl] | F-header-chrome-W | C-chrome-pills Accept | 4 | DONE |
| C-chrome-messages-verify | Verify messages vs work package | [critic] | F-header-chrome-W | C-chrome-messages | 4b | DONE |
| C-chrome-overflow | Compact overflow Settings + Messages | [impl] | F-header-chrome-W | C-chrome-messages | 5 | DONE |
| C-chrome-overflow-verify | Verify overflow vs work package | [critic] | F-header-chrome-W | C-chrome-overflow | 5b | DONE |
| C-loader-pulse | AnvilLoader logo pulse | [impl] | F-header-chrome-W | - | 3 | DONE |
| C-loader-pulse-verify | Verify loader vs work package | [critic] | F-header-chrome-W | C-loader-pulse | 3c | DONE |

### Coding plan - F-header-chrome
Blast: small. SHAPE logged. Path: docs/lifecycle/work-packages/F-header-chrome-W.md

| ID | Chunk goal | Depends on | Likely files | Acceptance | Status |
|----|------------|------------|--------------|------------|--------|
| C-chrome-pills | Delete header language pills, compact language list, header About. Keep App, Settings Select, LanguageScreen, /about route. | - | src/components/IslandHeader.tsx | No pills, no About nav, App remains, #config-language lists house ids | Accepted |
| C-chrome-messages | Move MessageSnackbar FAB into header info IconButton. Toasts stay bottom-right. | C-chrome-pills | src/views/MessageSnackbar.tsx, src/app/App.tsx, src/components/IslandHeader.tsx | No FAB; info in cluster left of caption inset | Accepted |
| C-chrome-overflow | Compact overflow: no language, no About; Settings + Messages; visible info. | C-chrome-messages | src/components/IslandHeader.tsx | Compact menu has no language/About | Accepted |
| C-loader-pulse | Replace BinaryGrid with df-logo.svg opacity pulse. | - | src/components/AnvilLoader.tsx | Fire mark, no 0/1 cells | Accepted |

### Reflect - C-chrome-pills (2026-08-19)
- Verify: docs/lifecycle/waves/header-chrome-verify-pills.md A1-A7 G1 X1 pass. Sidecar C-chrome-pills-verify.md.
- Manager spot-check: no LanguageSwitcher / LanguageMenuItems / appBar.about in src. App TopNav remains. /about + About.tsx kept. #config-language maps AVAILABLE_LANGUAGES. Ctrl+, / Cmd+, / onOpenPreferences kept.
- Code correct? Slice yes. Typecheck FAIL tree-wide (dfSlice parentTurn, recipes Theme {}, utils ThemeSpec, DataSourceSidebar/IslandHeader SxProps array, DataView, SimpleChartRecBox, VisualizationView). Same SxProps class as DataSourceSidebar, not a pills logic fail. Lint FAIL: yarn not on PATH.
- Feature correct? Yes vs F-header-chrome-W C-chrome-pills.
- Fits system? Yes. SUPERSEDES F-i18n toolbar switcher. Settings + LanguageScreen stay.
- Usability Accept: pass (brownfield chrome cut; later language is Settings).
- checkpoint: no-git
- set-chunks done C-chrome-pills; active C-chrome-messages; pending C-chrome-overflow. set-impl ui=partial rollup=frontend_only.

### Reflect - C-loader-pulse (2026-08-19)
- Verify: docs/lifecycle/waves/header-chrome-verify-loader.md A1-A7 X1 pass. Sidecar C-loader-pulse-verify.md. Writer sidecar C-loader-pulse.md (AnvilLoader.tsx only). Different critic, not the writer.
- Manager spot-check vs F-header-chrome-W: BinaryGrid gone under src/. df-logo.svg 52x48 opacity keyframes only. prefers-reduced-motion animation none, opacity 1. height/label/action/sx kept. App.tsx first paint and DataFormulator session Backdrop still mount AnvilLoader.
- Code correct? Slice yes. Typecheck FAIL tree-wide (cleanVerbs parentId, dfSlice parentTurn, recipes Theme {}, utils ThemeSpec, IslandHeader/DataSourceSidebar/SimpleChartRecBox SxProps, DataView, VisualizationView). AnvilLoader.tsx not in the tsc list. Lint SKIP: yarn not on PATH.
- Feature correct? Yes vs F-header-chrome-W C-loader-pulse (fire mark, no 0/1 cells, same mounts).
- Fits system? Yes. Same AnvilLoader plug-in; landing df-logo.svg reused.
- Residual not fail: reduced-motion rest 1 vs ui-expert 0.9; label has no pulse (W keeps API only).
- checkpoint: no-git. Scheduler 01a01c50a86f deleted. Did not re-spawn C-chrome-pills-verify. Did not spawn messages critic (no sidecar). Did not DISPATCH-FALLBACK C-chrome-messages (owned by 01a01c4e03ec). No F-model-card (W-model-plan missing).
- set-chunks F-loader-anim done C-loader-pulse; active none; pending empty. set-impl ui=partial rollup=frontend_only. Did not mark-done (no S9).

### Reflect - C-chrome-messages (2026-08-19)
- Verify: docs/lifecycle/waves/header-chrome-verify-messages.md A1-A8 X1 pass. Sidecar C-chrome-messages-verify.md. Writer sidecar C-chrome-messages.md (DISPATCH-FALLBACK). Different critic, not the writer. Host 01a01c56-1814-73a3-bda7-f80d7402cea3 not_found; harvest on sidecar at elapsed 137s.
- Manager spot-check vs F-header-chrome-W: MessageSnackbar has open / onOpenChange / hideTrigger. AppShell sole mount is hideTrigger + controlled open. No absolute bottom-right FAB on product path. IslandHeader MessagesHeaderButton after gear/terminal on wide and compact App and About. Click uses outlet setMessagesOpen. Paper + last-message toast stay bottom-right. Button has df-no-drag. desktop.test.ts captionInset 140 unchanged.
- Code correct? Slice yes. Typecheck FAIL tree-wide (cleanVerbs parentId, dfSlice parentTurn, recipes Theme {}, utils ThemeSpec, IslandHeader/DataSourceSidebar/SimpleChartRecBox SxProps, DataView, VisualizationView). MessageSnackbar.tsx and App.tsx not in the tsc list. IslandHeader SxProps is the same array class as pills Accept, not a messages logic fail. Lint SKIP this beat.
- Feature correct? Yes vs F-header-chrome-W C-chrome-messages (no FAB; header info; toasts bottom-right).
- Fits system? Yes. hideTrigger / controlled open matches ConfigDialog and LogViewerDialog. Outlet context keeps one snackbar host.
- Residual not fail: unused MessageSnackbarTrigger import in IslandHeader; unused trigger/context/children on MessageSnackbar. Compact overflow Messages row is C-chrome-overflow.
- Usability Accept: pass (brownfield trigger move; panel dismiss + empty copy already exist). No shots this chunk (same as pills).
- checkpoint: no-git. Scheduler 01a01c56c1db deleted. Did not resume C-grid-clipboard or data-IDE. Did not spawn F-model-card.
- set-chunks F-header-chrome done C-chrome-pills,C-chrome-messages; active C-chrome-overflow; pending empty. set-impl ui=partial rollup=frontend_only. Did not mark-done (overflow + S9 remain).

### Reflect - C-chrome-overflow (2026-08-20)
- Verify: docs/lifecycle/waves/header-chrome-verify-overflow.md A1-A7 X1 pass. Sidecar C-chrome-overflow-verify.md. Writer sidecar C-chrome-overflow.md (IslandHeader.tsx only). Different critic 01a01c64-7816-7241-98df-7aeaa7750ca1, not the writer. Hosts 01a01c5b and 01a01c64 not_found this session; harvest on sidecars.
- Manager spot-check vs F-header-chrome-W: compact App overflow keys explore/reports/settings/messages/logs/exit. compact About keys settings/messages/logs/video. No language. No About. Visible MessageSnackbarTrigger in both compact clusters. openMessages -> setMessagesOpen. desktop.test.ts captionInset 140 unchanged.
- Code correct? Slice yes. Typecheck FAIL tree-wide (cleanVerbs parentId, dfSlice parentTurn, recipes Theme {}, utils ThemeSpec, IslandHeader/DataSourceSidebar/SimpleChartRecBox SxProps, DataView, VisualizationView). IslandHeader.tsx:274 SxProps is the same array class as pills Accept, not overflow keys. Lint SKIP this beat.
- Feature correct? Yes vs F-header-chrome-W C-chrome-overflow (compact menu has Settings + Messages, no language/About, info visible at compact width).
- Fits system? Yes. Overflow reuses ToolbarOverflowMenu. Visible trigger stays. Same outlet paper as wide chrome.
- Residual not fail: extra overflow rows explore/reports/logs/exit/video. Plan required Settings + Messages present, did not forbid those.
- Usability Accept: pass (brownfield compact menu; visible info not overflow-only). No shots this chunk.
- checkpoint: no-git. Scheduler 01a01c5c1834 already gone. CHILD-KILL harvest already_gone. Did not spawn S9 this tick. Did not resume C-grid-clipboard or data-IDE. Did not spawn F-model-card.
- set-chunks F-header-chrome done C-chrome-pills,C-chrome-messages,C-chrome-overflow; active none; pending empty. set-impl ui=partial rollup=frontend_only. Did not mark-done (S9 remain).

## Prior: Research (data-IDE)
- Mode: research (missing data-IDE features) | Lane: REPORT | S: desktop
- User lock 2026-08-19: product is an IDE for analysis, cleaning, and reporting. Re-checked Kind R. Cleaning skip withdrawn (keep verbs, still skip node canvas).
- User 2026-08-19: implement them all. BUILD. All PENDING Kind R IDs. DEFERRED skip stays skipped (SQL-01, PAL-01, NEW-13, NEW-15, notebooks/git/Hex/KNIME canvas/DataGrip/Electron).
- SHAPE: one plan, no new top nav, no node canvas. Execute Phase A (clean grid) first. Research skipped (Kind R just written).
- Did not resume F-cicada-ui W11. Objective this message: implement Kind R PENDING IDs.
- AD 01a01c351748 tick 1/8: critic r2 still reading (~119s, 36 calls). Did not Accept. Did not start C-grid-menu.

## Locale expansion (this user message)
- User: the app is going to be in 20 languages we have them in the auto skills
- D-locale-set LOCKED house 20 from cross-cutting.md: ar zh nl en fr de el hi it ja ko pl pt ro ru es th tr vi fil. `fil` aliases `tl`.
- Already Accept (polish Pass): en (SSOT) zh ja ko fr de pt es ru tr it ar
- Writers harvested all 14 new trees (not empty). L-th polish r1 FAIL. Spawned DIFFERENT L-th-fix + [polish] nl pl fil.
- Fan-out: user 12 at a time
- CHILD-KILL harvest: L-th polish after FAIL sidecar. L-fil writer completed (sidecar). Lifetime tick leftover already_gone.
- Spawned L-th-fix 01a01c3f-82a8-7360-9430-30daa8be3f04, [polish] nl 01a01c3f-82a8-7360-9430-30ed3a28e52c pl 01a01c3f-82a8-7360-9430-30f41985b75e fil 01a01c3f-82a8-7360-9430-310578587493. Live hi polish 01a01c38-4a23-7892-bb7a-7162472cfaa3.
- child-lifetime false-harvest on pre-existing th/errors.json for L-th-fix (82s, still reading). Did not kill. Did not kill L-hi at 555s (still progressing; el polish took 647s). parentAction stop.
- AD 01a01c224cfd tick 8/8: Wave A hosts not_found. Harvest on sidecar only. No Wave A L-* sidecars (claimed L-ar.md missing). Empty {} not harvested. Partial pt/th not complete, not harvested. Did not invent copy. Did not spawn Wave A second writers. No [polish] (nothing harvested). Spawned leftover L-vi 01a01c2a-b76f-7c22-a22f-c5b444eb3004 and L-fil 01a01c2a-b770-70d1-8a79-7d28202425d2. Scheduler deleted. Card stop. No F-cicada. No Kind R.
- AD 01a01c2c8cf3 tick 8/8: Wave A writers STILL LIVE (not_found was wrong; JSON mtimes advancing). Harvest on sidecar only. Harvested L-th L-ru L-tr L-pt L-es L-ar L-it L-el L-ro (sidecars, trees not {}). Spawned DIFFERENT [polish]: th 01a01c31-a6fd-70e1-bd05-bda72ee067d6, ru 01a01c31-a6fe-7750-90eb-2ac3e0965d4b, tr 01a01c32-0381-7c93-b3cc-548dc918690b, pt 01a01c32-688c-72b3-b044-097e21bb988c, es 01a01c33-5e35-7d93-9a10-82e5adbf8cbd, ar 01a01c33-5e36-71b3-a9f8-027595e0bfaa, it 01a01c35-6233-7dc2-97a0-390e67af53d5, el 01a01c36-9fab-7070-b17a-8a77506bc42b, ro 01a01c36-9fab-7070-b17a-8a8c83635038. L-th-verify fail; L-ru-verify fail-rewrite; did not spawn a second polish per locale. Empty {} not harvest. No sidecar yet for nl/pl (trees filling) or leftover L-fil (partial). Harvested leftover L-vi and L-hi (sidecars, trees not {}) and spawned DIFFERENT [polish] vi 01a01c37-5437-7bd2-936b-8e9146adf572 hi 01a01c38-4a23-7892-bb7a-7162472cfaa3. Did not invent copy. Did not spawn Wave A second writers. Did not kill still-writing writers. Scheduler deleted. Card stop. No F-cicada. No Kind R.
- AD 01a01c41fd6b harvest beat: sidecar-only. Harvested L-th-fix (not th/errors.json), L-nl-verify Pass, L-hi-verify Pass, L-fil-verify Pass, L-th-verify-r2 Pass (already on disk; did not spawn a second r2), L-pl-verify Pass (sidecar late this beat; JSON was still advancing). Manager Reflect P0 keys vs files. set-chunks F-locales add L-nl L-hi L-fil L-th L-pl done; active none. Spawned DIFFERENT [impl] C-i18n-locale-tests-20 01a01c4c-fba7-7291-b521-d0dbb67c7ed1 (not the six-locale writer; sidecar C-i18n-locale-tests-20.md). Did not invent copy. Did not typecheck. Did not mark-done. Listed polish hosts not_found. Card stop. No F-cicada. No Kind R.
- AD 01a01c4c6e8f harvest beat: host 01a01c4b not_found. Harvested sidecar C-i18n-locale-tests-20.md plus tests/frontend/unit/app/i18nLocales.test.ts (HOUSE_LOCALE_IDS 20-way). Manager vitest 22/22 exit 0 (first run raced ja keys; re-run pass). record-quality F-locales vitest ok. set-chunks F-locales add C-i18n-locale-tests C-i18n-locale-tests-20 done; active none. Spawned DIFFERENT [ui-vis] Arabic RTL S9 01a01c56-35d7-7680-859f-7b7842d3a823 (sidecar C-i18n-ar-rtl-s9.md). child-lifetime parentAction stop (pending files). Scheduler list empty this beat; re-arm 60s lifetime. Did not mark-done F-i18n-picker or F-locales (gate FAIL polish/quality/ship). Did not invent copy. Did not resume F-cicada or Kind R. Did not spawn a second locale-tests writer.
- AD 01a01c521aa8 tick 2/8: sidecar-only. Harvested L-fr-keys / L-de-keys / L-ja-keys / L-ko-keys writers plus DIFFERENT polish Pass (named i18n-verify-L-*-keys.md). Did not spawn a second writer or second polish per locale. Manager vitest 22/22 exit 0 after all four polish Pass. record-quality F-locales vitest ok. set-chunks F-locales add L-fr-keys L-de-keys L-ja-keys L-ko-keys done; active none. RTL leftover C-i18n-ar-rtl-s9 sidecar missing; host 01a01c56-35d7 not_found this session (false not_found). Did not spawn a second RTL. Left 01a01c57219b (RTL lifetime) alone. Scheduler 01a01c521aa8 already gone (keys none pending). Did not mark-done. No F-cicada. No Kind R.
- AD 01a01c57219b tick 1/8: C-i18n-ar-rtl-s9 leftover. Host 01a01c56-35d7 not_found. Named PNG stable (desktop-language-ar-rtl.png + web-language-ar-rtl.png). child-lifetime harvest named files stable elapsed 263s. Manager opened both PNGs: capture ok, dir=rtl (check on left, names on right, title اختر لغتك, CTA متابعة). Accept leftover shot. Wrote missing sidecar C-i18n-ar-rtl-s9.md and named i18n-s9-ar-rtl.md at closeout. set-chunks F-locales add C-i18n-ar-rtl-s9 done; active none. Did not spawn a second [ui-vis]. Did not mark-done F-i18n-picker or F-locales (gate FAIL polish/quality/ship). Did not invent copy. Did not resume F-cicada or Kind R. Scheduler 01a01c57219b deleted (none pending).

## Intent
- Mode: feature implement (analysis + cleaning + reporting IDE gaps)
- User ask (verbatim): lets implement them all
- Lane: BUILD
- Session focus: desktop
- Ship: web + desktop
- Kind R: docs/lifecycle/reports/research-missing-features-2026-08-19.md

### Ask
| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | Grid clean verbs + real grid + paste/copy | F-clean-grid | no | DataView, SelectableDataGrid |
| 2 | Applied steps, join/pivot, undo, refresh | F-clean-steps | steps rail on grid | DataThread, data_operations |
| 3 | Workbench panes + desktop OS chrome | F-ide-desktop | no | layout, desktop.py, App.tsx |
| 4 | Report insert / pack / stale | F-report-pack | no | ReportView |

### Dispatch
Mode: feature implement | S: desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W-ide-nb | Neighborhood: grid, threads, reports, desktop | [explore] | codebase-report | - | - | 1 | DONE |
| W-ide-ui | UI specialist F-clean-grid | [ui-expert] | ui-craft, desktop-react-ui | - | - | 1 | DONE |
| W-ide-be | BE specialist F-clean-steps | [be-expert] | architecture-fit | - | - | 1 | DONE |
| W-ide-arch | Arch SHAPE: no canvas, reuse surfaces | [arch-expert] | architecture-fit, desktop-react-ui | - | - | 1 | DONE |
| W-ide-ui2 | UI specialist F-ide-desktop + F-report-pack | [ui-expert] | ui-craft, desktop-react-ui | - | W-ide-nb | 2 | DONE |
| W-ide-plan | Unified work package | [plan] | plan-lifecycle, house-laws | - | W-ide-* | 2 | DONE |
| C-grid-clipboard | IDE-02 copy + NEW-04 paste | [impl] | ui-craft, F-data-ide-W | - | 3 | DONE |
| C-grid-menu | Column clean verbs + signed derive | [impl] | F-data-ide-W | C-grid-clipboard | 5 | IN PROGRESS |
| C-grid-clipboard-fix | Empty-canvas paste host | [impl] | gridClipboard | - | 4 | DONE |

## Prior cicada board (paused)
- Mode: feature implement (Cicada chrome + chart restyle)
- User ask (summary): Review the Cicada plan and images, then update the desktop UI.
- Lane: BUILD
- Session focus: desktop
- Ship: web + desktop
- Work package ACCEPTED. plan-check PASS. Wave C r2 ok. Island Accepted. DISPATCH-FALLBACK: short inset used REFERENCE.islandInset 8px (not scaled 7px). Sidebar + charts writers live (worktrees).

### Dispatch
Mode: feature implement | S: desktop | Ship: web, desktop

| ID | Clause | Tag | Refs | Skill | Depends | Wave | Status |
|----|--------|-----|------|-------|---------|------|--------|
| W1 | Neighborhood | [explore] | codebase-report, ui-craft | - | - | 1 | DONE |
| W2 | UI expert vs plan + images | [ui-expert] | ui-craft, desktop-react-ui, design-ui | design-ui | - | 1 | DONE |
| W3 | Arch expert | [arch-expert] | architecture-fit | - | - | 1 | DONE |
| W4 | Work package | [plan] | plan-lifecycle | - | W1-W3 | 2 | DONE |
| W5 | Plan review r1+r2 | [ui-expert] [arch-expert] | feature-ask | - | W4 | 3 | DONE |
| W6 | C-cicada-tokens | [impl] | ui-craft, design-ui | design-ui | W5 | 4 | DONE |
| W7 | C-cicada-recipes | [impl] | ui-craft, design-ui | design-ui | W6 | 5 | DONE |
| W8 | C-cicada-island | [impl] | ui-craft, desktop-react-ui, design-ui | design-ui | W7 | 6 | DONE |
| W9 | C-cicada-sidebar | [impl] | ui-craft, design-ui | design-ui | W8 | 7 | DONE |
| W11 | C-cicada-composer | [impl] | ui-craft, design-ui | design-ui | W9 | 8 | DONE |
| W10 | C-cicada-charts | [impl] | ui-craft, design-ui | design-ui | W6 | 7 | DONE |

## Lifecycle
- Path: docs/lifecycle/LIFECYCLE.md
- **Canonical state:** docs/lifecycle/project-state.json
- Stage: S8 in_progress. Map current brownfield.
- Next: House 20 copy + 20-way key tests DONE. Incremental sidebar.connected / sidebar.offline keys DONE. Arabic RTL S9 leftover Accepted (dir=rtl; named i18n-s9-ar-rtl.md). Do not mark-done F-i18n-picker or F-locales (gate-check FAIL polish/quality/ship). Do not invent copy. Do not resume F-cicada or Kind R on the locale card.

## Active work package
- Path: docs/lifecycle/work-packages/F-i18n-W.md
- Kind: W
- Status: ACCEPTED
- plan-check: PASS (F-i18n-picker, F-locales)
- Verdict: SHAPE (six LANGUAGE_LABELS ids; overlay above model wall; keep i18next)

## Active execution plan
- Path: None
- Kind: E
- Status: DRAFT

Wave 1 child ids:
- W1 explore: 01a01b57-d83f-71a1-b127-12004a70dcbf (resume after CHILD-KILL stall)
- W2 research: 01a01b57-d840-7610-b556-046608ade104 (resume after CHILD-KILL stall)
- W3 ui-expert: 01a01b55-060a-71f0-affd-bc59f3649355 DONE
- W4 be-expert: 01a01b57-d840-7610-b556-047cf7db5c9f (resume after CHILD-KILL stall)
Wave 2 child: W5 01a01b5a-d9a5-7ad3-a329-525bf33e6702 harvest (sidecar). Scheduler 01a01b5bb77e gone.
Wave 3 round 1: W6-ui / W6-be DONE (must patched).
Wave 3 round 2: UI and BE both ok, no remaining must.
Wave 4: C-i18n-plumbing ACCEPTED. W7-verify 01a01b6e-9fd7-7260-9151-78b6467d3517 CHILD-KILL harvest (host not_found). Named i18n-verify-plumbing.md. All ten checks Pass. Scheduler 01a01b6fff22 gone. set-chunks done.
C-picker-gate HARVESTED. Independent critic 01a01b79-69cd-79c1-ad10-fb70979fed35 sidecar Pass (all 7). Named docs/lifecycle/waves/i18n-verify-gate.md. set-chunks C-picker-gate done.
C-picker-screen HARVESTED (sidecar + onboarding keys in en/zh). C-picker-settings HARVESTED (sidecar + ConfigDialog language row).
Wave 5 original 8: critic completed; screen/settings/L-* cancelled by parent shutdown 19:25:23. Follow-on locale writers 01a01b7c-c972-73dae ja, 01a01b7c-c973-7e14 ko, 01a01b7c-c973-7e2e fr, 01a01b7c-c974-a30b de, 01a01b7c-c977-88b7 zh. AD 01a01b7a7b61 tick 8 force-kill: all hosts not_found. C-picker-screen and C-picker-settings already harvested (no DISPATCH-FALLBACK). L-zh/ja/ko/de sidecars present. L-fr sidecar written at closeout (trees complete, not {}). Did not invent ja/ko/fr/de copy (common.json no longer {}). Did not spawn a second locale writer. Spawned DIFFERENT [polish] per locale. Scheduler 01a01b7a7b61 deleted. Card stop.
Critic AD 01a01b7d3fc0 harvested 01a01b7c-e6ca-74c2-91e7-069c0f33f6da (host not_found). Sidecar C-picker-gate-verify.md + named i18n-verify-gate.md all 7 Pass. set-chunks C-picker-gate already done. Scheduler 01a01b7d3fc0 already gone. Card stop. Did not spawn a second gate writer or screen writer (screen on disk). No locale campaign on this card. Gate AD 01a01b722396 already gone.
W9 polish HARVESTED (AD 01a01b8b83c8 tick 8). zh r1 fail + fix + r2 Pass. ja r1 fail + fix + r2 Pass (lows open, not a fail). ko r1 fail + fix + r2 fail + r3 Pass. fr r1 Pass (named i18n-verify-L-fr.md). de r1 fail-rewrite + fix + r2 Pass. Listed hosts not_found, kill already_gone. Did not spawn a second polish per locale. Did not invent translations. Did not spawn C-i18n-locale-tests until all polish Pass. Then spawned C-i18n-locale-tests 01a01b92-ccd6-7ae0-8416-35b7bec9e226. ko-fix-r2 01a01b91-fbe4-75b0-8195-a7f1cf2971b2 already_gone after r3 Pass already on disk. Scheduler 01a01b8b83c8 deleted. Card stop. No worktree merge.
C-i18n-locale-tests HARVESTED (sidecar Pass, vitest exit 0). C-test-spec HARVESTED (named docs/lifecycle/test-cases/F-i18n-picker.md, ten P0 ready). C-picker-desktop-keys HARVESTED (hosts not_found; sidecar written at closeout; LanguageScreen keys + Cmd/Ctrl+, Preferences + min 960x640 + no-drag). AD 01a01b959931 tick 8: listed impl/test-spec hosts not_found. Spawned DIFFERENT W10 S9 [wf] 01a01b9d-9977-7681-8885-fc57cfc0c806 [ui-vis] 01a01b9d-997b-77a1-a9cb-7e6f1d5a11f9 [connect] 01a01b9d-997b-77a1-a9cb-7e74863ebf72 [arch-fit] 01a01b9d-997c-7f81-b3c6-39e3106e7d32. Did not spawn a second locale campaign. Scheduler 01a01b959931 deleted. Card stop. No worktree merge.
W10 S9 HARVESTED (AD 01a01b9d35e6 tick 8). Panel hosts 01a01b9d-0eb8 / 0eb9 not_found. Sidecars: ui-vis capture 10/10, connect pass, arch-fit FIT, wf DISPATCH-FALLBACK. Catalog TC-picker-01..10 pass. No catalog P0 fail (no [impl] fix). set-impl tests panel, arch-fit fit, testCases executed. gate-check FAIL polish/quality/ship. Did not mark-done. Did not spawn a second locale campaign. Did not spawn a second S9. Scheduler 01a01b9d35e6 deleted. Card stop. No worktree merge. P1 deferred: V-narrow-outline-clip, V-tall-cta-gap.
C-picker-persist-fix HARVESTED (AD 01a01ba9eb8d tick 1). Host 01a01ba9-d5da-7672-805e-a093c0a7e908 not_found. Product files on disk (caches [] until Continue, preview restore, persistI18nextLng). Sidecar written at harvest. Spawned DIFFERENT [critic] 01a01bb1-3c03-7762-8c8c-cc550b8d4a31 (not 01a01b79 / 01a01b7c-e6ca). Named i18n-verify-persist.md P1-P8 Pass. Sidecar C-picker-persist-verify.md pass. Did not mark-done. Did not spawn a locale campaign. Did not spawn a second S9. Scheduler 01a01ba9eb8d deleted. Card stop. No worktree merge.

## Active test run
- Path: docs/test-runs/i18n-locales-2026-08-19/

## Status board (mirror the chat bullets)

| ID | Item | Status |
|----|------|--------|
| F-i18n-picker | Language picker + plumbing | IN PROGRESS (S9 pass; persist critic Pass; gate FAIL polish) |
| F-locales | Native copy for house 20 | DONE chunks (RTL S9 leftover Accepted; gate FAIL polish) |
| W1 | Neighborhood inventory | DONE |
| W2 | Feature research | DONE |
| W3 | UI specialist | DONE |
| W4 | BE specialist | DONE |
| W5 | Unified plan | DONE |
| W6 | Specialist plan review (r2: no remaining must) | DONE |
| W7 | C-i18n-plumbing | DONE |
| W7b | C-picker-gate | DONE (ACCEPTED; critic A1-A7 Pass) |
| W7-verify | Gate vs plan | DONE (named i18n-verify-gate.md) |
| C-picker-screen | House look + onboarding keys | DONE |
| C-picker-settings | Settings language row | DONE |
| C-picker-desktop-keys | Keyboard + Preferences shortcut | DONE |
| L-zh L-ja L-ko L-fr L-de | Native locale campaign (user 12-wide) | HARVESTED (W9 polish Pass) |
| W9 | Locale [polish] verify (not the writer) | DONE (all five Pass) |
| C-i18n-locale-tests | Six-locale key parity | DONE |
| C-test-spec | Keep-catalog F-i18n-picker.md | DONE |
| W10 | picker S9 [wf] [ui-vis] [connect] [arch-fit] | DONE (catalog P0 pass; gate FAIL polish) |
| C-picker-persist-fix | Card tap must not persist i18nextLng until Continue | DONE (critic P1-P8 Pass) |
| Wave A house 20 | ar es ru pt it nl pl ro el hi th tr | DONE writers (all sidecars; trees not empty) |
| Wave B leftover | L-vi L-fil | DONE writers (sidecars) |
| House 20 polish Pass | L-pt L-es L-ru L-tr L-it L-ar L-ro L-vi L-el L-fil L-hi L-nl L-th L-pl | DONE (Accept) |
| House 20 polish live | (none) | DONE |
| C-i18n-locale-tests-20 | 20-way key parity | DONE (re-run after keys 22/22 exit 0) |
| C-i18n-ar-rtl-s9 | Arabic RTL LanguageScreen shot | DONE (Accept; dir=rtl) |
| L-fr-keys | Actif / Hors ligne | DONE (polish Pass) |
| L-de-keys | Aktiv / Offline | DONE (polish Pass) |
| L-ko-keys | 사용 중 / 오프라인 | DONE (polish Pass) |
| L-ja-keys | 使用中 / オフライン | DONE (polish Pass) |
| L-th-fix | parse แปลง + empty ไม่กันไหม | DONE |
| L-th r2 | independent re-verify after fix | DONE (Pass, Accept) |

## Assumptions
- "The list" is the house 20 in `src/i18n/houseLocales.ts` (autonomous-developer cross-cutting.md). Native names on the picker.
- Keep i18next. Do not add a second i18n stack.
- English is meaning SSOT. zh exists and still needs a native verify pass. ja/ko/fr/de need new files.
- Language-first overlay inserts above existing first-run/model wall. Do not delete the model overlay unless ASK.

## Decisions
| ID | Title | Chosen | Status |
|----|-------|--------|--------|
| D-data-ide-job | What professional data IDE means here | IDE chrome around encoding shelf + agent + threads. Not notebooks, not DataGrip, not Hex platform. | LOCKED (research, other job) |
| D-sql-drawer | First-class SQL | Later drawer on current tables. Not P0. Not home screen. | LOCKED (research, other job) |
| D-locale-set | Which locales to ship this turn | House 20 from cross-cutting.md: ar zh nl en fr de el hi it ja ko pl pt ro ru es th tr vi fil. `fil` aliases `tl`. User 2026-08-19: ship all of them. | LOCKED |
| D-i18n-stack | i18n library | Keep i18next. W1+W4: no second stack. Widen AVAILABLE_LANGUAGES default to the six. | LOCKED |
| D-language-first | First-run language overlay | House LanguageScreen above the model wall. languageCompleted separate from i18nextLng. Returning-user skip uses the pre-init i18nextLng snapshot, not a post-init detector write. | LOCKED |
| D-locale-fanout | Locale writer concurrency | User 2026-08-19: 12 languages at a time with agents. Overrides default writer cap for this campaign. This listed set is 5 write jobs (zh ja ko fr de). Spawn all of them in one wave. | LOCKED |

## 3-Strike / incidents
| Date | Error | Attempts | Resolution |
|------|-------|----------|------------|
| 2026-08-20 | AD 01a01e2a0eec tick 1/8: critic harvest 2/3; auth-screens-verify pending | 1 | child-lifetime parentAction stop. Harvested sql-guard pass + bill-shell fail (live export/session already patched). Auth-screens-verify missing. Hosts 01a01e29-c408-* not_found. Did not spawn Wave 2. Did not re-implement Wave 1. Scheduler already gone (duplicate). Re-armed 01a01e2db892. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01e085b3a Wave A harvest then plan-check | 1 | child-lifetime parentAction continue. Wave A sidecars nb/ui done. Named F-billing-W.md DISPATCH-FALLBACK. plan-check PASS. ACCEPTED. Concurrent already spawned C-bill-scaffold 01a01e0a-bd7a-7122-b121-a8f6c74a8c7a. THIS scheduler already gone. Left 01a01e0bc752. Did not spawn a second scaffold. Did not resume SaaS screens. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01e038fca tick 2/8: C-wf-replay-target sidecar missing; RecBox gate not on disk | 1 | child-lifetime parentAction stop. Snapshot timeout_ms 0. Host 01a01e05-ddac-7313-b37f-4dedd7f8d9c6 not_found this session. KnowledgePanel Dialog mid-write. SimpleChartRecBox unchanged. Did not spawn critic. Did not spawn a second writer. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01dfe5abe tick 2/8: W harvested; plan-check already PASS | 1 | child-lifetime parentAction continue. Named F-workflow-db-W.md full. Sidecar W-wf-plan.md done. plan-check PASS. House-law fill from the W. Concurrent already spawned C-wf-replay-target. THIS scheduler already gone. Did not spawn a second [impl]. Left 01a01e038fca. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01dfe5abe tick 1/8: W-wf-plan sidecar and named W missing | 1 | child-lifetime parentAction stop. Snapshot timeout_ms 0. Sidecar W-wf-plan.md missing. Named F-workflow-db-W.md missing. Host 01a01dfe-3cee-7e32-8542-f99b0641682d not_found this session. Scheduler remains. Did not plan-check. Did not spawn [impl]. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01dfc4dd7 Wave A harvest then plan-check | 1 | child-lifetime parentAction continue. Wave A sidecars done. Full F-workflow-db-W.md harvested. plan-check PASS. ACCEPTED. Spawned DIFFERENT [impl] C-wf-replay-target 01a01e05-ddac-7313-b37f-4dedd7f8d9c6. Stub C-wf-sheet already_gone. Retargeted 01a01e038fca. Did not resume SaaS screens. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01df092de critic harvest: C-auth-session-verify fail | 1 | child-lifetime parentAction continue. Named saas-verify-auth-session.md A1-A3 pass. Fail G3 G5 P02-idle P03-origin. Did not Accept. Did not set-chunks C-auth-session done. Did not spawn C-auth-migrate. Spawned DIFFERENT [impl] C-auth-session-fix. THIS scheduler already gone. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01de4f9bd critic harvest: P01-reset fail | 1 | child-lifetime parentAction continue. Named saas-verify-auth-store.md A1-A4 pass, P01-reset fail. Did not Accept. Did not spawn a second C-auth-session. Left 01a01de8a819. Spawned DIFFERENT [impl] C-auth-user-store-fix. THIS scheduler already gone. Card IN PROGRESS. |
| 2026-08-20 | AD 01a01dd82346 Wave 2: plan+sec harvested; research stall 344s; concurrent tick already plan-check PASS + C-auth-user-store | 1 | child-lifetime parentAction continue. DISPATCH-FALLBACK lite research-saas-2026-08-20.md. THIS scheduler already gone. Did not spawn a second [impl]. Did not delete 01a01ddd296d. Card stop. |
| 2026-08-19 | AD 01a01c2c8cf3 tick 8: prior not_found was wrong; Wave A writers still writing | 1 | child-lifetime: harvest on sidecar only. Harvested nine (th ru tr pt es ar it el ro). Spawned DIFFERENT [polish]. th fail, ru fail-rewrite; no second polish. Did not kill still-writing writers. Did not invent copy. Did not spawn second Wave A writers. Deleted scheduler. Card stop. |
| 2026-08-19 | AD 01a01c224cfd tick 8: Wave A 12 locale writers not_found; no sidecars; empty {} except partial pt/th | 1 | child-lifetime: harvest on sidecar only. Did not invent copy. Did not harvest empty or partial trees. Did not spawn a second Wave A writer. Spawned leftover L-vi and L-fil. Force-kill already_gone. Deleted scheduler. Card stop. |
| 2026-08-19 | AD 01a01ba9eb8d persist-fix host 01a01ba9-d5da not_found; sidecar late | 1 | child-lifetime: harvest on product files. Wrote C-picker-persist-fix sidecar. Spawned DIFFERENT critic 01a01bb1 (P1-P8 Pass). Did not mark-done. Did not spawn a locale campaign. Deleted scheduler. Card stop. |
| 2026-08-19 | AD 01a01b9d35e6 tick 8: W10 S9 hosts not_found; ui-vis/connect/arch-fit sidecars on disk; wf sidecar late | 1 | child-lifetime: harvest on sidecar. Wrote missing W10-wf at closeout. Catalog P0 pass. No [impl] (no catalog P0 fail). set-impl tests panel + arch-fit. gate-check FAIL polish/quality/ship. Did not mark-done. Did not spawn a second locale campaign. Force-kill already_gone. Deleted scheduler. Card stop. |
| 2026-08-19 | AD 01a01b959931 tick 8: C-picker-desktop-keys and C-test-spec hosts not_found; named files on disk | 1 | child-lifetime: harvest on sidecar/named files. Wrote missing worker sidecars at closeout. Spawned DIFFERENT W10 S9. Did not spawn a second locale campaign. Force-kill already_gone. Deleted scheduler. Card stop. |
| 2026-08-19 | AD 01a01b8b83c8 tick 8: W9 polish hosts not_found; sidecars complete | 1 | child-lifetime: harvest on sidecar. All five polish Pass (zh r2, ja r2, ko r3, fr r1, de r2). Did not spawn a second polish per locale. Did not invent translations. Spawned DIFFERENT C-i18n-locale-tests. Force-kill already_gone. Deleted scheduler. Card stop. |
| 2026-08-19 | AD 01a01b7a7b61 tick 8: Wave-5 locale writers not_found, L-* sidecars late | 1 | child-lifetime: harvest on sidecar. Screen/settings already harvested, no DISPATCH-FALLBACK. Force-kill already_gone. Did not invent ja/ko/fr/de copy (files not {}). Spawned DIFFERENT [polish] per locale. Deleted scheduler. Card stop. |
| 2026-08-19 | Wave-5 original 7 writers cancelled (parent shutdown) | 1 | child-lifetime: critic sidecar Pass. Screen/settings harvested from follow-on sidecars. Did not spawn a third writer. Follow-on L-* already live; wait sidecars. Card stop. No DISPATCH-FALLBACK. |
| 2026-08-19 | Leftover gate lifetime 01a01b722396 after stall resume | 1 | child-lifetime harvest. Sidecar + named files stable. Scheduler deleted. Spawned DIFFERENT [critic] vs plan. Card stop. No locale campaign. No DISPATCH-FALLBACK. |
| 2026-08-19 | Leftover W7-verify lifetime 01a01b6fff22 fired after C-picker-gate already spawned | 1 | child-lifetime harvest (sidecar + all 10 Pass). set-chunks C-i18n-plumbing done. Scheduler already gone. Did not spawn a second C-picker-gate writer. Gate lifetime 01a01b722396 remains. |
| 2026-08-19 | L-ko r2 JSON missing commas after recast | 1 | DISPATCH-FALLBACK: restored commas; 해 주세요 -> 해 주십시오; r3 verify spawned |
| 2026-08-19 | C-i18n-plumbing writer read-loop, no files | 2 | CHILD-KILL stall twice; DISPATCH-FALLBACK Manager wrote empty locale trees + persist + AVAILABLE_LANGUAGES |
| 2026-08-19 | W4 no named file ~280s | 1 | CHILD-KILL stall; research fallback succeeded |
| 2026-08-19 | W6 plan child read-loop; SQL-as-P0 draft | 1 | CHILD-KILL stall; DISPATCH-FALLBACK Kind R from W4 |
| 2026-08-19 | Wave A lifetime tick: W1-W4 files ready, host ids not in session | 1 | CHILD-KILL harvest (not found). Used named files. Deleted scheduler 01a01b568e4d. Spawned W5 [plan]. |
| 2026-08-19 | W5 lifetime 01a01b5bb77e: hosts not_found; named F-i18n-W.md + sidecar W5.md | 1 | child-lifetime harvest, parentAction continue. CHILD-KILL already gone. Scheduler 01a01b5bb77e already gone. plan-check PASS. Wave C spawned. No [impl]. |
| 2026-08-19 | W6-be-r2 lifetime 01a01b67f276: hosts not_found; named r2 reviews + sidecars | 1 | child-lifetime harvest, parentAction continue. Wave C complete (UI r2 + BE r2 ok). Plumbing already on disk. Did not spawn a second writer or second verifier. Deleted 01a01b67f276 (gone) and 01a01b67a8b5 after W7 harvest. Verifier 01a01b6e-9fd7-7260-9151-78b6467d3517 already live under 01a01b6fff22. |
| 2026-08-19 | Leftover W6 r1 lifetime 01a01b635768 fired after Wave C closed | 1 | child-lifetime r1 harvest (sidecars). Scheduler already gone. Must already patched. r2 both ok. Did not spawn a second C-i18n-plumbing writer. Plumbing lifetime 01a01b67a8b5 remains. |
