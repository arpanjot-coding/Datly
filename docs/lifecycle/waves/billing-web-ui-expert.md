# UI-expert: F-billing (Datly-Web portal)

Role: ui-expert. Feature: F-billing. Session: web. Ship: portal web only.  
Do not implement. Do not edit `D:\Coding\Main\Datly - Web` this file. Do not design a chart canvas.

Refs read: `docs/lifecycle/waves/saas-ui-expert.md` Job 3, `web-react-ui.md`, `ui-craft.md`, `src/app/tokens.ts`, `docs/plans/saas-2026-08-20.md` Phase D, `docs/lifecycle/work-packages/F-saas-W.md`, `docs/lifecycle/HANDOFF.md`, `docs/lifecycle/TRACKING.md` (this message), empty sibling `D:\Coding\Main\Datly - Web`.

Craft laws applied: one system, workflow first, P0 states, one primary CTA, surface honesty (portal is web), twin-screen family (individual vs enterprise admin). Tokens from Datly cicada (`surface`, `borderColor`, `radius`, `shadow`, `status`, `palettes.cicada`).

Locked: D-portal-separate (web-only portal), D-saas-full. Individual vs enterprise admin: slightly different nav, same tokens. Language-first is the analysis product, not this portal. Desktop product links out via system browser.

---

## 1. Meaning

The product website is where a signed-in person controls money and seats. It is not Datly analysis.

Two jobs, one origin:

1. **Individual:** see usage for the current period, see the plan, change or cancel the plan.
2. **Enterprise admin:** see seats, invite and remove people, keep org billing next to that list.

Success is: usage numbers they trust, a plan they can change, a seat list they can edit. Success is not a chart, a SQL drawer, or a workspace.

Who: paying person (individual) or org admin. Same account plane as F-auth. Portal is not a third identity.

Entry (honest):

1. Open Datly-Web in a browser (bookmark, marketing CTA, or product "Manage subscription" / "Admin" which leaves the analysis app).
2. Sign in if needed (same account). No LanguageScreen as first paint here.
3. Land on the role home: Usage (individual) or Users (admin).
4. Finish the page job (upgrade, invite). Toast or inline success. Stay in the portal.

Desktop: the analysis Electron app does not host this UI. Account menu opens the system browser to Datly-Web.

Out of this portal:

- Chart canvas, Vega, VisualizationView, DuckDB, Sessions, SQL, model wall, Knowledge, LanguageScreen as gate.
- Seat admin as the only share path (workspace share stays in the analysis product).
- Invoices inside Datly `ConfigDialog`. Seat table inside Sessions.

---

## 2. Place (routes)

**New place.** `D:\Coding\Main\Datly - Web` is empty. That emptiness is the fit: a sibling web app, not a route inside `D:\Coding\Main\Datly\src`.

Analysis chrome stays the analysis product. Product account-menu link-out is a later Datly chunk, not a portal page.

### Route map

One app, role flag, two nav trees. Do not two deployments.

| Route | Role | Job | Primary CTA |
|-------|------|-----|-------------|
| `/` | signed out | Thin product entry: Sign in, Open Datly (analysis URL). Not a campaign site. | Sign in |
| `/login` | signed out | Portal login (same account as product). Twin of product login tokens, not a second Datly shell. | Sign in |
| `/account` | individual | Redirect to `/account/usage` | (none) |
| `/account/usage` | individual | Period usage: quota, remaining, what counts. Meters and a period table, not a canvas. | Manage plan (secondary: current period label) |
| `/account/plan` | individual | Current plan, change plan, payment method, invoices, cancel. | Upgrade / Update payment (one contained per view; cancel is destructive secondary) |
| `/admin` | admin | Redirect to `/admin/users` | (none) |
| `/admin/users` | admin | Seats: name, email, role, status. Invite, change role, remove. | Invite user |
| `/admin/billing` | admin | Org plan, invoices, payment. Twin of individual plan with org copy. | Update payment / Change plan |

Deep links from the product:

- Individual: `/account/usage` or `/account/plan`
- Admin: `/admin/users`

Unknown role hitting `/admin/*`: hide admin nav, show a permission empty (not a 500). Admin may still open `/account/*` for a personal plan if the contract says they have one; if not, hide Account nav.

Do not add: `/canvas`, `/workspaces`, `/sql`, `/sessions`, `/charts`.

Signed-out `/` is allowed as a one-screen entry. Do not spawn a marketing page family this wave (pricing essay, blog, docs). Pricing belongs on `/account/plan` after login, or a later chunk.

---

## 3. Approach (shell + pages)

### 3.1 Scaffold (C-bill-scaffold)

Empty folder becomes a Vite + React web app. Router owns the table above. Copy visual constants from `Datly/src/app/tokens.ts` (do not import the analysis bundle). Default palette: cicada.

Must copy into the portal theme:

- `surface.canvas` `#d5dbd2`, `paper` `#f3f5f0`, `card` `#ffffff`, `ink` `#1c231d`, `muted` `#5c665e`
- `borderColor.divider` / `component` / `view`
- `radius` (cards `md`, islands `xl`/`island`, pills)
- `shadow.sm`/`md`, `transition.fast`
- `status` for seat/plan chips (active / offline / progress / danger)
- `palettes.cicada` primary `#1f6b4a` for contained CTAs, white label, no elevation theater

Stack laws (`web-react-ui`): tokens only, no random hex; landmarks; one main scroller; P0 proof at ~375 and ~1280.

Locale: compact language control in account chrome or settings row if copy is `t()`. Do not insert LanguageScreen before Sign in. Analysis first-run stays language first.

Auth: reuse the same account. Distinct cookie name/origin vs the analysis app (security P0-2). UI does not invent Stripe in the scaffold.

### 3.2 Shell (C-bill-shell)

Web app shell (`ui-craft` §3 + Job 3):

```text
[ header: Datly mark | role nav | account + Sign out ]
[ optional sticky page title / primary CTA on narrow ]
[ main scroller ]
[ toast host ]
```

Wide (~1280): top nav, mark left, links center-left, account right. Main max-width ~960 to 1120, sage canvas, paper/card panels.

Narrow (~375): mark + menu button (not hover-only, not empty). Menu lists the role links + Sign out. Sticky page CTA must not cover focused fields. Tables: horizontal scroll or card collapse. Do not clip Invite / Upgrade.

Nav by role (slightly different, same type scale and row height):

| Individual | Enterprise admin |
|------------|------------------|
| Usage | Users |
| Plan | Billing |
| Sign out | Sign out |

One system: same header height, same link weight, same focus ring (`--df-focus-border` cicada primary). Different information architecture and different primary CTA (Upgrade vs Invite user). Not two brands.

Sign out is in the header, not a page. Confirm only if a mutation is in flight.

Out of shell: chart plot, allotment splitter, Sessions rail, composer, model picker.

### 3.3 Individual usage + plan (C-bill-usage)

Twin pages, same card recipe.

**Usage (`/account/usage`)**

```text
Title: Usage
Hint: This billing period
Body: plan chip · period dates
      meter rows (included / used / remaining) as bars or numeric rows
      optional event table (date, meter, quantity)
Footer: none, or text button "See plan"
```

Primary on this view may be absent if the job is "read usage"; then "Manage plan" is the one contained action, linking to `/account/plan`. Do not add a Vega chart, sparkline canvas, or VisualizationView. A CSS meter is not a chart product.

States: default (meters), empty (no usage yet this period), loading, error (retry). Success is not required for a read view.

**Plan (`/account/plan`)**

```text
Title: Plan
Body: current plan card (name, price, renewal)
      plan choices (radio or cards; one contained Choose / Upgrade)
      payment method row
      invoices list (date, amount, status, download)
      Cancel subscription (text / danger, confirm dialog)
```

One primary at a time: Choose plan **or** Update payment, depending on the focused block. Cancel is always secondary + confirm.

States: default, empty invoices, loading, error, success toast after change, overlay (cancel confirm, payment form).

Forms: visible labels, inline errors, disable + explain in-flight (`web-react-ui`). Keyboard completes happy path.

### 3.4 Admin seats (C-bill-admin)

**Users (`/admin/users`)**

```text
Title: Users
Primary: Invite user
Body: table (name, email, role, status, last active)
      row menu: change role, remove
Empty: "No seats yet" + Invite
```

Invite overlay: email, role select, Send invite. One primary. Narrow: full-screen sheet; wide: dialog. Focus trap, Escape, restore focus.

Remove: confirm. Destructive visual from `status.danger`, not a silent icon.

Role select is org seat role (admin / member), not workspace editor/viewer. Workspace share stays in Datly.

States: default, empty, loading, error, success (invited / removed), overlay (invite, confirm remove).

**Org billing (`/admin/billing`)**

Same plan/invoice recipe as `/account/plan` with org copy and seat count on the plan card. Twin-screen with individual plan: field gap, table header, invoice row, CTA placement. Do not fork a new visual system.

If org billing is not wired in the same chunk as seats, ship `/admin/billing` as a honest loading/empty route in the shell, or hide the nav item until the API exists. Do not paint fake invoices.

### 3.5 Product link-out (not Datly-Web)

Later, in Datly `AuthButton` account menu: "Manage subscription" / "Admin". Desktop: `shell.openExternal`. Web: new tab or same tab to the portal origin. No portal UI in the canvas. Out of the four C-bill-* chunks.

### 3.6 Proof

P0 screens at 375 and 1280:

- `web-portal-entry-default-w375` / `w1280`
- `web-portal-usage-default` / `empty` / `error`
- `web-portal-plan-default` / `overlay` (cancel)
- `web-portal-users-default` / `empty` / `overlay` (invite)
- `web-portal-users-error`

No desktop portal shots. Keyboard: Sign in, Invite, Upgrade without hover.

---

## 4. Verdict

**FIT**

The job is valid. Placement is the empty sibling `D:\Coding\Main\Datly - Web`. That folder is the portal. It is **UNFIT** inside Datly analysis chrome (`src/views`, Settings, Sessions). Job 3 ASK is cleared for place: D-portal-separate + empty Datly-Web.

SHAPE: account portal (usage, plan, seats). Thin signed-out `/` only. Not a second analysis app. Not SHAPE onto `AuthButton` or `ConfigDialog`.

Still labeled (not UI invention): Stripe vs other processor, exact meter names, who is org admin, whether an admin has a personal plan. UI can ship shells and P0 states against a stub API. Processor widgets stay behind the plan/payment block.

---

## 5. Risks

- Building a second Datly (sidebar, canvas, SQL) because the folder is named Web.
- Putting billing in analysis Settings because it is faster than a sibling app.
- Two visual systems: "marketing site" vs "admin app" with different hex.
- Usage page becoming a chart canvas or analytics product.
- Hover-only nav as the only way to reach Invite on 375.
- Clipped primary CTA on narrow tables.
- LanguageScreen or paywall order copied from the analysis first-run (wrong here; still never paywall Datly before locale).
- Portal login that looks like a second analysis shell (island + allotment).
- Seat admin standing in for workspace share.
- Painting Stripe invoices with no API (dishonest empty).
- Same session cookie as the analysis origin (security; UI must not force `SameSite=None` for convenience).
- Scope creep: tax, marketplace, SSO admin, usage analytics, blog.

---

## 6. Chunks

| ID | Goal | Depends | Likely files (Datly-Web, empty today) | Acceptance |
|----|------|---------|----------------------------------------|------------|
| C-bill-scaffold | App shell host: Vite/React, router, cicada tokens copied from `Datly/src/app/tokens.ts`, signed-out `/` + `/login` stubs. No canvas deps. | - | `package.json`, `src/app/tokens.ts` (copy), `src/app/theme.ts`, `src/main.tsx`, router | App boots. Sage canvas, forest primary. Routes exist. 375 and 1280 do not overflow. |
| C-bill-shell | Role nav: individual Usage/Plan vs admin Users/Billing. Header landmarks, menu on narrow, Sign out, toast host. | C-bill-scaffold | `src/shell/PortalShell.tsx`, nav config | Role flag switches nav. Keyboard reaches every item. No hover-only. Twin type scale. |
| C-bill-usage | Individual `/account/usage` + `/account/plan`: meters (not charts), plan card, invoices list, cancel confirm. P0 states. | C-bill-shell | `src/pages/account/UsagePage.tsx`, `PlanPage.tsx` | User can read usage and start plan change. Empty/error honest. One primary CTA per view. |
| C-bill-admin | Enterprise `/admin/users`: seat table, invite overlay, remove confirm. `/admin/billing` twin of plan or hidden until API. | C-bill-shell | `src/pages/admin/UsersPage.tsx`, `OrgBillingPage.tsx` | Admin can invite and remove. Empty seats + Invite. Table collapses or scrolls at 375. |

Out of these chunks: product `AuthButton` link-out, Stripe webhook UI, SSO admin, marketing site, analysis canvas.

Suggested impl order: scaffold -> shell -> usage -> admin.

---

## Out of this expert

SQL, SQL guard, context-graph, F-workspace share sheet, F-auth product screens (beyond same-account assumption), header-chrome leftovers, cicada island restyle in Datly, KNIME/canvas, mobile native.
