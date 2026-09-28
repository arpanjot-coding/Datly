# Security: F-auth, F-billing, F-workspace share, F-sql drawer (SaaS plan)

Role: security. Session: analysis Flask + disk workspaces + Electron desktop. Do not implement. Do not weaken controls. SaaS is not shipped; this is a pre-impl gate for Phase A auth.

Locked product (HANDOFF): required login after LanguageScreen; email/password plus existing OIDC; live share with roles; Stripe-class billing on a separate web portal; read-only SQL drawer plus guard.

Refs read: `src/app/oidcConfig.ts`, `src/app/AuthButton.tsx`, `src/app/identity.ts`, `src/app/utils.tsx` (`fetchWithIdentity`), `src/app/desktop.ts`, `py-src/data_formulator/auth/identity.py`, `py-src/data_formulator/auth/providers/oidc.py`, `py-src/data_formulator/auth/gateways/oidc_gateway.py`, `py-src/data_formulator/routes/sessions.py`, `py-src/data_formulator/app.py`, `py-src/data_formulator/agents/agent_utils_sql.py`, `py-src/data_formulator/datalake/workspace.py`, `py-src/data_formulator/datalake/workspace_manager.py`, `electron/main.cjs`, `electron/preload.cjs`, `docs/lifecycle/waves/saas-be-expert.md`, `docs/lifecycle/waves/saas-ui-expert.md`, `C:\Users\sarpa\.grok\skills\autonomous-developer\references\security-audit.md`.

No em dashes.

---

## Current posture (what exists)

There is no first-party user table, no password hash, no CSRF token, no Stripe, no share ACL, no `/execute_sql` route.

Identity today (`identity.py`):

1. Configured AuthProvider (`user:<verified_id>`).
2. Loopback single-user (`local:<os_username>`).
3. Anonymous fallback when `ALLOW_ANONYMOUS` is true (default): `browser:<uuid>` from `X-Identity-Id`.

Namespaces are the isolation boundary. Spoofing `user:` via the header is blocked because unverified requests stay `browser:` or fail. Identity values reject `/` and other path/shell characters (`_IDENTITY_RE`). Workspace dirs use `secure_filename` (`sanitize_identity_dirname`, `WorkspaceManager._safe_id`).

Auth switch (`/api/auth/info`, `oidcConfig.ts`):

- Frontend public client: PKCE, `response_type=code`, tokens in `localStorage` via `WebStorageStateStore`.
- Backend confidential client: `/api/auth/oidc/login|callback|status|logout`, tokens in Flask server-side session, cookie HttpOnly + SameSite=Lax.
- `crypto.subtle` required (HTTPS or localhost). Keep that.

Flask session (`app.py`): `SESSION_COOKIE_HTTPONLY=True`, `SESSION_COOKIE_SAMESITE=Lax`, `PERMANENT_SESSION_LIFETIME` = 365 days, `SESSION_USE_SIGNER=True`, filesystem cachelib store. `SESSION_COOKIE_SECURE` is unset. `FLASK_SECRET_KEY` falls back to `secrets.token_hex(16)` per process if env is missing.

Electron (`electron/main.cjs`, `preload.cjs`): `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. Preload exposes only `electronAPI` metadata plus one inbound `open-preferences` listener. No `ipcRenderer.invoke`, no Node in renderer. New windows denied; `https?` opens via `shell.openExternal`. Desktop loads local backend URL. Keep this; do not add password or file IPC.

SQL today: agents open in-memory DuckDB and `CREATE VIEW` over workspace parquet (`agent_utils_sql.py`). Paths are quote-escaped, not parameterized. No user SQL endpoint.

---

## P0 threats

### P0-1. Password store (new; Phase A)

Email/password is locked and does not exist. If hashes are weak, reversible, or logged, every later ACL and billing seat is untrustworthy.

Musts:

- Store only a slow hash: Argon2id (preferred) or bcrypt. Never plaintext, never reversible encryption, never SHA/MD5/HMAC-only.
- Library-default salt per row. Optional server pepper in env (`PASSWORD_PEPPER`), not in the repo.
- Normalize email (trim, lowercase) and unique-index it.
- Do not put the password, hash, or pepper in Flask session, JWT, logs, or API responses.
- Existing `log_sanitizer` already redacts `password`; keep it. Do not add debug prints of signup bodies.
- Login compare must be constant-time via the hash library, not `==` on strings.
- Enumeration: same status and body for unknown email vs wrong password.
- Policy: minimum length (12+) plus block common passwords. Composition theater is not a substitute for length + hash + rate limit.
- Reset tokens: random, hashed at rest, single-use, short TTL. Do not email the current password.

Do not reuse the connector credential vault (`LocalCredentialVault` Fernet) for user passwords. That vault is reversible by design for data-source secrets.

### P0-2. Session (hosted required login)

A 365-day unsigned-looking cookie on a local-first app is wrong for SaaS accounts. Missing `Secure` lets HTTPS cookies leak on HTTP. Frontend OIDC in `localStorage` is XSS-complete account theft.

Musts:

- Hosted SaaS: `ALLOW_ANONYMOUS=false`. Anonymous `browser:` is not a product login.
- Keep server-side sessions (flask-session). Do not put password-auth identity in `localStorage` JWTs.
- Cookie: HttpOnly (already true; keep), `Secure` in production, `SameSite=Lax` for the analysis origin. Do not set `SameSite=None` unless a documented cross-site need exists, and then only with `Secure`.
- Short idle timeout plus a hard absolute lifetime. Rotate session id on login, signup, and privilege change.
- Distinct cookie name (and ideally origin) for the billing portal vs the analysis app.
- Production requires `FLASK_SECRET_KEY` from env. Refuse to boot SaaS if it is missing or the per-process random fallback.
- Prefer backend confidential OIDC (cookie, no browser token) for hosted. If frontend PKCE remains, treat `localStorage` tokens as P0 XSS risk; do not add a second token store for password sessions.
- Desktop: session lives against the local backend origin. Do not disable `webSecurity`. Do not persist IdP tokens via Electron `safeStorage` unless a later chunk designs it; Phase A should use the same HttpOnly cookie against localhost.

### P0-3. CSRF on cookie auth

POST session routes (`/api/sessions/*`, future login/signup, share, billing) have no CSRF token. SameSite=Lax blocks many cross-site POSTs from other sites but not same-site siblings, some WebView cases, or a future portal on another subdomain with `None`.

Musts:

- Cookie-authenticated state changes need a CSRF defense: synchronizer token or double-submit cookie, plus Origin/Referer allowlist.
- Login and signup POSTs need the same (login CSRF can fix a session).
- JSON APIs: require `Content-Type: application/json` and reject simple-form POSTs as extra friction, not as the only control.
- Stripe (or other) webhooks must **not** use the CSRF cookie. They use signature verification (P0-5).
- CORS: never `CORS_ORIGIN=*` with credentials. Portal and analysis origins must be explicit allowlists.

### P0-4. IDOR on workspaces (today plus share)

Today list/load/save/delete are scoped by `get_workspace_manager(identity_id)`. Guessing another user's workspace folder does not cross the identity directory. That is not an ACL. It will not survive live share.

Existing hole: `GET /api/sessions/list?source_identity=browser:<uuid>`, `POST /api/sessions/migrate`, and `POST /api/sessions/cleanup-anonymous` let **any** `user:` caller name **any** `browser:` identity. There is no proof the caller owned that UUID. That is IDOR against anonymous data. Phase A migrate must close it, not copy it.

Musts for share (when F-workspace ships, design now so auth does not block it):

- Authorize at the service/query boundary, not only in UI (`security-audit.md` AuthZ).
- Membership table: workspace_id, user_id, role (`owner` | `editor` | `viewer`). Every load/save/delete/table write checks membership.
- Viewer: server rejects save, delete, rename, import, table writes. `readOnly` on the client is not enforcement (`saas-be-expert.md` already notes this).
- Resource ids unguessable (existing `session_...` style is fine if membership is checked; do not rely on secrecy of ids).
- Invite tokens: high entropy, hashed at rest, expiry, revoke.
- Do not accept client `identity_id` or `source_identity` as a trust input.

Musts for `C-auth-browser-migrate`:

- Bind the pre-login `browser:` id to the server session (or a signed cookie) **before** signup/login.
- After auth, migrate only that bound id. Reject a body `source_identity` that does not match the bound value.
- Authenticated callers must not pass an arbitrary `browser:` uuid.

### P0-5. Payment webhooks (portal, not analysis Flask)

No processor exists. `saas-be-expert.md` correctly keeps Stripe out of DuckDB routes. Do not weaken that.

Musts when billing is implemented:

- Separate portal service, same account ids as F-auth.
- Webhook endpoint: raw body, verify `Stripe-Signature` (or vendor equivalent) with the webhook secret from env. Reject missing/invalid signatures.
- Timestamp tolerance to stop replay. Persist processed `event.id` for idempotency.
- Checkout success in the browser is not entitlement. Seats and plan come from verified events (invoice paid, subscription updated/deleted).
- Secret keys never in the renderer or portal JS. Publishable key only in the browser.
- Do not auto-provision admin on webhook without mapping the Datly `user_id` stored in `client_reference_id` / metadata at checkout.
- Fail closed if the signature secret is unset in production.

### P0-6. SQL injection / destructive SQL on the drawer

F-sql is SHAPE: one read-only SELECT (or WITH...SELECT) on already-loaded parquet views. There is no user SQL route yet. Agent helpers concatenate escaped paths into `read_parquet('...')`. A drawer that forwards the analyst string to DuckDB without a parser will allow `ATTACH`, `COPY`, `INSTALL`, `PRAGMA`, writes, and file reads.

Musts (`C-sql-readonly-execute` whenever it ships; do not invent a workbench):

- Parse with a real SQL parser (e.g. sqlglot). Allowlist statement types: `SELECT`, `WITH` that ends in `SELECT`. Deny-list regex alone is not enough.
- Reject: `INSERT` `UPDATE` `DELETE` `MERGE` `CREATE` `DROP` `ALTER` `ATTACH` `DETACH` `COPY` `EXPORT` `IMPORT` `INSTALL` `LOAD` `PRAGMA` `CALL` `SET` `VACUUM` `CHECKPOINT` and multiple statements.
- Bind parameters. Never interpolate user strings into identifiers or paths. Table names must match views created from **already loaded** workspace tables (`sanitize_duckdb_sql_table_name` + membership).
- Do not pass filesystem paths from the client. Views only.
- Prefer DuckDB read-only config if available. New in-memory connection per request. Timeout, row cap, memory cap.
- Guard (F-sql-guard): the runner must not write workspace parquet, vault DB, or the Datly source tree. "Destroy the codebase" in feature-ask means this, not a git product.
- Agent-internal SQL stays on the same allowlist if the drawer reuses `create_duckdb_conn_with_parquet_views`.

### P0-7. Path traversal

Identity and workspace ids are sanitized today. Import zip and a future SQL path argument are the next sinks.

Musts:

- Keep `_IDENTITY_RE` and `secure_filename`. Do not relax them for emails-as-ids; store emails in a column, use opaque user ids on disk.
- After join, `resolve()` and assert the path is inside that user's root (workspace import members included).
- Zip import: reject `..`, absolute paths, and symlink members.
- SQL drawer: no path parameters (see P0-6).
- Scratch upload routes must keep existing caps (`scratch_max_bytes`).

### P0-8. Electron IPC / desktop login

Current IPC surface is small and correct. Phase A login on desktop is the risk: people will want `ipcMain` to hold passwords, open system keychain, or load the IdP in an unsandboxed window.

Musts:

- Do not add `invoke` channels for credentials, filesystem, or cookies.
- Keep `contextIsolation`, `nodeIntegration: false`, `sandbox: true`.
- In-window email/password posts to the local Flask origin only (same as web). No preload involvement.
- OIDC: keep the existing localhost app URL, or use the OS browser + loopback redirect. Do not turn off sandbox to "make SSO work."
- Portal billing: `shell.openExternal` to https portal (already the pattern for new windows). Do not load the portal inside the analysis `BrowserWindow`.
- Do not import `child_process` / `fs` / `remote` in renderer UI (`security-audit.md`).
- Preload remain a static allowlist. Validate any future channel names and payloads.

---

## P1 threats

### P1-1. XSS to session theft

Frontend OIDC stores tokens in `localStorage`. `fetchWithIdentity` logs request headers, including `Authorization`, to the console. Desktop users and support screenshots leak Bearer tokens.

Musts: stop logging auth headers. Prefer cookie session for SaaS. CSP on the hosted app; no `dangerouslySetInnerHTML` for user SQL or share names.

### P1-2. OIDC token validation gaps

If discovery fails and neither JWKS nor UserInfo is set, `oidc.py` logs that validation will be skipped. Backend callback has `state` but no PKCE (confidential client + state is acceptable; still add PKCE if the IdP allows). `OIDC_VERIFY_SSL=false` must never be on in production.

Musts: refuse to enable OIDC in SaaS if validation mode is `NONE`. Keep `state` check. Do not log token bodies (`redact_token` already exists).

### P1-3. `/api/auth/tokens/save`

Client can POST an `access_token` into the session and optionally the vault (`remember`). For SaaS, require an authenticated user and a known `system_id`. Do not let this become a password oracle or a place to stash stolen tokens.

### P1-4. Rate limit and lockout

No login rate limit today. Phase A must throttle signup, login, reset, and OIDC start by IP and by email. Lockout with backoff. Do not lock in a way that enables easy DoS of a victim email without CAPTCHA or exponential delay.

### P1-5. Session fixation / logout

`/api/auth/oidc/logout` clears TokenStore session keys. Password logout must invalidate the server session, not only flip Redux to `browser:`. After required login, that anonymous fallback must not reopen the product.

### P1-6. Portal vs product origin

UI-expert: portal is a different web app. Cross-origin cookies need a deliberate cookie domain (avoid parent-domain cookies). CORS allowlist. Redirects from login to portal must be allowlisted (open redirect).

### P1-7. Share plus billing seats

Seat count from billing must not be the only ACL (a fired employee with a live invite). Revoke membership independently of Stripe. Do not grant `owner` from a URL parameter.

### P1-8. Desktop local-only vs hosted

Do not delete local-only desktop until product says hosted-only. Local mode may keep `local:<os>` without passwords. Hosted web must not fall back to trusting `X-Identity-Id`. Split config: `AUTH_PROVIDER` + `ALLOW_ANONYMOUS` per deploy, not one binary that trusts headers on the public internet.

---

## Musts for Phase A auth chunks

Plan chunks from BE-expert / HANDOFF: `C-auth-keep-oidc-info`, `C-auth-user-store`, `C-auth-browser-migrate`. Do not spawn Stripe, share ACL, or SQL drawer in Phase A. Those inherit the contracts below.

### C-auth-keep-oidc-info

- Keep `/api/auth/info` as the only frontend switch (`frontend` | `backend` | later `password` combined with OIDC).
- Never return `client_secret`, vault keys, or Stripe secrets in this payload.
- Keep PKCE + `crypto.subtle` guard for public clients.
- Hosted default: backend confidential client or password session, not `localStorage` tokens.
- `AuthButton` / login screen may add email/password; do not remove OIDC routes.
- `/auth/callback` stays ungated for the IdP redirect (LanguageScreen already depends on this).

### C-auth-user-store

- New user table on the hosted account plane, not inside DuckDB analysis tables.
- Columns: opaque `user_id`, unique email, Argon2id hash, timestamps, optional OIDC `sub`+issuer unique pair so SSO and password are one person.
- Identity returned to workspaces remains `user:<opaque_id>` so existing partition and `_IDENTITY_RE` keep working. Do not use `user:<email>` (emails can contain characters you currently allow, and they churn).
- Routes: signup, login, logout, session status. Rate limited. CSRF on POSTs. Cookie session as P0-2.
- Required gate after LanguageScreen on hosted web/desktop against the hosted API. Local-only desktop without SaaS backend stays current optional/localhost behavior.
- Password field never round-trips. Responses: public profile only.
- Tests: hash not in logs; anonymous header cannot become `user:`; Secure cookie on HTTPS; CSRF rejection; brute-force throttle.
- Do not add Stripe, seats, or share in this chunk.

### C-auth-browser-migrate

- Close P0-4: migrate only the session-bound anonymous id.
- Drop or ignore client-supplied `source_identity` unless it matches the bound value.
- `cleanup-anonymous` same rule.
- After required login, do not leave a working anonymous API on the hosted deploy.
- Existing tests that pass a raw `source_identity` must be rewritten to the bound-session model; do not keep the IDOR to "not break tests."

---

## What not to do

- Do not put Stripe (or webhook handlers) on analysis Flask DuckDB routes.
- Do not weaken `contextIsolation` / `nodeIntegration` / sandbox to ship desktop login.
- Do not store passwords in the Fernet connector vault.
- Do not treat UI `readOnly` as authorization.
- Do not enable `ALLOW_ANONYMOUS` on the public SaaS origin.
- Do not ship a SQL drawer that `conn.execute(user_sql)` against a read-write DuckDB or the host filesystem.

---

## Audit checklist (Phase A gate)

Map to `security-audit.md`. Phase A is not Done until:

- [ ] Secrets: password hashes only; `FLASK_SECRET_KEY` required; no secrets in `/api/auth/info`
- [ ] Input validation: email normalize; password length; identity regex unchanged
- [ ] AuthZ: no arbitrary `source_identity`; workspace mgr still identity-scoped
- [ ] Cookies: HttpOnly, Secure (prod), SameSite, CSRF on POSTs
- [ ] Electron: no new privileged IPC
- [ ] SQL / billing: out of Phase A; contracts above are the later gate

Hard stop: do not mark F-auth Done if anonymous header auth still works on the hosted origin, if passwords are reversible, or if migrate still accepts any `browser:` uuid.
