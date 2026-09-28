# Product research (lite) - Datly professional SaaS

- **Status:** COMPLETE
- **Kind:** R
- **Created:** 2026-08-20
- **Source:** DISPATCH-FALLBACK after W-saas-research stall (host not_found, no named file, elapsed 344s). Merged Wave A `saas-ui-expert.md`, `saas-be-expert.md`, `saas-security.md`, plus locked D-saas-full. Not a full rival crawl.
- **Lane:** BUILD (feeds Kind E, does not block Phase A)

## Seeds

- User lock: build all as professional SaaS.
- Jobs: accounts, live share, billing portal, data ACL, SQL drawer + guard, later context graph.
- Constraints: SQL is a drawer not home. Portal is not a second analysis app. Language before paywall.

## Category norms (lite)

Analysis SaaS (Hex, Mode, Metabase Cloud, Looker / Tableau Cloud, Observable) share a split:

| Job | Norm | Datly lock |
|-----|------|------------|
| Identity | Email/password plus SSO. Anonymous is not a product login on hosted. | D-auth-required, D-auth-password, keep OIDC |
| Collab | Live members and roles on the same workspace, not export-a-copy as the only share. | D-share-live |
| Billing | Separate admin / billing shell. Canvas stays the analysis product. | D-portal-separate |
| SQL | Optional editor or cell, not the home of a viz-first canvas. | D-sql-drawer: read-only drawer, not DataGrip |
| First-run | Locale is a Datly house law, not a category P0. Still: language then auth, never paywall first. | LanguageScreen before gate |

## Compare → include

| Capability | They have | We have | Include? | Why |
|------------|-----------|---------|----------|-----|
| Required hosted login | Hex, Metabase Cloud | Optional OIDC + anonymous browser id | yes | D-auth-required |
| Email/password + SSO | common | OIDC only | yes | D-auth-password |
| Live workspace members | Hex, Mode | local disk sessions | yes | D-share-live |
| Separate billing portal | common | none | yes | D-portal-separate |
| SQL as home / workbench | DataGrip, Metabase SQL | none | no | Drawer only |
| Second analysis app on portal | anti-pattern | none | no | Portal is seats and invoices |
| Paywall before locale | anti-pattern vs house first-run | LanguageScreen exists | no | Language first |

## Skip / later

- Context graph: Phase F P1 after SQL.
- Dropping local desktop this run: no.
- Stripe inside DuckDB Flask routes: no (portal service).
- Header chrome, model-card, cicada leftovers: out of this campaign.

## Confidence

Medium. Worker stall. Fallback uses Wave A specialists and prior IDE research (`docs/lifecycle/product-research.md`), not a fresh store-review crawl.

## Handoff

Phase A proceeds on F-auth. This file does not change SHAPE.
