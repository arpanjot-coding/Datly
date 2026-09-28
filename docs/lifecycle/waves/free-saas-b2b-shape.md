# Arch-expert: B2B vs free SaaS (this ship)

Role: `[arch-expert]`. Feature: F-billing check against F-auth / F-workspace. Report only. No product edits.  
Ask: SaaS login, no payment, no hire team, make the product really good and free.  
Refs: `docs/lifecycle/feature-ask.md`, `docs/lifecycle/work-packages/F-billing-W.md`, `src/app/App.tsx` (`loginRequired`), `src/app/identity.ts`, `py-src/data_formulator/auth/identity.py`, `py-src/data_formulator/workspace_factory.py`. Datly-Web cited from existing billing verifies, not re-opened as a product.

No em dashes.

---

## Verdict

**SHAPE D-free-saas**

This ship is login + workspaces + history. Companies use the same free `user:` account as individuals. Do not put Stripe, seats, hire-team, or portal billing on the product journey. Do not wire Datly-Web into Datly chrome. Leave Datly-Web files on disk unused.

Not UNFIT: a company can already sign in and keep private projects. Not ASK: the user already named the model (free SaaS, no pay, no hire team). Not D-saas-full: that lock from F-saas-W / `docs/plans/saas-2026-08-20.md` Phase D (portal, seats, org billing) is superseded for this beat. Do not resume C-bill-admin, C-bill-stripe, or C-share-acl.

---

## 1. What B2B pieces exist today

Three layers. Only the first is in the analysis product.

### 1.1 Analysis product (Datly)

| Piece | State | Where |
|-------|--------|--------|
| Required login | Live | `App.tsx` `loginRequired = identity.type !== 'user'` then `<Navigate to="/login" />`. Language overlay stays outside this gate. `/login` and `/signup` are sibling routes. |
| Identity | User only | `IdentityType = 'user' \| 'browser' \| 'local'`. No `org`. Password and OIDC mint `user:<id>`. Storage key is `type:id`. Flask namespaces disk under that key. |
| Workspaces | Live, one identity | `workspace_factory.get_workspace_manager(identity_id)` roots at `users/<safe_id>/workspaces/`. List/save/load/rename/delete. Header `WorkspaceMenu` plus Sessions sidebar. History exists; this ship only promotes it. |
| Account menu | Sign out, no billing | `AuthButton.tsx`: authenticated menu is name + sign-out. No Manage subscription, Admin, seats, or portal link. |
| Hire team / share | File on disk, not in chrome | `src/views/ShareSheet.tsx` exists. Nothing in `src/` imports it. Local MVP hid Share. Keep it unmounted. |
| Payment | Absent | No paywall, plan picker, or invoice UI in `src/`. Flask has no checkout. `py-src/data_formulator/auth/csrf.py` mentions webhooks only as a comment that they are not in this app. |
| Org billing | Absent | No org table, seat ledger, or membership ACL in Flask. Isolation is one identity's `WorkspaceManager`. |

### 1.2 Datly-Web portal (sibling folder, unused this ship)

F-billing-W locked **D-portal-separate**. Scaffold, shell, usage/plan, and admin stubs landed under `D:\Coding\Main\Datly - Web` (Vite + MUI, not the analysis app):

| Chunk | What is on disk | Product journey |
|-------|-----------------|-----------------|
| C-bill-scaffold | Vite React MUI cicada tokens, router | Unused |
| C-bill-shell | Role nav: individual Usage/Plan vs admin Users/Billing. Stub role is `localStorage` / `?role=`, not Datly session | Unused |
| C-bill-usage | Usage meters + plan page stubs | Unused |
| C-bill-admin | Seats invite/remove + org billing page stubs | Unused |
| C-bill-stripe | Never built | Stay unbuilt |

Portal login is a stub, not `user:<id>`. Stripe checkout and signed webhooks were deferred and must stay deferred. Do not copy portal routes into Datly. Do not open the sibling from `AuthButton`. Do not delete the folder this beat unless a later cleanup job says so.

### 1.3 Docs that still describe paid B2B

`F-saas-W.md` meaning still says share, pay, enterprise seats. `docs/plans/saas-2026-08-20.md` Phase D still says a separate billing service, seats, org billing. `F-billing-W.md` is ACCEPTED for a portal that this ship will not ship. Treat those as leftover D-saas-full paper. The live ask is `feature-ask.md` job 3: B2B check without pay or hire team.

---

## 2. What a company can already do with free login

Same account plane. No second product.

After LanguageScreen, a person signs up or signs in. Chrome opens only when `identity.type === 'user'`. That account owns:

- A private workspace list (create, open, rename, delete).
- Session state, tables, charts, Knowledge, Distill, Play, SQL overlay.
- Identity-scoped disk. Colleague B with a different email cannot see colleague A's workspaces.

A company of N people can use Datly today by giving each person their own free login. They work in parallel. They do not get shared seats, an org admin, an invite list, or a company invoice. That is the honest B2B story for this ship: many free users, not one org tenant.

Do not fake "team" by stamping `readOnly` or mounting ShareSheet. Load already has a `readOnly` hook from workspace meta; that is not a hire-team product.

---

## 3. This ship: SHAPE D-free-saas

| In | Out of the journey |
|----|--------------------|
| Language first | Paywall, plan wall, Stripe, any processor |
| Login required (`user`) | Hire team, seats, invite, ShareSheet in chrome |
| Workspaces on that account | Org billing, portal Admin/Users |
| History as a first-class section | Datly-Web as a second app or account menu link |
| New project starts a fresh chat | Live share / F-data-acl |
| Distill + Play stay | SQL as home, KNIME, Spark |
| SQL stays a drawer | Org identity |

Grain: F-workspace work is landing + Sessions (`DataFormulator`, `WorkspaceMenu`, `DataSourceSidebar`). F-billing this ship is **no UI**. F-auth is regression only.

Prior lock D-portal-separate still means: if billing ever returns, it is not inside the canvas. It does not mean ship or link the portal now.

---

## 4. Must not break

These seams are already shipped. History work must leave them alone.

| Seam | Contract | Files |
|------|----------|--------|
| Login gate | `loginRequired = identity.type !== 'user'`. No `IS_LOCAL_MODE` skip. `browser` and `local` bounce to `/login`. | `src/app/App.tsx` ~208, 262-266 |
| Identity namespace | `user:<id>` after password or OIDC. Header `X-Identity-Id`. Flask must not trust a client `user:` spoof. | `src/app/identity.ts`, `src/app/utils.tsx`, `py-src/data_formulator/auth/identity.py` |
| Distill | Session distill from Knowledge: chat-first CTA, `SessionDistillDialog`, workspace-bound workflow. | `src/views/KnowledgePanel.tsx`, `src/views/SessionDistill.tsx` |
| Play | Replay distilled workflow from Knowledge (tables or connector). | `KnowledgePanel.tsx` Play affordance + workflow replay |
| SQL drawer | Overlay on the island while a session is open. Not a route, not home. Guard stays SELECT-only. | `src/components/IslandHeader.tsx` mounts `SqlDrawer`; `src/views/SqlDrawer.tsx`; `py-src/data_formulator/sql_guard.py` |

If history needs a new landing section, keep Distill/Play on the in-session Knowledge path and keep SQL on `inSession`. Do not add an org switcher that would change `identity.type` away from `user`.

---

## 5. Residual (later, not now)

Paid B2B, if ever asked again, is a new identity model, not a CSS pass on Datly-Web.

Today one key (`user:<id>`) owns workspaces. Seats and org invoices need at least:

- An `org:` (or membership) identity separate from the person.
- Server membership, not UI-only `readOnly`.
- A billing ledger outside Flask DuckDB routes.

Do not build that now. Do not invent a processor. Datly-Web stubs are not a tenant. When that job returns, start with org identity and ACL, then decide a portal. Until then, unused sibling files are cheaper than a half-wired Admin nav in the analysis app.

---

## 6. Plan fill (for W-plan)

- Lock **D-free-saas**. Record that D-saas-full Phase C/D (share, portal pay) are deferred with reason: user said no payment, no hire team.
- F-billing this ship: no chunks. Do not spawn C-bill-*.
- F-workspace: history section + new project + new chat only.
- F-auth / F-workflow-db: regression; do not reopen store, CSRF, or SQL guard.
- Datly-Web: keep on disk, unused, not a second chart app.
