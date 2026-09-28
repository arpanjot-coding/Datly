# Work package - Datly professional SaaS

- **Status:** ACCEPTED
- **Kind:** W
- **Features:** F-auth, F-workspace, F-billing, F-data-acl, F-sql, F-sql-guard, F-context-graph
- **Session focus:** web, desktop
- **Ship:** web, desktop
- **Source:** DISPATCH-FALLBACK 2026-08-20 after [plan] stall. Merged saas-ui-expert, saas-be-expert, saas-security. User lock D-saas-full.
- **Lane:** BUILD

## Ask / out of scope

Build Datly as professional SaaS: required accounts, live shared workspaces, a separate billing portal, read/write ACL, guarded SQL analysis, later context graph.

**Out of scope this run**
- SQL as the home screen (SHAPE: drawer)
- A second analysis app on the portal
- Paywall before LanguageScreen
- Deleting local/offline desktop this run
- Context graph is Phase F P1, not Phase A

## Meaning

A professional can sign up, sign in, share a workspace with roles, pay as an individual or run an enterprise seat list, run safe SQL on loaded tables, and keep the analysis canvas as Datly.

## Verdict

**FIT** after user yes (D-saas-full). SHAPE: SQL drawer not home; portal not a second Datly; language first.

## Place / grain

| Job | Place |
|-----|-------|
| Auth | Product login/signup screens + AuthButton. Gate after LanguageScreen. |
| Workspace history | Sessions sidebar + WorkspaceMenu |
| Share | Sheet from Sessions, not a new app |
| Billing | New web-only portal (individual vs admin nav) |
| SQL | Drawer on current tables |
| ACL | Server membership, not UI-only readOnly |

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-auth-screens | Login/signup states |
| section-grain | C-auth-screens | Auth is not a second today dashboard |
| phone-chrome | n/a | android/ios not in ship set |
| web-layout | C-auth-screens | Dual width login |
| desktop-chrome | C-auth-screens | Desktop login no-drag, keyboard |
| first-run | C-auth-gate | Language then auth. Never paywall first |
| value-slide | n/a | No value slides this run |
| app-polish | n/a | Icons/legal not this package |
| notifications | n/a | No reminders |
| i18n | C-auth-screens | t() on auth copy |
| hardware-back | n/a | No android |

## Chunks (Phase A first)

| ID | Goal | Depends | Acceptance | Likely files |
|----|------|---------|------------|--------------|
| C-auth-user-store | First-party users: unique email, Argon2id hashes, opaque `user:<id>`. Signup and login APIs. Rate limit. Same body for bad email vs bad password. No password in logs. Do not reuse Fernet vault. | - | POST signup creates user. POST login sets server session. Hash is Argon2id. Unknown email and wrong password share status. | `py-src/data_formulator/auth/` new user store; Flask routes |
| C-auth-session | Short HttpOnly session, Secure in prod, rotate on login. Hosted `ALLOW_ANONYMOUS=false`. CSRF on cookie POSTs. Production refuses missing FLASK_SECRET_KEY. | C-auth-user-store | Session cookie HttpOnly. CSRF required on signup/login POST. Anonymous browser id not a product login when hosted. | `py-src/data_formulator/app.py`, session config |
| C-auth-migrate | Bind pre-login `browser:` id in session. After auth migrate only that id. Close list/migrate IDOR on arbitrary source_identity. | C-auth-session | Authenticated caller cannot migrate another browser uuid. | `py-src/data_formulator/routes/sessions.py` |
| C-auth-screens | Twin login/signup screens. AuthButton account menu + logout. Desktop no-drag on fields. t() copy. | C-auth-session | User can create an account and sign in from the product. Empty/error states honest. | `src/views/auth/`, `src/app/AuthButton.tsx` |
| C-auth-gate | After LanguageScreen, require session for product (hosted). `/auth/callback` ungated. | C-auth-screens | New hosted user sees language, then login, then app. | `src/app/App.tsx` |

Later phases (B-F) live in `docs/plans/saas-2026-08-20.md`. Do not start B until Phase A chunks Accepted.

## Proof

- Phase A S9: wf + ui-vis + connect + arch-fit + security
- Flags: shipsNotifications false. writesOutput false. siblingFamily false.
- F-auth is sensitive: security must not stay open at gate.

## User questions

None. ASK cleared.
