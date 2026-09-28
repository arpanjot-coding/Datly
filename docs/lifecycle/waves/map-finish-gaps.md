# Project map inputs (sections 7-8) - Datly

Source: [explore] W3 01a01ad8-8e9b-7fe0-8a22-6404e172de08. Manager persist. Not Accept.

Primary job: load or connect data, then charts and answers from the analyst/formulate path. Manual encoding shelf is a power-user side path. Reports are a view-mode. Hard gate: no model selected -> full-screen overlay.

## Shipped capabilities (inferred, not Done)

Auth optional SSO live; connectors live (Databricks OAuth hole); analyst live; manual formulate live; reports live; charts live; data load/workspaces live; sandbox live; knowledge live; desktop single-instance live; writes files live (untested as ship capability); first-run partial; OS notifications n/a.

## Finish the app

No P0 that stops load-data -> analyst chart -> optional report.

| ID | Band | Fix or add | Why |
|----|------|------------|-----|
| F1 | P1 | Add CI yarn test + pytest | Ship proof hole |
| F2 | P1 | Add typecheck script + CI | Convention gap |
| F3 | P1 | Add FE tests on analyst/chart/report/shelf | Primary job UI untested |
| F4 | P1 | Ship proofs for zip/PNG/PDF | writes-files untested |
| F5 | P1 | detect-capabilities --write; desktop in-scope if shipping desktop | State lies |
| F6 | P1 | First-run if consumer desktop | Model gate is not guided onboarding |
| F7 | P1 | Rebrand to Datly only if ship name is Datly | Identity hole |
| F8 | Later | Databricks OAuth | Not primary local job |
| F9 | Later | Professional data-IDE chrome | Category ask; this REPORT |
| F10 | Later | Dead GET_RECOMMENDATION_QUESTIONS | Unused |
| F11 | Later | Dual SCSS vs tokens | Polish after identity |

## Next campaign

- This message: research/plan after map. Do not implement.
- Product after IDs: test campaign (proofs), unless user picks data-IDE IDs from Kind R.
