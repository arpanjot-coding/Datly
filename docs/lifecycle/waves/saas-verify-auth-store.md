# Independent verify: C-auth-user-store

Slice: `C-auth-user-store` in `docs/lifecycle/work-packages/F-saas-W.md`. Security gate: `docs/lifecycle/waves/saas-security.md` P0-1. Writer sidecar `docs/test-runs/.worker-done/C-auth-user-store.md` (`done: true`). Verifier did not write the slice. Static read of source only. Pytest not re-run. No Accept.

Named F-saas-W acceptance: POST signup creates user. POST login sets server session. Hash is Argon2id. Unknown email and wrong password share status. Goal also: unique email, rate limit, no password in logs, opaque `user:<id>`, do not reuse Fernet vault.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 POST signup creates user | pass | Matches F-saas-W acceptance. | `POST /api/auth/password/signup` (`password_auth.py` 56-77) calls `create_user`, inserts sqlite row (`user_store.py` 70-91), returns `json_ok` with `identity` `user:<hex>` and normalized email. Test `test_signup_and_login` asserts 200, `ada@example.com`, `user:` prefix (`test_password_auth.py` 39-51). Blueprint registered in `app.py` 297-298. | n/a |
| A2 POST login sets server session | pass | Matches F-saas-W acceptance. | Login (`password_auth.py` 80-94) `session.clear()` then `session["df_password_user_id"] = user.user_id`. Signup does the same (73-75). Test asserts session key after signup (50-51). `get_identity_id` reads that key first and returns `user:{id}` (`identity.py` 178-186). Login test checks 200 and email, not session again; code path is the same setter. | n/a |
| A3 Hash is Argon2id | pass | Matches F-saas-W acceptance and P0-1 preferred algorithm. | `from argon2 import PasswordHasher`; `_hasher = PasswordHasher()` (`user_store.py` 16, 21). argon2-cffi `PasswordHasher.__init__` default `type: Type = Type.ID` (`Lib/site-packages/argon2/_password_hasher.py` 102). Dep in `pyproject.toml` 66 and `requirements.txt`. `create_user` stores `_hasher.hash(password)` only. Test `test_hash_not_plaintext` asserts plaintext absent from `accounts/users.sqlite` bytes, not `$argon2id$` prefix. | n/a |
| A4 Unknown email and wrong password share status | pass | Matches F-saas-W acceptance and P0-1 enumeration. | Login always `_LOGIN_FAIL = "Invalid email or password."` with `ErrorCode.AUTH_REQUIRED` (401) for missing types, unknown email, and wrong password (`password_auth.py` 24, 86-90). `verify_login` returns `None` for both miss and mismatch (`user_store.py` 94-117). Test `test_login_same_error_unknown_and_wrong` asserts same status, envelope status, code, and message (`test_password_auth.py` 62-80). | n/a |
| G1 Unique normalized email | pass | Matches F-saas-W goal and P0-1. | `normalize_email` trim+lower (`user_store.py` 58-59). Table `email TEXT NOT NULL UNIQUE` (49). Duplicate raises `email_taken`; route returns generic "Could not create account." (`password_auth.py` 68-69). Signup test sends `"  Ada@Example.COM "` and expects `ada@example.com`. `test_duplicate_email_generic` covers taken case. | n/a |
| G2 Rate limit | pass | Matches F-saas-W goal. In-memory IP window only. | `_rate_limit` on signup and login: 10 hits / 60s keyed by `X-Forwarded-For` first hop or `remote_addr` (`password_auth.py` 26-45, 58, 82). Not keyed by email. Not durable. No test. P1-4 (IP and email, lockout backoff) is a later must, not this acceptance line. | n/a |
| G3 No password in logs or responses | pass | Matches F-saas-W goal and P0-1 placement. | Routes never log email, password, or hash. Signup logs `user_id` 8 chars only (`password_auth.py` 76). Responses are `identity` and `email`. Session stores `df_password_user_id` only. Test asserts `"password" not in json.dumps(payload)`. No test that captures log records. | n/a |
| G4 Do not reuse Fernet vault | pass | Matches F-saas-W goal and P0-1 last must. | Store is sqlite + Argon2id under `get_data_formulator_home()/accounts/users.sqlite` (`user_store.py` 36-55). Module comment forbids Fernet vault. No import of `LocalCredentialVault` or `Fernet` under `auth/user_store.py` or `routes/password_auth.py`. Vault remains connector secrets (`auth/vault/local_vault.py`). | n/a |
| G5 Opaque `user:<id>` not email | pass | Matches F-saas-W goal and security chunk identity rule. | `user_id = uuid.uuid4().hex` (`user_store.py` 77). Identity `f"user:{user.user_id}"` (`password_auth.py` 77, 94). Hex matches `_IDENTITY_RE`. Header spoof path still prefixes `browser:` (`identity.py` 214-224). Existing `test_client_cannot_spoof_user_prefix` in `test_auth.py` 97-104 is pre-slice and does not cover a password session. | n/a |
| P01-slow-hash | pass | Matches P0-1: Argon2id, never plaintext / reversible / SHA-only. | Hash via `PasswordHasher.hash`; verify via `PasswordHasher.verify`. No SHA/MD5/HMAC-only, no Fernet on this table. | n/a |
| P01-salt | pass | Matches P0-1 library-default salt per row. | Default `PasswordHasher` generates a random salt per `hash()` call (argon2-cffi docs in `_password_hasher.py` 42-43, `salt_len=DEFAULT_RANDOM_SALT_LENGTH`). | n/a |
| P01-pepper | pass | Matches P0-1 optional pepper. Optional, not required. | `PASSWORD_PEPPER` is named only in `saas-security.md`. Not in repo env or code. Absence is allowed. | n/a |
| P01-no-secrets-in-session | pass | Matches P0-1: no password, hash, or pepper in session, JWT, logs, or API. | Flask session key is opaque user id. No password JWT. `StoredUser` dataclass is `user_id` + `email` only (`user_store.py` 30-34). | n/a |
| P01-log-sanitizer | pass | Matches P0-1 keep redaction; no debug signup bodies. | `log_sanitizer.py` still lists `"password"` in `SENSITIVE_KEYS` (39). `app.py` still attaches `SensitiveDataFilter` (207-210, 189). Password routes have no `logger.debug` of `body`. | n/a |
| P01-compare | pass | Matches P0-1 constant-time via hash library, not `==`. | `verify_login` uses `_hasher.verify` and catches `VerifyMismatchError` (`user_store.py` 110-117). Dummy hash path still uses `verify`, then returns `None` if `row is None` (111-112), so a guess equal to the dummy secret cannot log in. Extra: every login also `_hasher.hash("dummy-password-for-timing")` (107), a second Argon2id (cost, not a `==` bug). | n/a |
| P01-policy | pass | Matches P0-1 length 12+ plus common-password block. | `validate_password` rejects non-str or `len < 12` and a small `_COMMON_PASSWORDS` set (`user_store.py` 24-27, 62-67). Test `test_short_password_rejected`. Common-password failure is mapped to the 12-character message (`password_auth.py` 70-71). Blocklist is tiny (about 8 strings), not a dictionary file. | n/a |
| P01-reset | fail | Missing vs P0-1 must: reset tokens random, hashed at rest, single-use, short TTL; do not email the current password. F-saas-W chunk text does not name reset. | Grep of `py-src/data_formulator` auth tree for `reset` is empty. No token table, no reset route, no email of the current password either. | Add a reset-token table (high entropy, hashed, single-use, short TTL) and routes that never return or email the password. If product defers reset, the security plan must drop that must from this chunk. |
| X1 Stripe / share / SQL | pass | Matches F-saas-W and security "do not add Stripe, seats, or share in this chunk." | Delivered files are user store, password routes, identity session hook, app blueprint, argon2 dep, tests. No Stripe, membership, or `execute_sql`. | n/a |

## Missing / wrong / extra

- Missing vs named F-saas-W acceptance: none.
- Missing vs P0-1: password reset tokens (P01-reset).
- Missing vs the same security doc's `C-auth-user-store` block (not P0-1, not F-saas-W acceptance; CSRF/session live in `C-auth-session`): session status route; CSRF on POSTs; optional OIDC `sub`+issuer unique pair; tests for hash-not-in-logs, anonymous header cannot become `user:` under a password session, Secure cookie on HTTPS, CSRF rejection, brute-force throttle.
- Wrong: none on the named acceptance lines. Login unknown vs wrong is aligned. Common-password errors reuse the short-password sentence.
- Extra vs this slice: `POST /api/auth/password/logout`; JSON Content-Type require; identity.py password session first in `get_identity_id`; argon2-cffi pin. Logout is listed in the security chunk route list, so it is in-scope extra, not scope creep.

## Residual (not a fail of A1-A4)

- Rate limit is process-local, IP only, and trusts `X-Forwarded-For`.
- Dummy Argon2id hash on every login doubles CPU.
- `get_identity_id` trusts `df_password_user_id` without a user-row lookup.
- Logout pops the password key only (`session.pop`), does not `session.clear()`.
- Cookie Secure, idle timeout, `FLASK_SECRET_KEY` refuse, CSRF: `C-auth-session` (`password_auth.py` 3-4).
- Tests were not re-executed here. Writer sidecar claims `test_password_auth.py` plus `test_auth.py`, 22 passed.

## Slice outcome

F-saas-W named acceptance A1-A4 pass in source. P0-1 password store musts pass except reset tokens (P01-reset fail). Goal items unique email, Argon2id, opaque id, rate limit, no Fernet, no password in responses pass.

Verifier did not Accept. Manager decides.
