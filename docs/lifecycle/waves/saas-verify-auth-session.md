# Independent verify: C-auth-session

Slice: `C-auth-session` in `docs/lifecycle/work-packages/F-saas-W.md`. Security gate: `docs/lifecycle/waves/saas-security.md` P0-2 and P0-3. Writer sidecar `docs/test-runs/.worker-done/C-auth-session.md` (`done: true`). Verifier did not write the slice. Static read of source only. Pytest not re-run. No Accept.

Named F-saas-W acceptance: Session cookie HttpOnly. CSRF required on signup/login POST. Anonymous browser id not a product login when hosted. Goal also: short session, Secure in prod, rotate on login, hosted `ALLOW_ANONYMOUS=false`, CSRF on cookie POSTs, production refuses missing `FLASK_SECRET_KEY`.

Live code is `app.py` plus `routes/password_auth.py`. `auth/session_policy.py` and `auth/csrf.py` exist and are not imported.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 Session cookie HttpOnly | pass | Matches F-saas-W acceptance and P0-2 keep HttpOnly. | `app.config['SESSION_COOKIE_HTTPONLY'] = True` (`app.py` 56). SameSite Lax (57). Test `test_session_cookie_httponly` (`test_flask_session_config.py` 43-45). flask-session still filesystem cachelib with `SESSION_USE_SIGNER=True` (70-81). | n/a |
| A2 CSRF required on signup/login POST | pass | Matches F-saas-W acceptance and P0-3 login/signup must. | `GET /api/auth/password/csrf` issues `session["df_csrf"]` (`password_auth.py` 49-65). Signup, login, logout call `_require_csrf` before body (80, 106, 124). Missing or mismatch raises `AppError(ErrorCode.ACCESS_DENIED, ...)` (56-60). Test `test_signup_without_csrf_denied` asserts envelope `ACCESS_DENIED` (127-134). No test for login or logout missing CSRF; same helper. | n/a |
| A3 Anonymous browser id not a product login when hosted | pass | Matches F-saas-W acceptance and P0-2 first must. Hosted signal in this slice is `ALLOW_ANONYMOUS=false`. | `init_auth` sets `_allow_anonymous` from env (`identity.py` 101-104). Anonymous `X-Identity-Id` path runs only if `_allow_anonymous` (214-228). Else `ValueError("Authentication required. Please log in.")` (230). Password session is checked first (178-186). Loopback still yields `local:<os>` before that raise (209-211). That is desktop local mode (P1-8), not `browser:`. | n/a |
| G1 Short session lifetime | pass | Matches F-saas-W goal "short" as 12h absolute when hosted flag is on. Not idle. | `PERMANENT_SESSION_LIFETIME` is `60 * 60 * 12` when `ALLOW_ANONYMOUS` is false, else 365 days (`app.py` 48, 55). Default env still 365 days. Test `test_permanent_session_lifetime_is_one_year` only covers the default (`test_flask_session_config.py` 39-41). Writer sidecar notes the same. | n/a |
| G2 Secure in prod | pass | Matches F-saas-W goal and P0-2 Secure in production. Prod switch is `ALLOW_ANONYMOUS=false`, not HTTPS sniff. | `SESSION_COOKIE_SECURE = (not _allow_anonymous_boot)` (`app.py` 58). No test. Unused `session_policy.session_cookie_secure` would use `DATLY_HOSTED` and loopback (`session_policy.py` 70-76) and is not applied. | n/a |
| G3 Rotate session id on login | fail | Missing vs F-saas-W goal "rotate on login" and P0-2 rotate session id on login, signup, and privilege change. | Signup/login `session.clear()` then set `df_password_user_id` (`password_auth.py` 95-97, 115-117). That empties keys. flask-session keeps the same server-side `sid` cookie unless `regenerate` runs. `rotate_session()` in `session_policy.py` 113-128 would call `session_interface.regenerate` and is never imported. Logout only `session.pop` (125). | Call a real sid regenerate on signup, login, and logout (wire `rotate_session` or flask-session `regenerate`), then stamp the new password keys. Add a test that the session cookie value changes. |
| G4 Hosted ALLOW_ANONYMOUS=false | pass | Matches F-saas-W goal as operator config, not a code default. | Default remains `"true"` (`app.py` 48, `identity.py` 102-103). Cookie Secure, 12h TTL, and secret refuse all key off false. Hosted deploy must set the env. That is the chunk contract. | n/a |
| G5 CSRF on cookie POSTs | fail | Missing vs F-saas-W goal "CSRF on cookie POSTs" and P0-3 cookie-authenticated state changes. Named A2 only covers password signup/login. | CSRF helper is local to `password_auth.py`. Grep of `X-CSRF` / `require_csrf` under `py-src` hits only that file and unused `auth/csrf.py`. `/api/sessions/*` POSTs (`sessions.py` save/load/delete/create/rename/import/migrate) have no CSRF. Password reset POSTs (`password_reset.py` 57-68) have none. | Apply one CSRF helper (token + Origin) to every cookie-authenticated mutating route. Leave signed webhooks out. |
| G6 Production refuses missing FLASK_SECRET_KEY | pass | Matches F-saas-W goal. P0-2 "production" is implemented as `ALLOW_ANONYMOUS=false`. | `if not _allow_anonymous_boot and not _flask_secret: raise RuntimeError(...)` (`app.py` 49-50). Else `secrets.token_hex(16)` fallback (51). `test_falls_back_to_random_when_env_missing` still expects fallback on default anonymous (`test_flask_session_config.py` 30-34). No test that the RuntimeError fires. Unused `resolve_secret_key` keys off `DATLY_HOSTED` (`session_policy.py` 79-91) and is not called. | n/a |
| P02-server-session | pass | Matches P0-2: flask-session, no password identity JWT in localStorage. | Identity is `session["df_password_user_id"]` only. Routes do not issue a password JWT. Frontend OIDC `localStorage` store in `oidcConfig.ts` is pre-slice. | n/a |
| P02-samesite | pass | Matches P0-2 SameSite=Lax. Not None. | `SESSION_COOKIE_SAMESITE = 'Lax'` (`app.py` 57). Test 47-49. | n/a |
| P02-idle-absolute | fail | Missing vs P0-2 short idle timeout plus hard absolute lifetime. 12h cookie max-age is absolute only. | No `before_request` idle check in `app.py`. `enforce_password_session_ttl` (30 min idle + 12h absolute when `is_hosted()`) lives in unused `session_policy.py` 139-162 and is never registered. | Register idle + absolute TTL on password sessions. Wire the hosted flag the same way as `ALLOW_ANONYMOUS=false`. Test expiry. |
| P02-cookie-name | pass | P0-2 distinct billing vs analysis cookie. Billing portal is not this slice. | Cookie name stays Flask default `session`. Unused policy would set `df_session` (`session_policy.py` 22, 100). Not a fail until a portal origin exists. | n/a |
| P02-oidc-localStorage | pass | P0-2 prefer cookie session for password. Do not add a second token store. | No password token store added. Existing frontend OIDC `WebStorageStateStore` remains a P0 XSS residual, not this slice. | n/a |
| P02-desktop | pass | P0-2 no Electron cookie/password IPC in this slice. | Writer files are Flask only. No preload/main.cjs change in the sidecar. | n/a |
| P03-synchronizer | pass | Matches P0-3 synchronizer token (or double-submit). | Session token compared to `X-CSRF-Token` with `secrets.compare_digest` (`password_auth.py` 56-60). GET issues a new token each call. Login/signup `session.clear()` then re-issue. | n/a |
| P03-origin | fail | Missing vs P0-3 Origin/Referer allowlist on the live CSRF check. | Live `_require_csrf` only compares the header to `df_csrf`. Unused `auth/csrf.py` `origin_allowed` / `CSRF_TRUSTED_ORIGINS` (49-97) is never imported. Same-site sibling POSTs with a stolen or same-cookie token are not origin-checked. | Check Origin (else Referer) against an explicit allowlist inside the live `_require_csrf`. Fail closed when both are missing outside tests. |
| P03-json | pass | Matches P0-3 JSON Content-Type as extra friction, not the only control. | `_require_json` rejects non-JSON (`password_auth.py` 68-74) after CSRF. | n/a |
| P03-webhooks | pass | Matches P0-3 Stripe webhooks must not use the CSRF cookie. | No Stripe webhook route. Password CSRF is not attached globally. | n/a |
| P03-cors | pass | Matches P0-3 never `CORS_ORIGIN=*` with credentials. | `security/cors.py` refuses `*` plus `Access-Control-Allow-Credentials` (34-41). `agents.py` 176-181 and `demo_stream.py` 40-45 can still echo `CORS_ORIGIN` including `*`, without a credentials header. | n/a |

## Missing / wrong / extra

- Missing vs named F-saas-W acceptance A1-A3: none.
- Missing vs F-saas-W goal: session id rotate (G3); CSRF on non-password cookie POSTs (G5).
- Missing vs P0-2: idle timeout (P02-idle-absolute); session id rotate (G3).
- Missing vs P0-3: Origin/Referer allowlist (P03-origin); CSRF on `/api/sessions/*` and other cookie POSTs (G5).
- Wrong: none on A1-A3. Hosted/prod switch is `ALLOW_ANONYMOUS=false`, not unused `DATLY_HOSTED`.
- Extra vs this slice: unused `auth/session_policy.py` and unused `auth/csrf.py` (different session key `df_csrf_token`, Origin check, `DATLY_HOSTED`). Dead policy must not be treated as shipped. Logout CSRF is in-scope extra.

## Residual (not a fail of A1-A3)

- Default `ALLOW_ANONYMOUS` is still true. Hosted must set false.
- Unauthenticated `get_identity_id` raises `ValueError`; session routes do not map that to `AUTH_REQUIRED`. Likely HTTP 500, still not a `browser:` login.
- Logout does not `session.clear()` or regenerate sid (P1-5).
- CSRF tests cover signup missing token only, not login, logout, wrong token, or Origin.
- No test for RuntimeError on missing secret when `ALLOW_ANONYMOUS=false`, or for Secure / 12h in that mode.
- `agents.py` still documents `CORS_ORIGIN=*` for embed.
- Tests were not re-executed here. Writer sidecar claims password auth tests pass including CSRF denied.

## Slice outcome

F-saas-W named acceptance A1-A3 pass in source. Goal rotate (G3) and CSRF on all cookie POSTs (G5) fail. P0-2 idle timeout fails. P0-3 Origin/Referer fails. Unused `session_policy.py` / `csrf.py` are not live.

Verifier did not Accept. Manager decides.
