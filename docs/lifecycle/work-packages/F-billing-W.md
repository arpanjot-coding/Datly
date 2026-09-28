# Work package - F-billing Datly-Web portal

- **Status:** ACCEPTED
- **Kind:** W
- **Feature:** F-billing
- **Code root:** D:\Coding\Main\Datly - Web (empty sibling)
- **Lifecycle root:** D:\Coding\Main\Datly
- **Source:** DISPATCH-FALLBACK after plan stall. Merged billing-web-neighborhood + billing-web-ui-expert.
- **Lane:** BUILD
- **Session:** web
- **plan-check:** PASS (complete, honest, fit). First [impl] C-bill-scaffold.

## Ask / out of scope

Product website where users control billing, usage, and enterprise seats.

**Out of scope:** second analysis app, DuckDB/charts/SQL in this repo, Stripe inside Datly Flask, LanguageScreen as first paint, KNIME, workspace share (stays in product).

## Meaning

Signed-in people manage money and seats on Datly-Web. Individuals: usage, plan, invoices. Admins: users/seats, org billing. Analysis stays in Datly.

## Verdict

**FIT.** Empty sibling folder is the place. D-portal-separate.

## Place / grain

| Route | Job |
|-------|-----|
| `/` | Signed-out entry: Sign in |
| `/login` | Portal login |
| `/account/usage` | Usage meters + period table |
| `/account/plan` | Plan, payment, invoices, cancel |
| `/admin/users` | Seats invite/remove |
| `/admin/billing` | Org plan + invoices |

No `/canvas`, `/sql`, `/workspaces`.

## House-law fill

| Id | Chunk or n/a | Why if n/a |
|----|--------------|------------|
| ui-craft | C-bill-shell | Empty/error/one CTA |
| section-grain | C-bill-shell | Usage is not a second Datly home |
| phone-chrome | n/a | portal is web; no Capacitor |
| web-layout | C-bill-scaffold | 375 and 1280 |
| desktop-chrome | n/a | portal not Electron |
| first-run | n/a | LanguageScreen is the analysis app |
| value-slide | n/a | none this wave |
| app-polish | n/a | store listing not this repo |
| notifications | n/a | no reminders |
| i18n | C-bill-shell | t()+en |
| hardware-back | n/a | no android |

## Chunks

| ID | Goal | Depends | Acceptance | Likely files |
|----|------|---------|------------|--------------|
| C-bill-scaffold | Vite + React + TS + MUI in Datly-Web. Copy cicada tokens (surface, radius, palettes.cicada). Router stubs. README how to run. | - | `npm run dev` serves a page. package.json exists. No DuckDB. | D:\Coding\Main\Datly - Web\* |
| C-bill-shell | Top nav: mark, Usage/Plan or Users/Billing by role, Sign out. Landmarks. | C-bill-scaffold | Individual vs admin nav. Permission empty on /admin if not admin. | src/shell, routes |
| C-bill-usage | Individual usage + plan pages with empty/loading/error. Stub API OK. | C-bill-shell | Usage shows meters or empty. Plan has one primary CTA. | src/pages/account |
| C-bill-admin | Users table invite/remove confirm. Org billing twin. | C-bill-shell | Invite is primary on /admin/users. Empty seats honest. | src/pages/admin |
| C-bill-stripe | Later: Stripe checkout + signed webhooks on portal backend, not Flask. | C-bill-usage | deferred until usage UI exists | portal API |

## Proof

Web dual viewport. No desktop portal ship. shipsNotifications false.

## User questions

None.
