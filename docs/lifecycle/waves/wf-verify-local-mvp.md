# Independent verify: C-local-mvp

Slice: `C-local-mvp` in `docs/lifecycle/TRACKING.md` (SHAPE D-local-free-login: free, login required, no live share). Writer sidecar `docs/test-runs/.worker-done/C-local-mvp.md` (`done: true`, harvest: named App.tsx `loginRequired`; Share hidden in workspace chrome). Files claimed: `src/app/App.tsx`, `src/views/WorkspaceMenu.tsx`, `src/views/DataSourceSidebar.tsx`. Verifier did not write the slice. Static read of source only. No typecheck, lint, build, or device-qa. No command. No shot. No Accept.

Named writer acceptance: Unsigned user after language hits login. No Share control in the workspace chrome. SHAPE also: no `IS_LOCAL_MODE` skip on the gate, `identity.type !== 'user'` (including `local`), language first, `/login` ungated, `ShareSheet.tsx` kept, no Stripe/paywall.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 `loginRequired` is `identity.type !== 'user'` | pass | Matches writer harvest and SHAPE "login required (user identity, even desktop)". | `src/app/App.tsx` 206-208: comment plus `const loginRequired = identity.type !== 'user';`. AppShell render 262-266: `loginRequired ? <Navigate to="/login" replace /> : <Outlet ... />`. Default identity is `{ type: 'browser', ... }` (`src/app/dfSlice.tsx` 315), so unsigned chrome redirects. | n/a |
| A2 No `IS_LOCAL_MODE` skip on the login gate | pass | Matches SHAPE: do not skip login for local/desktop. | Grep `IS_LOCAL_MODE` in `src/app/App.tsx` is empty. Gate does not read `serverConfig.IS_LOCAL_MODE`. Server `local` identity is still assigned (`App.tsx` 337-339) then password may replace it (393-403); if type stays `local` or `browser`, A1 still requires login. | n/a |
| A3 Language first | pass | Matches house first-run and writer note "LanguageScreen overlay still first". Never paywall first. | `LanguageScreen` import `App.tsx` 58. Overlay sits outside the router, after `configLoaded && authChecked` (`487-518`). `showLanguagePicker` uses pre-init i18n snapshot, not login. Only `/auth/callback` is excluded from the picker (`495`). Picker sets the router `inert` / `pointerEvents: 'none'` so locale completes before login or chrome. | n/a |
| A4 `/login` ungated | pass | Matches writer note `/login` `/signup` `/auth/callback` remain top-level ungated. | Router `useMemo` (`App.tsx` 447-485): `/auth/callback`, `/login` (`LoginScreen`), `/signup` (`SignupScreen`) are sibling routes, not AppShell children. AppShell gate wraps only `/` children (`index`, `app`, `about`, `*`). Unsigned product chrome Navigate goes to `/login` (263). | n/a |
| A5 WorkspaceMenu does not render Share/ShareSheet | pass | Matches "No Share control in the workspace chrome" and writer files list. | `src/views/WorkspaceMenu.tsx`: no `Share`, `ShareSheet`, or share i18n keys. Export `WorkspaceMenu` (361-421) is workspace name + picker + read-only caption. No Share import. Mounted from `src/components/IslandHeader.tsx` 339/343 with no Share sibling. | n/a |
| A6 DataSourceSidebar does not render Share/ShareSheet | pass | Same chrome rule. Sessions tab is history, not live share. | `src/views/DataSourceSidebar.tsx`: no `Share`, `ShareSheet`, or share i18n keys. Imports include `listWorkspaces` / `exportWorkspace` (file export), not ShareSheet. Sessions state is local list/search (`564+`). | n/a |
| A7 `ShareSheet.tsx` still exists | pass | Writer: ShareSheet kept. C-share-acl may own the file; this slice must not delete it. | `src/views/ShareSheet.tsx` present. Named export `ShareSheet` (83). Grep of `from '...ShareSheet'` under `src/` is empty: file exists, chrome does not mount it. | n/a |
| X1 No Stripe / paywall added | pass | SHAPE D-local-free-login: free, no Stripe/paywall. Out of scope: F-billing portal Stripe. | Grep `stripe` / `Stripe` / `paywall` / `Paywall` under `src/` hits only ResizeHandle "stripe" (visual) and no paywall. `package.json` has no `@stripe` / `stripe`. `py-src` Stripe hit is a comment in unused `auth/csrf.py` 3-4: "Stripe webhooks (none in this app)". Writer files do not add billing UI. | n/a |

## Missing / wrong / extra

- Missing vs named acceptance: none on static read.
- Wrong: none on A1-A7, X1.
- Extra vs this slice: password replace of `local` identity on reload (`App.tsx` 393-403) is documented in the writer sidecar and is not a Share or Stripe change. `ShareSheet.tsx` remains an unmounted Wave 3 leftover; chrome hide is this slice.

## Residual (not a fail)

- No vitest, no web/desktop shot, no live unsigned-after-language path.
- App first paint is AnvilLoader until `configLoaded && authChecked`; language overlay then login is after that, not on the loader frame.
- Server can still stamp `IDENTITY.type === 'local'` in config. The product chrome still redirects until `identity.type === 'user'`.
- File export / import in the Sessions sidebar is not live Share. Do not treat it as a Share control.
- Billing portal and `C-bill-stripe` stay in Datly-Web / later chunks. This verify only asserts this slice did not add Stripe or a paywall in the product files named above.

## Slice outcome

A1-A7 and X1 pass on static read. Login gate is `identity.type !== 'user'` with no `IS_LOCAL_MODE` skip. LanguageScreen overlays first. `/login` is a sibling ungated route. WorkspaceMenu and DataSourceSidebar do not render Share/ShareSheet. `ShareSheet.tsx` still exists. No Stripe/paywall added.

Verifier did not Accept. Manager decides.
