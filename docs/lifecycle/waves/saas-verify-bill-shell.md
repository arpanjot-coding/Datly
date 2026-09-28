# Independent verify: C-bill-shell

Slice: `C-bill-shell` in `docs/lifecycle/work-packages/F-billing-W.md`. UI gate: `docs/lifecycle/waves/billing-web-ui-expert.md` section 3.2 / chunk table. Writer sidecar `docs/test-runs/.worker-done/C-bill-shell.md` (`done: true`; files include `PortalShell.tsx`, i18n, `Page.tsx`, `App.tsx`). Dispatch also named `Login.tsx`. Verifier did not write the slice. Did not edit Datly-Web product files. Static read of source only. No typecheck, lint, build, npm, or device-qa. No shot. No Accept.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 Individual nav Usage/Plan | pass | Matches F-billing-W top nav and ui-expert 3.2 individual column (Usage, Plan). Same type scale as admin. | `navItemsForRole` for non-admin returns `/account/usage` and `/account/plan` with keys `nav.usage` / `nav.plan` (`D:\Coding\Main\Datly - Web\src\shell\PortalShell.tsx` 86-97). Labels via `t()` (`137-157`, `326-336`). `NAV_FONT_WEIGHT` 600 and `minHeight` 40 on wide links and menu items (22, 148-151, 333). Routes exist (`App.tsx` 25-27). | n/a |
| A2 Admin nav Users/Billing | pass | Matches F-billing-W and ui-expert 3.2 admin column (Users, Billing). Twin row height / weight. | Admin branch of `navItemsForRole` is `/admin/users` and `/admin/billing` (`PortalShell.tsx` 87-91). `App.tsx` 28-30 mounts those routes under `PortalShell`. Same `NAV_FONT_WEIGHT` and header height 56 (20, 241-248). | n/a |
| A3 Role switches nav | pass | Matches ui-expert chunk acceptance: role flag switches nav. One app, two nav trees. | Role type `'individual' \| 'admin'` (16). Login stub writes role via `setPortalSession` (`PortalShell.tsx` 63-70; `Login.tsx` 30-31). Shell reads `?role=` then `localStorage` (`188-202`, `204`). `items = navItemsForRole(role)` drives both wide `NavLinks` and the narrow menu. Sign out resets role to individual (209-215). | n/a |
| A4 Sign out present | pass | Matches F-billing-W "Sign out" and ui-expert: Sign out in header, and on narrow in the menu with role links. | Wide header button `t('nav.signOut')` (`PortalShell.tsx` 287-297). Narrow `MenuItem` calls `signOut` (338-340). `clearPortalSession` then `navigate('/')` (72-78, 209-215). No confirm (no in-flight mutation in this slice). | n/a |
| A5 Landmarks / header | pass | Matches ui-expert shell sketch: header (mark, role nav, account + Sign out), main scroller. | `AppBar component="header"` (234-243). Mark `DatlyMark` with logo + `t('brand.name')` (99-134, 256). Wide `Box component="nav"` `aria-label={t('nav.primary')}` (137-139, 258-271). Narrow `nav` wraps the menu button (300-315). `Box component="main"` with maxWidth 960 / 1120 (343-352). `Page.tsx` is a `Box` + `h1`, not a second `main`. | n/a |
| A6 Permission empty on /admin if not admin | pass | Matches F-billing-W acceptance and ui-expert: unknown role on `/admin/*` gets permission empty, not a 500. House-law ui-craft: empty + one CTA. | `isAdminRoute = pathname.startsWith('/admin')`; `denied = isAdminRoute && role !== 'admin'` (`PortalShell.tsx` 206-207). Denied branch is `role="status"` title, body, one contained CTA to `/account/usage` (365-374). Outlet is not rendered. Default stored role is individual (37-44). Direct `/admin` also matches the prefix, so Navigate to users does not paint admin UI for a non-admin. | n/a |
| A7 Narrow menu (not hover-only) | pass | Matches ui-expert 3.2: mark + menu button, not hover-only, menu lists role links + Sign out. Keyboard: IconButton + MenuItem (static). | Inline nav `display: 'none'` below `min-width: 1280px` (21, 258-267). Narrow `IconButton` with `aria-label={t('nav.menu')}`, `aria-expanded`, `aria-controls="portal-narrow-menu"`, `onClick={openMenu}` (305-314). MUI `Menu` lists `items` plus Sign out (319-341). `:focus-visible` ring uses `var(--df-focus-border)` (25-30); theme sets that to cicada primary (`createPortalTheme.ts` 46-48). No hover-only CSS menu. | n/a |
| A8 Toast host | pass | Matches ui-expert shell slot `[ toast host ]`. Empty host is enough for this slice (no mutation toasts yet). | Fixed `#portal-toast-host` with `role="status"` `aria-live="polite"` `aria-atomic="true"` (`PortalShell.tsx` 381-397). No enqueue helper and no callers. | n/a |
| A9 t()+en | pass | Matches F-billing-W house-law i18n on this chunk: `t()`+en. | `src/i18n/index.ts` `t(key)` reads `en.json`. Shell uses `t()` for brand, nav, menu, sign out, permission copy (`PortalShell.tsx` 13, 104, 139, 155, 223, 296, 302, 306, 367-372). `en.json` has Usage, Plan, Users, Billing, Sign out, permission keys. Login / Home / account-admin stubs are still hardcoded English (out of shell strings). | n/a |
| X1 Portal is not a second chart app | pass | Matches F-billing-W out of scope, section-grain (Usage is not a second Datly home), ui-expert: no Spark, KNIME, DuckDB canvas. | `package.json` deps: MUI, Emotion, React, react-router-dom only. `App.tsx` routes: `/`, `/login`, `/account/*`, `/admin/*`. No `/canvas`, `/sql`, `/workspaces`. Grep of `src` for Spark, KNIME, DuckDB, Vega, VisualizationView is empty. Usage stub is one sentence (`pages/account/Usage.tsx`). Token `surface.canvas` is sage fill, not a plot. | n/a |

## Missing / wrong / extra

- Missing vs named A1-A9 and X1: none in current source.
- Missing vs ui-expert entry (not scored as A3): Login always `navigate('/account/usage')` even when the stub role is admin (`Login.tsx` 30-31). Role home for admin is `/admin/users`.
- Wrong: none on the scored rows. Prior verify (`named export`, missing `src/i18n`, missing `setPortalSession`, object used as CSS color) does not match this tree.
- Extra vs this slice: Login role `<Select>` and password field (auth stub). Account and admin page stubs (`C-bill-usage` / `C-bill-admin`). Empty toast host with no API (allowed).

## Residual (not a fail of A1-A9 / X1)

- Stub role is `localStorage` plus optional `?role=`. Not product auth.
- Admin stub still lands on Usage; nav still switches to Users/Billing.
- Login, Home, and page stubs do not call `t()`.
- Toast host never shows a message.
- No vitest and no keyboard/375/1280 shot. Static only.
- Stripe is absent (out of scope; do not require it in Flask or here).

## Slice outcome

Named shell acceptance is met in source: individual Usage/Plan, admin Users/Billing, role flag switches nav, Sign out, landmarks, permission empty on `/admin` for non-admin, click menu on narrow, toast host, `t()`+en, no analysis canvas. Residual: admin stub landing URL and untranslated login/home copy.

Verifier did not Accept. Manager decides.
