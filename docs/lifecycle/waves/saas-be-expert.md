# BE-expert: F-auth, F-billing, F-data-acl, F-sql

Role: be-expert. Session: analysis Flask + disk workspaces. Do not implement. Do not design portal chrome (see `saas-ui-expert.md`). Do not duplicate AuthButton/login screens.

Refs read: `src/app/oidcConfig.ts`, `src/app/AuthButton.tsx` (UI-owned), `py-src/data_formulator/routes/sessions.py`, DuckDB/`execute_sql` grep, SQL-01 row in `docs/lifecycle/reports/research-data-ide-2026-08-19.md`.

---

## Job 1. F-auth (user store, signup/login/logout vs OIDC)

Today there is no signup user store. Identity is `browser:<uuid>` or `user:*` after optional OIDC. Runtime `/api/auth/info` selects frontend PKCE (`oidc-client-ts`) or backend confidential client (`/api/auth/oidc/login|logout|status`). `AuthButton` signs in only when that info is present; otherwise it renders nothing. Workspaces already key off `get_identity_id()` in `sessions.py` (list/save/load per identity, plus `source_identity` peek for browser-to-user migrate). Approach: keep the OIDC switch and identity-partitioned workspace manager; add a first-party user table and password/session routes only if product chooses email/password. Do not invent a second identity next to OIDC. Login/logout can reuse existing backend and frontend OIDC paths. Signup, required-account gate, and local-workspace attach after first signup are product questions, not a small route add.

**Verdict: ASK**

Chunks: `C-auth-keep-oidc-info`, `C-auth-user-store`, `C-auth-browser-migrate`

---

## Job 2. F-billing (plans, seats, payments)

No plans, seats, invoices, or payment webhooks exist in the analysis backend. Sessions persist disk state; they are not a billing ledger. Approach: do not add Stripe (or similar) into Flask DuckDB routes. Billing APIs belong on a later web-portal service that shares the same account as F-auth, not a new analysis stack. This wave should not pick a payment SDK. Until plan catalog, seat vs workspace-share, and processor are named, there is nothing to SHAPE. Local-only desktop stays unpaid unless product says hosted-only.

**Verdict: ASK** (new stack later; UNFIT inside analysis routes)

Chunks: `C-billing-defer-processor`, `C-billing-portal-api`, `C-billing-seat-contract`

---

## Job 3. F-data-acl (read vs write on workspace data)

Isolation today is one identity's `WorkspaceManager`, not members or roles. Load already surfaces `readOnly` on the client (tests in `workspaceService.test.ts`); session routes do not enforce write denial for a collaborator. Approach: keep identity-partitioned disk as the local default. If share is only "export a copy," ACL is not needed (that is a different job). If share is live collab, the server must reject save/delete/table writes when the caller is a reader, and list/load must return a role. That contract is blocked on F-workspace share meaning (link vs seats vs live vs copy), which UI already ASK'd. Do not fake multi-user ACL on browser identity.

**Verdict: ASK**

Chunks: `C-acl-identity-partition`, `C-acl-enforce-readonly`, `C-acl-share-roles`

---

## Job 4. F-sql (analysis SQL on loaded tables)

SQL-01 is P2 DEFERRED: optional SQL drawer on current DuckDB/tables, not home, not DataGrip. There is no `execute_sql` route. Agents already open an in-memory DuckDB, attach workspace parquet as views (`create_duckdb_conn_with_parquet_views` in `agent_utils_sql.py`), and run SQL internally. Approach: one read-only analysis endpoint that runs a SELECT (or WITH...SELECT) against those same views for the active workspace, with timeout, row cap, and no DDL/ATTACH/COPY. Reuse the helper; do not add a SQL workbench, catalog browser, or second engine. Independent of SaaS. Still a later P2 relative to IDE chrome.

**Verdict: SHAPE** (narrow SELECT-on-loaded-tables only)

Chunks: `C-sql-readonly-execute`, `C-sql-parquet-views`, `C-sql-not-workbench`

---

## Multi-tenant SaaS required?

**ASK: yes** for the combined F-auth signup + F-billing + F-data-acl share wave. Shared workspaces, seats, and payments need a hosted account plane and cannot live only as local disk + optional OIDC.

**ASK: no** for F-sql and for keeping today's OIDC-optional login. Those fit the current single-process Flask + per-identity workspace layout.

Hard stop: do not `[impl]` user store, Stripe, or ACL until the ASK items (required vs optional account, email vs SSO, share meaning, processor) are named. F-sql can be a later SHAPE slice without that plane.
