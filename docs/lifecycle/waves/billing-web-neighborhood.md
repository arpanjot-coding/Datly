# Billing web neighborhood (F-billing, Phase D)

Grounded 2026-08-20. Map only. Do not implement. Portal lives in `D:\Coding\Main\Datly - Web`. Analysis product stays `D:\Coding\Main\Datly`. No em dashes.

Refs: `src/app/tokens.ts`, `src/app/theme.ts`, `src/index.css`, `docs/lifecycle/waves/saas-ui-expert.md` Job 3, `docs/plans/saas-2026-08-20.md` Phase D, `docs/lifecycle/waves/saas-security.md` P0-5, `docs/lifecycle/waves/saas-be-expert.md` Job 2.

Locks: D-portal-separate. Portal is not a second chart/SQL app. Stripe stays off analysis Flask/DuckDB. Auth later shares `user:<id>`.

---

## 1. Datly-Web is empty

Confirmed: `D:\Coding\Main\Datly - Web\` lists as a folder with no children (no `package.json`, `src`, `README`, git metadata visible to the dir listing). Greenfield. Do not copy the analysis renderer tree into it.

Sibling on disk: `D:\Coding\Main\Datly` (React + Vite + MUI analysis app). Product chrome, DuckDB, workspaces, SQL drawer stay there.

Today in product `src/`: no billing, invoices, seats, or portal shell. The only "portal" string is an Azure Kusto cluster link (`src/views/DBTableManager.tsx`). `AuthButton` has no "Manage subscription" item yet (Job 2 chunk, not this repo).

---

## 2. Brand tokens to copy (not the analysis app)

Copy a **thin visual contract**, not App.tsx, Redux, Allotment, Vega, DuckDB clients, or encoding palettes.

Source of truth: `D:\Coding\Main\Datly\src\app\tokens.ts` plus the Cicada projection in `src/app/theme.ts`. Product default is Cicada (`defaultPaletteKey = 'cicada'`). Portal should lock Cicada; do not ship the analysis Settings palette picker.

### Copy

| Token | File:line | Values / notes |
|-------|-----------|----------------|
| `borderColor` | `tokens.ts:14-23` | divider / component / view: `rgba(28, 35, 29, 0.10 / 0.08 / 0.10)` |
| `surface` | `tokens.ts:26-37` | canvas `#d5dbd2`, paper `#f3f5f0`, card `#ffffff`, ink `#1c231d`, muted `#5c665e`, overlay |
| `status` | `tokens.ts:40-45` | active / offline / progress / danger. Use for invoice paid, failed payment, usage warn |
| `DividerBorderStyle` `ComponentBorderStyle` `ViewBorderStyle` | `tokens.ts:59-65` | 1px solid using the three border colors |
| `shadow` | `tokens.ts:69-74` | sm / md / lg / xl, ink-tinted |
| `transition` | `tokens.ts:78-82` | fast 150 / normal 200 / slow 280 |
| `pressScale` | `tokens.ts:84-87` | rest `scale(1)`, down `scale(0.96)` |
| `radius` | `tokens.ts:123-145` | xs 1, sm 1.5, md 3, lg 4, xl 6, island 7, pill `999px` (MUI spacing units, 1 = 4px) |
| `palettes.cicada` | `tokens.ts:244-252` | primary `#1f6b4a` / `#e4efe8` / `#18563c`; secondary `#4a5a4e`; warning `#b4532a` |
| `defaultPaletteKey` | `tokens.ts:289` | `'cicada'` |
| `bgAlpha` | `tokens.ts:295` | `0.1` for derived tints |

Theme projection to copy as a **new** `createPortalTheme` (do not import product `theme.ts` if it pulls `layout.ts` density CSS vars):

| Piece | File:line | Portal use |
|-------|-----------|------------|
| Font stack | `theme.ts:16-25` | `"Segoe UI", system-ui, sans-serif`. Buttons `textTransform: none`, weight 500 |
| Palette map | `theme.ts:27-40` | background.default = canvas, paper = paper, text.primary = ink, divider, action.hover ink 0.04 |
| CssBaseline body | `theme.ts:43-64` | sage canvas, reduced-motion |
| AppBar glass | `theme.ts:66-75` | paper 0.88, blur 12px, hairline divider, no elevation |
| Paper / Dialog / Menu / Chip | `theme.ts:77+` | radius.lg in px, view border, shadow.md |

Body seed (marketing + portal may **scroll**; product `overflow: hidden` is canvas-only):

| Piece | File:line |
|-------|-----------|
| Sage html/body colors | `index.css:30-38` (`background: #d5dbd2`, `color: #1c231d`) |
| Focus green | `index.css:9` `--df-focus-border: #1f6b4a` |

Optional later: `src/app/recipes.ts` `cardRecipeSx`, `statusPillSx` for invoice/seat tables. Do not copy `islandFieldSx` / composer recipes; those are analysis chrome.

Logo assets exist in product `public/data-formulator-logo-128.png` and `-512.png`. Copy the mark into the portal public folder; do not symlink the whole `public/` demos tree.

### Do not copy

- Other `palettes.*` (`material`, `fluent`, `vivid`, …) and Settings palette UI
- `sidebarEdge`, `floatingPillSx`, `conversationWidth` (`tokens.ts:47-118`)
- Chart theme (`chartTheme.ts`), Vega/Flint, encoding colors
- `layout.ts` density ramp / 1024x600 desktop budget (portal P0 is web 375 + 1280)
- Redux, persist, identity header `X-Identity-Id`, Flask `/api/*`
- DuckDB, sessions, SQL drawer, allotment, chart canvas

---

## 3. Recommended stack

**React 18 + Vite + MUI 7 + Emotion + react-router-dom**, matching the product (`package.json`: `react` 18.2, `@mui/material` 7.1, `@emotion/*`, `vite` 7, `react-router-dom` 7, `@vitejs/plugin-react-swc`).

Why match unless a strong reason:

- Job 3: same tokens, type scale, table/form recipes. Twin-screen family with product login.
- Portal is account + billing + seats, not content SEO as the primary job.
- MUI + Next App Router is extra friction (Emotion cache, `"use client"` everywhere) for no billing benefit.
- Product already ships Vite; a second Vite app is the smallest visual-parity path.

Next.js is justified only if marketing SEO/SSR becomes a hard P0 (indexable pricing, blog). That is not Phase D. Do not split marketing Next and portal Vite in wave one (two brands, two token copies). If SEO is needed later, prerender the public home or add a static marketing route in the same Vite app.

Portal backend is a **separate service** (BE-expert Job 2; security P0-5). Do not run Stripe inside analysis Flask. Typical Phase D split:

| Layer | Choice |
|-------|--------|
| UI | Vite SPA in `Datly - Web` |
| Billing API | New service (not DuckDB routes). Stripe Checkout + Customer Portal + webhooks |
| Account | Same opaque `user:<id>` as F-auth when that store exists. Until then, portal login is a stub against that contract |
| Cookie | Distinct name and origin from analysis app (`saas-security.md` P0-2, P1-6) |

Do not add: Vega, DuckDB-wasm, Redux-persist, Electron, oidc-client-ts `localStorage` tokens for password sessions.

---

## 4. Pages (IA)

One app, role flag, two navs. Shared login. Not two deployments. UI-expert shell:

```text
[ top nav: Datly mark · Admin|Account · Sign out ]
[ optional sticky subheader ]
[ main scroller ]
[ toast host ]
```

P0 proof: web 375 + 1280. No desktop portal ship. Desktop product opens this origin via `shell.openExternal`.

### Public

| Route (suggested) | Job | Notes |
|-------------------|-----|--------|
| `/` marketing home | Why Datly, CTA to product or signup | Marketing-adjacent density OK. Same Cicada tokens. No chart workbench. Optional plan overview, no paywall as Datly first paint (LanguageScreen lives in the product) |
| `/login` `/signup` | Same account later | Twin of product auth screens: field gap, inline errors, one primary CTA. Copy differs. SSO secondary if present. Not a third identity |

Portal may assume locale or a compact language control in account settings. Do not insert LanguageScreen as the portal first paint.

### Individual (`/account`)

Nav: Account / Billing. Primary CTAs one per view.

| View | Jobs (Phase D plan) |
|------|---------------------|
| Plan | Current plan, change plan, upgrade |
| Payment | Payment method, Update payment |
| Invoices | List, empty, error, download |
| Usage | Meters if the catalog has them (seats, runs, storage). Honest empty if not priced yet |
| Cancel | Destructive confirm |

### Enterprise admin (`/admin`)

Nav: Users / Billing (admin). Primary CTA: Invite user vs Update payment.

| View | Jobs |
|------|------|
| Users / seats | Table, invite, role, remove + confirm, empty seats |
| Org billing | Org plan, payment, invoices |
| SSO config | Out of wave one (Job 3 risk: scope creep) |

### Out of this app

Chart canvas, DuckDB, workspace sessions, SQL, model wall, Settings/ConfigDialog invoices, Sessions seat table.

Product link (later, in Datly repo): account menu "Manage subscription" / "Admin" leaves the canvas. Desktop: system browser.

---

## 5. Auth and Stripe contracts (do not violate)

- Same `user:<opaque_id>` namespace as F-auth. Email is a column, not the path id (`saas-security.md` P0-7).
- Distinct session cookie from analysis origin. CORS allowlist, never `*` with credentials. Login redirects allowlisted (P1-6).
- CSRF on cookie POSTs. Stripe webhooks **must not** use the CSRF cookie (P0-3, P0-5).
- Webhooks: raw body, `Stripe-Signature`, timestamp tolerance, persist `event.id` for idempotency. Browser Checkout success is not entitlement.
- Secret keys never in portal JS. Publishable key only in the browser.
- Fail closed if webhook secret unset in production.
- Map Datly `user_id` in `client_reference_id` / metadata at checkout. Do not auto-provision admin from an unsigned webhook.
- Seat count from Stripe is not the only ACL (P1-7). Revoke membership in the product independently.

Phase D plan text (`saas-2026-08-20.md:69-71`): separate web service; individual plan, payment, invoices; enterprise users, seats, org billing; signed + idempotent webhooks; product account menu links out.

---

## 6. Risks

| Risk | Why it bites |
|------|----------------|
| Second analysis app | Job 3 hard stop. Empty repo invites "just copy Datly". Do not. |
| Copying all of `tokens.ts` palettes | Portal becomes a theme playground. Lock Cicada. |
| Next.js for "marketing SEO" in wave one | Diverges from MUI product; two token pipelines. |
| Billing UI inside Flask/Datly Settings | UNFIT. D-portal-separate. |
| Stripe on DuckDB routes | BE + P0-5. Separate service. |
| Same cookie name/domain as analysis | Session bleed, CSRF across siblings (P0-2, P0-3, P1-6). |
| Portal-only login that looks like a second Datly | Job 2 risk. Twin fields, not a clone of the canvas. |
| Paywall / plan picker before product LanguageScreen | House first-run. Portal does not become Datly's first paint. |
| Entitlement from client success URL | P0-5. Webhooks only. |
| Usage analytics, tax, marketplace, SSO admin in wave one | Job 3 scope creep. |
| Hover-only nav | Portal is web; 375 must work. |
| Split brain: seats in-product, invoices on raw Stripe-hosted page with no Datly chrome | Job 3. Stripe Customer Portal can be an iframe/redirect for card update, but lists and plan copy stay in Datly chrome. |

---

## 7. Suggested first files (when impl starts, not this wave)

In `D:\Coding\Main\Datly - Web` only:

- `package.json` Vite + React + MUI (aligned versions)
- `src/theme/tokens.ts` (copied subset above)
- `src/theme/createPortalTheme.ts`
- `src/pages/Home.tsx`, `Login.tsx`, `account/*`, `admin/*`
- Billing API is not this UI repo; do not add Flask here either

Product Datly repo changes for Phase D are the account-menu link out only, after F-auth.

---

## Verdict

Empty portal repo. Copy Cicada surface/border/shadow/radius/status + `palettes.cicada` + `createTheme` projection. Stack: React + Vite + MUI to match the product. Pages: marketing home, login, individual billing+usage, enterprise admin. Stripe and account plane stay off analysis Flask.
