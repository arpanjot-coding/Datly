# Feature ask - free SaaS workflow (current)

- **Verbatim:** we need to make sure that the changes that we made don't cause any issues to the actual software itself. What we want to do, we want to keep it simple, easy to use. There are no issues in terms of Customization. We just want everything good, solid. The Workflow, that's what we need to analyze and make sure that it makes sense. Like at the moment, the project history, it's just below. Or maybe we can have a history section. And then users can set up a new project, then we can have a new chat. Also, I asked you to integrate B2B, so you need to check that. If we, for example, the features that I asked, our journey, we want to log in it being a SaaS system. We're not going to take any payment, we're not going to have any hire team, we're just going to make the SaaS system really, really good and free to use for the users.
- **Lane:** BUILD
- **Session:** web, desktop
- **SHAPE lock draft:** D-free-saas. Login required. Free. No Stripe. No hire-team / seats / org billing. No live share. History is a first-class section. New project starts a fresh chat. Keep Distill/Play. Language first.

## Jobs

| # | Job | Feature id | New place? | Touches existing UI? |
|---|-----|------------|------------|----------------------|
| 1 | History section + new project + new chat, keep simple | F-workspace | landing + sessions | DataFormulator, WorkspaceMenu, DataSourceSidebar |
| 2 | Regression: recent login/distill/play must not break analysis | F-auth F-workflow-db | no | App, Knowledge, replay |
| 3 | B2B check without pay or hire team | F-billing | no this ship | none |

## Meaning (draft)

- **F-workspace:** After login, the user sees a History of their projects, can open one, or start a new project that opens a clean chat. History is not a leftover list under the landing hero.
- **F-auth / F-workflow-db:** Same simple path: language, sign in, load data, chat, Distill, Play. Do not add customization walls.
- **F-billing:** Companies can use the same free login. No Stripe, no seats, no "hire team" this ship.

## Out of scope

Stripe, hire team, live share, KNIME, SQL as home, Spark, Datly-Web as a second chart app.
