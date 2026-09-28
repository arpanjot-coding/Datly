# UI-expert: F-workspace, F-auth, F-billing (UI only)

Role: ui-expert. Session: web + desktop. Portal is web. Product chrome is existing Datly.  
Ship: web, desktop. Do not implement. Do not plan SQL or graph. Do not invent a second analysis app.

Refs read: `src/views/WorkspaceMenu.tsx`, `src/app/AuthButton.tsx`, `docs/lifecycle/feature-ask.md` (current top), `ui-craft.md`, `web-react-ui.md`, `onboarding.md`.

Craft laws applied: one system, workflow first, P0 states, one primary CTA, surface honesty (web + desktop product; portal web only), twin-screen family for login/signup and portal admin vs individual. First-run stays language first. Do not put billing before language.

---

## Cross-job frame

Today Datly is a local-first analysis app. Workspaces are disk sessions you switch in chrome. Auth is optional OIDC in the AppBar. There is no account signup product, no share/members UI, no billing UI, no admin portal.

These three jobs are a product-model change (personal disk + optional SSO → accounts, shared workspaces, paid seats). UI must not hide that by stuffing new IA into the chart canvas.

| Surface | Role |
|---------|------|
| Existing Datly (web renderer + desktop) | Analysis product. Login/logout chrome. Workspace switch + (later) share entry. |
| New web portal | Enterprise admin (users, billing) and individual subscription. Slightly different shells. Not an analysis app. |
| First-run | Language picker first (`onboarding.md`). Value/setup after. Never paywall or billing before locale persist. |

Hard stops for UI:

- Do not add a second SQL/grid/chart app on the portal.
- Do not replace Sessions with a SaaS console inside the allotment.
- Do not delete local-only desktop until product says hosted-only.
- Portal P0 proof is web 375 + 1280. Product auth/workspace P0 is web dual-width plus desktop chrome (titlebar, keyboard).

---

## Job 1. Workspace history + shareable collab (F-workspace)

### Meaning

An analyst reopens past work and can share a workspace with collaborators.

Two jobs glued together:

1. **History:** find and reopen a prior workspace (name, when saved, open, delete, maybe rename).
2. **Share:** invite people, see members, set access, open a workspace someone else owns.

History is a list job. Share is a multi-user job. They are not the same screen.

### Place

Live chrome today (`WorkspaceMenu.tsx`):

- Compact AppBar / island switcher. Hidden when `!activeWorkspace`.
- Menu: New session, then a 280px list of `{id, display_name, saved_at}` with relative time, active check, two-step delete.
- Open saves current state then `loadWorkspace`. Create is `resetState()`. No search, no rename, no share, no members, no activity timeline, no “shared with me”.
- Feature-ask already maps the full open/rename/delete list to the sidebar **Sessions** tab. Header menu is the compact switcher, not the history home.

New / extended places (honest):

| Place | New? | Why |
|-------|------|-----|
| Sessions sidebar list | extend | Best home for history (empty, loading, error, search if the list grows). |
| `WorkspaceMenu` | extend | Stay a switcher. Optional “Shared” section or a Share action on the active workspace. Do not become a collab console. |
| Share sheet / members dialog | **yes** | Invite link or email, role, revoke. Overlay from Sessions or the switcher. |
| Shared-with-me / pending invite | **yes** | New list filter or section. Changes IA: workspaces are no longer only “mine on this machine”. |
| Dedicated history route | no (avoid) | Do not invent a second app. History stays in product chrome. |

Shared workspaces change IA. Local disk sessions are single-owner. Collab implies identity (Job 2), a host, and conflict/read-only UI. `activeWorkspace.readOnly` already exists on load. That is a hook, not a share product.

### Approach

- Keep two chrome pieces: header switcher + Sessions list. Twin-screen: same row language (name, relative time, active check, delete confirm).
- History SHAPE: richer Sessions (empty “No sessions yet”, loading already exists in the menu, error toast today is not enough on a full list, search when count is large). Optional last-opened grouping. Keyboard: arrow list, Enter open, Delete confirm.
- Share ASK: new sheet. One primary CTA “Share” or “Copy link”. Secondary: role select, revoke. States: default, empty members, loading, error, success toast. Guest / unsigned user hits Job 2, not a fake share.
- Desktop: share sheet keyboard + focus trap; titlebar drag rules unchanged (`df-no-drag` already on the switcher).
- Web: menu already `maxWidth: calc(100vw - 24px)`. Share sheet must work at 375 (full-screen sheet) and 1280 (dialog).
- Do not add Cicada-style Share/Publish marketing chrome. Do not put member admin on the portal as the only share path (portal can list seats; the analysis workspace is where you share a session).

### Verdict draft

**ASK**

History alone would be **SHAPE** on Sessions + `WorkspaceMenu`. Shareable collab is a new place and a product-model change. Combined job is ASK. Hard stop if share meaning (link vs seats vs live sync vs export copy) is unset.

### Risks

- Cramming members, billing, and history into the 280px switcher.
- Treating “share” as “export file” without saying so (that would be SHAPE and a different job).
- Unsigned share (browser identity) looking like collab.
- Two sources of truth: Sessions vs menu vs a new History page.
- Desktop local workspace vs hosted shared workspace with no mode label.
- Read-only collaborator still seeing delete in the switcher.

### Suggested chunks (after ASK clears)

1. Sessions history states + search (product chrome only).
2. Header switcher parity (shared section label only).
3. Share sheet + members list (blocked on auth + host contract).
4. Shared-with-me filter and read-only chrome.
5. Dual-width + desktop chrome shots: `web-ws-sessions-*`, `web-ws-share-*`, `desktop-ws-share-overlay`.

---

## Job 2. Signup, login, logout in the product (F-auth)

### Meaning

A person creates an account, signs in, signs out, and the product knows who they are. Login/logout is how you access the product (web + desktop).

This is not “optional SSO if the operator configured OIDC.” That already exists.

### Place

Live chrome today (`AuthButton.tsx`):

- AppBar trailing control.
- `identity.type === "user"`: display name + logout icon (OIDC manager or backend `/api/auth/oidc/logout`, then browser identity + `location.href = "/"`).
- Else if OIDC configured: text “Sign In” (`auth.ssoLogin`), backend redirect or `signinRedirect()`.
- Else: **render nothing**. No signup. No email/password. No session expiry screen. Init failure is “SSO Error” tooltip.
- `/auth/callback` must stay ungated (i18n expert already noted this for LanguageScreen).

New places (honest):

| Place | New? | Surface |
|-------|------|---------|
| Login screen | **yes** | Web + desktop (product). Twin of signup. |
| Signup screen | **yes** | Same. |
| Logout confirm / signed-out landing | extend | Can stay icon + confirm if gated product; else return to landing. |
| AppBar `AuthButton` | extend | After login, account menu (name, manage subscription link to portal, sign out). |
| Auth gate | **yes** if product is account-required | Overlay or route **above** shell, **below** LanguageScreen. |

Do not build these screens on the billing portal as the only login. Portal can reuse the same account. Product must sign in on web and desktop.

### Approach

Order (onboarding + craft):

```text
Cold first-run, no locale → LanguageScreen (no Skip)
Then value/setup if those ship
Then auth gate (if required) or AppBar Sign in (if optional)
Never: paywall / plan picker before language
```

- Twin-screen family: login vs signup share field gap, error under field, one primary CTA, same tokens. Copy differs (Create account vs Sign in). Link between the two is secondary.
- Forms (`web-react-ui`): visible labels, inline errors, autofill-safe email/password, disable + explain in-flight. Icon buttons need `aria-label` (logout already uses tooltip; keep `aria-label`).
- If SSO stays: Sign in with SSO is secondary on the same screen, not a third look. Today’s `AuthButton` can remain the compact chrome once a session exists.
- Desktop: full login window usable at 1024×600. Keyboard completes happy path. No hover-only. Titlebar drag must not eat the form (`no-drag` on inputs/buttons).
- Web: 375 and 1280. One scroller. Sticky CTA must not cover focused fields.
- States: default, validation error, network error, loading, success (enter shell), SSO init error (already exists, keep).
- Logged-in chrome: name is not enough if billing exists. Account menu: Sign out (destructive confirm if unsaved workspace), optional “Account” link that **leaves** the analysis app to the web portal (new tab on desktop).

Open product questions (ASK, not UI invention):

- Required account vs optional sign-in (today optional).
- Email/password vs SSO-only vs both.
- Desktop: system browser OIDC vs in-window form.
- What happens to existing browser-id local workspaces after first signup.

### Verdict draft

**ASK**

Logout and “Sign in” chrome can **SHAPE** onto `AuthButton`. Signup + account-required access are new screens and a gate. Combined job is ASK. Do not implement a pretty login that implies a user store that is not decided.

### Risks

- Painting signup in the AppBar as a button with no screen.
- Billing or plan select on the login screen.
- LanguageScreen under an auth wall (wrong order) or auth under the model wall with no z-index plan.
- Desktop OIDC popup vs in-app form inconsistency.
- Purging persist on logout (`persistor.purge` on some paths) wiping local work without copy.
- Portal login that looks like a second Datly.

### Suggested chunks (after ASK clears)

1. Account menu + logout confirm on existing `AuthButton` (smallest SHAPE).
2. Login / signup twin screens + callback still ungated.
3. Optional vs required gate + `resolveEntry()` order (language → … → auth).
4. Desktop keyboard + titlebar; web 375/1280.
5. Deep link from product “Account” to portal (Job 3), same tokens.

---

## Job 3. Web portal: enterprise admin vs individual subscription (F-billing)

### Meaning

Individuals pay and manage a subscription. Enterprise admins manage users (seats) and billing. Both live on a **web portal**. The two experiences are slightly different. The analysis product stays Datly.

### Place

**New place.** There is no billing, plan, invoice, or seat-admin UI in the product today. The only “portal” string in `src` is an Azure Kusto cluster link. Feature-ask table: New place? yes (portal). Touches existing UI? none today.

Do not:

- Put invoices in Settings / `ConfigDialog`.
- Put a seat table in Sessions.
- Build a second grid/chart app so admins can “try Datly” inside the portal.

Do:

- New web-only shell (marketing-adjacent density OK, **same tokens** as Datly).
- From product: one “Manage subscription” / “Admin” link in the account menu. Desktop opens the system browser.

Two portal variants (same system, different nav):

| Variant | Who | Primary jobs | Nav |
|---------|-----|--------------|-----|
| Individual | Paying person | Plan, payment method, invoices, cancel, usage if it exists | Account / Billing |
| Enterprise admin | Org admin | Users/seats, roles, org billing, maybe SSO config later | Users / Billing (admin) |

Slightly different means: shared login, shared type scale, shared table/form recipes; different information architecture and primary CTA (Upgrade vs Invite user). Not two brands.

### Approach

Portal shell (`ui-craft` web + `web-react-ui`):

```text
[ top nav: Datly mark · Admin|Account · Sign out ]
[ optional sticky subheader ]
[ main scroller ]
[ toast host ]
```

- One primary CTA per view (Invite user, Update payment, Choose plan).
- P0 states on lists: empty seats, loading, error, success.
- Narrow: tables scroll or collapse; do not clip Invite.
- Destructive cancel / remove user: confirm.
- First-run of the **product** still language first. Portal may assume an existing locale or a compact language control in account settings. Do not insert a paywall as Datly’s first paint.
- Auth: same account as Job 2. Portal is not a third identity.
- Out of portal: chart canvas, DuckDB, workspace sessions, SQL, model wall.

Enterprise vs individual can be one app with a role flag, not two deployments. UI still needs two capture matrices.

### Verdict draft

**ASK**

The job is valid and **UNFIT** to place inside the analysis chrome. It is **ASK** as a new web portal (scope, plans, who is admin, Stripe-or-not, whether desktop shows any paywall). Not FIT. Not SHAPE onto `AuthButton` or Settings.

If the asker meant “billing settings inside Datly,” that placement is **UNFIT**. Redirect that meaning to this portal.

### Risks

- Inventing a second analysis app “for admins.”
- Billing before language on first-run.
- Enterprise and individual as unrelated visual systems.
- Putting seat admin only in-product and invoices only on a raw Stripe page with no Datly chrome (split brain).
- Desktop-only hover nav on a web portal.
- Scope creep: usage analytics, tax, marketplace, SSO admin, all in wave one.

### Suggested chunks (after ASK clears)

1. Portal shell + role switch (individual vs admin) + sign out. Web only.
2. Individual: plan + payment + invoices (empty/error).
3. Enterprise: users table + invite + remove + org billing.
4. Product account-menu link out (no portal UI in the canvas).
5. Shots: `web-portal-billing-*`, `web-portal-users-*` at 375 and 1280. No desktop portal ship.

---

## Verdict summary

| Job | Feature | Verdict | One line |
|-----|---------|---------|----------|
| 1 | F-workspace | **ASK** | History SHAPE on Sessions/menu; share is a new place and changes IA. |
| 2 | F-auth | **ASK** | Logout/Sign in SHAPE on `AuthButton`; signup + access gate are new screens. |
| 3 | F-billing | **ASK** | New web portal. UNFIT inside Datly analysis chrome. Not a second analysis app. |

Blast: large. Auth + billing + collab is a product-model change. Matches feature-ask integrate draft. Hard stop after Wave A if ASK holds. Do not `[impl]` this wave.

## UI-only assumptions (labeled)

- Portal URL and IdP are undecided; UI assumes same account as product login.
- Local desktop workspaces remain until an explicit hosted-only decision.
- “Slightly different” enterprise vs individual = nav and tables, not a new product.
- Share meaning (live vs copy vs seat-gated) is not specified; that is why Job 1 is ASK.

## Out of this expert

SQL analysis, SQL guard, data-flow ACL details, context-graph, header-chrome leftovers, cicada, model-card, loader-anim. F-data-acl may later reuse `readOnly` on the share sheet; not designed here.
