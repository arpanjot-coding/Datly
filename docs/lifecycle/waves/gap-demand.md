# User demand: data IDEs, BI desktops, notebooks, SQL clients, AI analytics

Demand from practitioners, not vendor feature pages. Collected 2026-08-19. Do not treat this file as Datly inventory.

## Search log

Queries run (web_search, open_page / web_fetch, X keyword search):

- Reddit: r/datascience best IDE 2025; r/dataengineering SQL clients / DBeaver; r/tableau future, workarounds, Pulse; r/PowerBI Copilot, crash, DAX, undo, bookmarks, star schema; r/SQL IDE 2025/2026; r/SQLServer SSMS restore / crash; r/excel CSV destroy; r/Looker visualization; r/analytics unused dashboards / ThoughtSpot; r/RStudio Positron; r/MachineLearning Jupyter; Hex notebook; Databricks notebooks; Colab; ChatGPT code interpreter.
- HN: Jupyter hate (31918046, 32601703, 36315796, 38971966, 19859913); DBeaver (39660592, 18935138); Positron; Hex (26648270); Launch HN Livedocs (46964162); VS Code notebooks.
- Reviews: G2 DBeaver / Tableau; Capterra DBeaver / Tableau / pgAdmin / DataGrip; TrustRadius DBeaver; dbvis.com synthesis of G2/Capterra/TrustRadius (vendor blog; used only for published rating counts, not as demand).
- Other: PLOS Computational Biology gene-name Excel paper; Jupyter Discourse slow UI; GitHub dbeaver discussion 19162; Fabric community Power BI version control; mutto.fyi Power BI missing (single practitioner blog, low weight); X latest `(Power BI OR Tableau OR Jupyter OR DBeaver OR DataGrip) (hate OR missing OR slow OR crash)`.

Readable (full or long excerpts):

- https://old.reddit.com/r/dataengineering/comments/1q04miu/fellow_des_whats_your_goto_database_client_these/ (78 comments)
- https://old.reddit.com/r/SQL/comments/1ng501x/current_best_free_ide_for_mssql_20252026/ (33 comments)
- https://old.reddit.com/r/excel/comments/1dye1cd/what_is_the_point_of_supporting_csv_format_when/ (86 comments, 187 pts)
- https://old.reddit.com/r/PowerBI/comments/1jg1skw/is_it_only_me_or_latest_pbi_desktop_version_is/ (46 comments)
- https://old.reddit.com/r/RStudio/comments/1msbm1o/positron_vs_rstudio/ (54 comments)
- https://old.reddit.com/r/Looker/comments/1cierak/whats_the_alternative_very_tired_of_looker/
- https://old.reddit.com/r/analytics/comments/1joo998/alright_gotta_ask_anyone_else_sick_of_building/ (110 comments, 282 pts)
- https://old.reddit.com/r/SQLServer/comments/1gzkam7/ssms_ventrant/
- HN items 31918046, 39660592, 18935138, 36315796, 38971966, 32601703, 26648270, 46964162
- https://github.com/orgs/dbeaver/discussions/19162
- https://discourse.jupyter.org/t/cripplingly-slow-ui-am-i-the-only-one/5351
- https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1008984
- https://community.fabric.microsoft.com/discussions/power-bi-designer/power-bi-version-control/1692557
- https://mutto.fyi/posts/2023/03/what-power-bi-is-missing/ (practitioner blog, not research)

JS-blocked or empty shell (noted; used Google SERP snippets only where quoted):

- https://www.g2.com/products/dbeaver/reviews?qs=pros-and-cons (enable JS)
- https://www.g2.com/products/tableau/reviews
- https://www.capterra.com/p/210182/DBeaver/reviews/ (fetch failed)
- https://www.capterra.com/p/208764/Tableau/reviews/ (fetch failed)
- https://www.trustradius.com/products/dbeaver/reviews (reviews list did not load)

Login-walled on old.reddit (SERP snippets used, marked):

- r/datascience best IDE 2025 (`1l40tho`), Jupyter hate (`11pjem9`), Hex (`17eu7oy`)
- r/tableau future (`1czgfra`), workarounds (`18jumqs`), Pulse (`1e6y3k1`, `1i99yll`)
- r/PowerBI Copilot (`1ot9f51`, `1crtxtr`), DAX (`1ks1963`, `tz5560`), bookmarks (`1lkfudd`), frustrations (`1kspol1`, `1kl0dy0`)
- r/SQLServer restore tabs (`1c1dxnt`)
- r/ChatGPT code interpreter timeout (`1fus667`)
- r/BusinessIntelligence ThoughtSpot / Looker / Tableau (`1ie5i62`, `1enz06g`)

X: one relevant recent post (DBeaver slow with many connections). Rest noise.

Vendor "users want X" blogs excluded unless they quote reviews. dbvis.com comparison is vendor-authored; ratings counts are public, qualitative "reality check" lines are not treated as demand.

## Demand table

| Ask / pain | Source URL | Weight | Cluster (chrome / analysis / share / platform / skip) |
| --- | --- | --- | --- |
| SQL client UI feels dated and sluggish on large schemas; users still stay because it is free and does not shove AI | https://old.reddit.com/r/dataengineering/comments/1q04miu/fellow_des_whats_your_goto_database_client_these/ | high | chrome |
| Fast schema exploration, context-aware autocomplete, multi-database (Postgres, MySQL, BigQuery) in one client | same thread (OP asks) | high | chrome |
| Generic JDBC clients cannot dry-run / cost-estimate warehouse queries (BigQuery bytes billed); 6-year-old gap still open | same thread | medium | analysis |
| Browser SQL IDE rejected: no local install, no custom font/LSP/formatter/vi, GDPR "I won't grant any website access to a prod system" | same thread | high | chrome |
| DBeaver: ugly but works every time, free, no ads / upgrade nags disrupting workflow (32+ upvotes) | same thread | high | chrome |
| DataGrip: better autocomplete and git projects; too heavy / ugly-on-HiDPI / expensive if not already on JetBrains pack | same thread; https://news.ycombinator.com/item?id=18935138 | high | chrome |
| VS Code as SQL client: extensions for everything, but "not great for daily heavy SQL" vs dedicated tools | https://old.reddit.com/r/SQL/comments/1ng501x/current_best_free_ide_for_mssql_20252026/ | medium | chrome |
| Hyper-clean SQL UI (Beekeeper) feels unproductive with multiple panes; distinct windows in SSMS/DBeaver easier to locate | same r/SQL thread | medium | chrome |
| SSMS: bloated, slow, blocky, weak intellisense; people still return because it is the official tool. Azure Data Studio retired; VS Code mssql "does not hit the spot" | same; https://www.reddit.com/r/dotnet/comments/1rh1iq9/azure_data_studio_retired_today_my_replacement_vs/ | high | chrome |
| SSMS: restore unsaved query tabs like VS Code (paid Redgate SQL Prompt does this) | https://www.reddit.com/r/SQLServer/comments/1c1dxnt/ssms_keep_unsaved_querys_open_like_in_vscode/ (login-walled; SERP) | medium | chrome |
| SSMS freeze/crash on idle, tab undock, large result grids, MFA/idle Azure connections; "takes forever to open" | https://old.reddit.com/r/SQLServer/comments/1gzkam7/ssms_ventrant/ | high | chrome |
| DBeaver Mac UI sludge: expanding navigator, moving tabs, window resize all slower than JetBrains; crash when undocking tab | https://github.com/orgs/dbeaver/discussions/19162 | medium | chrome |
| DBeaver RAM (~480 MB for one small Postgres) and "classic FOSS UI clunk"; Java/Eclipse HiDPI pain | https://news.ycombinator.com/item?id=18935138 | high | chrome |
| Smoke test for DB GUI: how many clicks vs `psql; \dt+; SELECT * FROM X` to see table data | same HN thread | high | chrome |
| TablePlus/Sequel Pro crowd: cannot live with "heavy" clients; want native speed, instant connect, no progress bars | same HN; TablePlus "2-tab free limit" is a frequent complaint in review roundups | medium | chrome |
| G2 DBeaver cons (JS-blocked page; SERP quotes): clunky dated Java UI; tabs/connections messy; slow on large datasets; connection issues | https://www.g2.com/products/dbeaver/reviews?qs=pros-and-cons | high | chrome |
| G2 DBeaver aggregated cons labels: Slow Performance, Poor Interface Design | https://www.g2.com/products/dbeaver/reviews?page=7&qs=pros-and-cons | high | chrome |
| Capterra DBeaver (page fetch failed; SERP): UI complex for new users; flaky UI on Linux; slowing down | https://www.capterra.com/p/210182/DBeaver/reviews/ | medium | chrome |
| Capterra DataGrip: needs more intellisense and more RAM | https://www.capterra.com/p/239237/DataGrip/reviews/ | low | chrome |
| Capterra pgAdmin: slow and resource-heavy on large DBs; functional but dated interface | https://www.capterra.com/p/210772/pgAdmin/reviews/ | medium | chrome |
| pgAdmin 4 splash/server fail; "such a shit show" (HN, repeated) | https://news.ycombinator.com/item?id=18935138 | medium | chrome |
| HeidiSQL: 1-second launch praised; XP-era UI and crash pattern | vendor synthesis of reviews at https://www.dbvis.com/thetable/database-clients-a-user-rating-comparison/ (not used as demand); HN Wine/Linux gap is demand | medium | chrome |
| X 2026-08: DBeaver with too many connections open is slow and stuck; looking for lighter vim-capable client | https://x.com/the_void_state/status/2090069557302202369 | low | chrome |
| Keyboard-first SQL: slash commands, never leave keyboard, autocomplete SELECT from table pick | HN SeekWell comment on DBeaver 2019 thread | low | chrome |
| Vi/vim mode in SQL client (Vrapper in DBeaver; "no vi mode" on browser IDE) | r/dataengineering DBeaver thread; HN Eclipse plugins | medium | chrome |
| Desktop local fonts, ligatures, formatter, LSP: browser sandbox cannot do this | r/dataengineering DBeaver thread | medium | chrome |
| Excel double-click on CSV silently coerces types; save overwrites source. Large numbers, leading zeros, IDs destroyed. 187 pts / 86 comments | https://old.reddit.com/r/excel/comments/1dye1cd/what_is_the_point_of_supporting_csv_format_when/ | high | chrome |
| Same Excel coercion: gene symbols SEPT/MARCH/DEC to dates; 30.9% of papers with Excel gene lists still wrong (2014-2020) | https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1008984 | high | chrome |
| Excel not a CSV viewer; "please STOP HELPING" (r/datascience, login-walled) | https://www.reddit.com/r/datascience/comments/1dsnbww/youre_not_helping_excel_please_stop_helping/ | medium | chrome |
| Excel 1,048,576 row cap; "open large CSV" is a whole product category | https://rowzero.io/blog/open-big-csv ; https://www.moderncsv.com/ | medium | chrome |
| Jupyter hidden state / out-of-order execution: death by papercuts; reports-first not code-first; unusable outside the notebook | https://news.ycombinator.com/item?id=31918046 | high | analysis |
| Restart kernel and run-all as hygiene; want editors that light up out-of-order errors | https://news.ycombinator.com/item?id=32601703 | high | analysis |
| .ipynb JSON unreadable; git diffs mix outputs; "you can't use git" would get tomatoes from developers | same HN 32601703 | high | share |
| Marimo pitch (and HN agreement): no hidden state, stored as Python, executable as script, deployable as app | https://news.ycombinator.com/item?id=38971966 | high | analysis |
| Notebook share is screenshots; no good way to plug new data without copy-paste whole notebook; promoting cells to a package is high-friction | https://news.ycombinator.com/item?id=36315796 (193 comments) | high | share |
| JupyterLab UI lag: seconds to scroll 50-cell notebook, 1s keypress lag, moving tabs 10s; worse with plots and many open notebooks | https://discourse.jupyter.org/t/cripplingly-slow-ui-am-i-the-only-one/5351 | high | chrome |
| Hate browser Jupyter; VS Code notebook is "more fluent" but notebook UI performance "terrible" for some; shortcuts "half in focus the wrong way" | HN 31918046, 36315796, 36886605 | high | chrome |
| VS Code Jupyter: latest updates make notebooks really slow; keyboard shortcuts stop working until restart; vim in notebook slow | https://www.reddit.com/r/vscode/comments/1o5mcai/vs_code_latest_update_make_jupyter_notebooks/ ; https://www.reddit.com/r/vscode/comments/1riw8ob/bug_in_jupyter_notebook_keyboard_shortcuts_not/ | medium | chrome |
| Environment vs Jupyter's own deps conflict; kernels/envs painful to manage | HN 36315796 | medium | analysis |
| Inline plots/tables and a live kernel that keeps expensive loads in memory (the reason people tolerate notebooks) | HN 31918046 aldanor | high | analysis |
| Positron: inline figure rendering in Quarto/Rmd is a deal-breaker missing vs RStudio; library pane missing; workspace save-state missing | https://old.reddit.com/r/RStudio/comments/1msbm1o/positron_vs_rstudio/ ; https://www.reddit.com/r/RStudio/comments/1msbm1o/positron_vs_rstudio/ | high | chrome |
| Positron: better data viewer (histograms, filter), faster console print, console restart without killing the app, git easier than RStudio | same Positron thread | medium | chrome |
| RStudio data viewer "awful"; people keep the dataset open in Excel to see it | same | medium | chrome |
| Power BI Desktop: crash several times/day on save, publish, copy tables; "Working on it" hang; auto-recover empty or crashes; files corrupt | https://old.reddit.com/r/PowerBI/comments/1jg1skw/is_it_only_me_or_latest_pbi_desktop_version_is/ | high | chrome |
| Power BI is a RAM hog; commenters recommend 32 GB; OneDrive-saved files crash more than local | same | high | chrome |
| Monthly feature drops ship monthly bugs; "updates no one asked for" | same | high | chrome |
| Power Query: no undo. "It's the year of our lord 2025 name any other program that doesn't have an undo button" (9+ upvotes); deleting a step cannot bring it back | https://www.reddit.com/r/PowerBI/comments/1kl0dy0/what_frustrates_you_about_power_bi/ | high | chrome |
| Ctrl+Z on report canvas is unreliable / hated; Power Query Advanced Editor missing Ctrl+F and multi-window | https://www.reddit.com/r/PowerBI/comments/1jzjbgz/is_it_just_me_or_has_ctrlz_become_the_hated_enemy/ ; https://www.reddit.com/r/PowerBI/comments/xvz1gv/rant_its_2022_and_cant_believe_power_bi_cant/ | high | chrome |
| Two languages tax: DAX for model, M/Power Query for transform; "if you don't like DAX, hop into Power Query where we force a completely different language" | https://www.reddit.com/r/PowerBI/comments/tz5560/why_is_everything_so_unnecessarily_difficult_in/ (login-walled; SERP) | high | analysis |
| DAX filter/row context is "the most frustrating language"; Copilot invents functions that do not exist; "wrong or incomplete 95% of the time" | https://www.reddit.com/r/PowerBI/comments/1ot9f51/what_are_your_views_on_power_bi_copilot_have_you/ ; https://www.reddit.com/r/PowerBI/comments/1crtxtr/disappointed_with_co_pilot/ | high | skip |
| Copilot/Q&A cannot replace a driver; ChatGPT outside PBI often better at DAX than in-product Copilot | same | high | skip |
| Bookmarks: "THE worst to maintain. I hate them" | https://www.reddit.com/r/PowerBI/comments/1lkfudd/dont_use_bookmarks/ | medium | analysis |
| Star schema required before charts behave; beginners want to chart a flat table; DAX auto-exist punishes non-star models | https://www.reddit.com/r/PowerBI/comments/11pi10o/can_you_still_use_power_bi_without_a_star_schema/ | high | analysis |
| PBIX binary: git cannot diff/merge; "What we really need is git integration including all the meta data" | https://community.fabric.microsoft.com/discussions/power-bi-designer/power-bi-version-control/1692557 | high | platform |
| Packed UI: "Power BI is like a smartphone packed with features; if you are not familiar with all the buttons, it can be overwhelming" | https://www.reddit.com/r/PowerBI/comments/tz5560/why_is_everything_so_unnecessarily_difficult_in/ | medium | chrome |
| Visual formatting inconsistent across visuals; drag/select of text boxes painful | https://www.reddit.com/r/PowerBI/comments/xvz1gv/rant_its_2022_and_cant_believe_power_bi_cant/ | medium | chrome |
| Sign-in nags / cannot skip; SharePoint/OneDrive preview prompts | r/PowerBI crash thread | medium | chrome |
| Tableau: everything is a workaround; UI outdated; waterfall and other chart types still missing years later | https://www.reddit.com/r/tableau/comments/1czgfra/what_is_the_future_of_tableau/ (login-walled; SERP + crawl snippet) | high | analysis |
| Tableau users: "If they continue focusing on AI, no one will want to use it anymore"; "Hoping 2025 they get back to basics and the HUGE list of ideas" | same | high | skip |
| Tableau Pulse: marketing / exec eye candy; cannot centrally turn off email digest of business data | https://www.reddit.com/r/tableau/comments/1e6y3k1/pulse_is_just_marketing/ ; https://www.reddit.com/r/tableau/comments/1hak3dx/thoughts_on_tableau_pulse/ | medium | skip |
| Tableau vs Power BI: Tableau is a data canvas (drag metrics/dims); PBI is a parameterized chart maker. PBI drag-drop is not actually easy; Tableau LOD easier than DAX | https://www.reddit.com/r/tableau/comments/1g96hkc/question_for_tableau_veterans_who_have_used_power/ ; https://www.reddit.com/r/tableau/comments/ty1kd2/things_tableau_does_better_than_powerbi/ | high | analysis |
| Tableau: slow on large datasets / extracts; expensive licenses; steep learning curve (G2/Capterra SERP, JS-blocked full pages) | https://www.g2.com/products/tableau/reviews ; https://www.capterra.com/p/208764/Tableau/ | high | chrome |
| Tableau complicated for teams; lots of LOD/table-calc workarounds; "Why is everything in Tableau harder than necessary?" | https://www.reddit.com/r/tableau/comments/saf6al/why_is_everything_in_tableau_harder_than_necessary/ | medium | analysis |
| Looker: love semantic layer, hate visualization (tooltips, period-over-period need a second chart config language); expensive; lock-in | https://old.reddit.com/r/Looker/comments/1cierak/whats_the_alternative_very_tired_of_looker/ | medium | analysis |
| Looker: change vis tool and you lose the model; "expensive as hell" | https://www.reddit.com/r/Looker/comments/1g0mvq3/what_is_the_future_of_looker_in_your_opinion/ | medium | platform |
| Dashboards nobody uses: 2/day built, ~5 views/month; stakeholders want "just ask a question" | https://old.reddit.com/r/analytics/comments/1joo998/alright_gotta_ask_anyone_else_sick_of_building/ | high | share |
| Chat-with-data / ThoughtSpot / Looker Conversational: fine for `x by y in z timeframe` on a clean model; "garbage" for root-cause / messy questions; "kinda blah" | same (62-upvote comment + OP) | high | skip |
| Finding existing reports fails; people request the same thing 3 months later with minor variations | same thread | medium | share |
| Business wants a story, not another dashboard | same | medium | share |
| Hex: SQL+Python cloud, schedules, secrets; Reddit ask "why would anyone start"; HN clone fatigue; agent warehouse queries can burn Snowflake $ | https://www.reddit.com/r/datascience/comments/17eu7oy/why_would_anyone_start_to_use_hex_whats_the_need/ ; https://news.ycombinator.com/item?id=46964162 | medium | platform |
| Cloud notebook / AI workspace: login wall, credits expire before one request, "chaos isn't what I want around my data tools" | https://news.ycombinator.com/item?id=46964162 | medium | skip |
| AI analytics without a locked semantic layer: answers drift (revenue defined differently tomorrow); Julius-class tools called out in comparison blogs quoting this | https://www.blazesql.com/blog/julius-ai-alternatives (secondary; treat as low unless user quotes) | low | skip |
| ChatGPT code interpreter: session timeout, re-upload files, "file is too large" on download, sandbox limits | https://www.reddit.com/r/ChatGPT/comments/1fus667/code_interpreter_timeout_and_reupload_frustrations/ ; https://community.openai.com/t/this-gpt-4-code-interpreter-beta-has-timed-out/303745 | medium | skip |
| Databricks: cluster start minutes; notebook ETL hard to debug/reuse; bill explosions; not a day-one desktop | https://www.reddit.com/r/dataengineering/comments/10t7xs0/how_to_deal_with_cluster_startup_time_in_azure/ ; https://www.reddit.com/r/dataengineering/comments/yyzzfb/for_those_who_use_databricks_do_you_use_notebooks/ | medium | platform |
| SQL notebooks instead of unlinked query tabs (Databricks/VS Code); missing in classic clients | r/SQL 1ng501x comment | medium | analysis |
| Offline / air-gapped: "does it work in a completely isolated internet free environment?" asked of new SQL clients | r/dataengineering DBeaver thread | medium | chrome |
| Privacy/ToS: TeamSQL email-gate; browser tools asking for prod credentials; Pulse emailing KPIs | HN 18935138; Tableau Pulse thread | medium | chrome |
| Git for SQL repos is a real daily ask inside DataGrip; git for BI binaries is a different (platform) product | r/dataengineering DataGrip comments; Fabric git threads | medium | platform |
| Best IDE 2025 r/datascience: thread exists (login-walled); Positron/VS Code/Jupyter/PyCharm in SERP, not fully readable here | https://www.reddit.com/r/datascience/comments/1l40tho/what_is_the_best_ide_for_data_science_in_2025/ | low | chrome |

## Synthesis

- Day one is chrome, not a platform. People notice within minutes: does the window feel native-fast or Java/Electron sludge; can they open a CSV without type coercion; can they see a table in two clicks; do panes/tabs/undo/keyboard work; does save crash. DBeaver/SSMS/Power BI Desktop/JupyterLab threads are overwhelmingly about lag, RAM, freezes, and dated or packed chrome. That is what they will miss if it is absent.

- File open is a trust event. Excel's CSV double-click destroying IDs, leading zeros, and gene names is a 20-year, scientifically measured pain (PLOS: 30.9% of Excel gene-list papers still wrong). A data desktop that "helps" by guessing types on open will be hated immediately. Power Query's "just import as text" is the same lecture users reject.

- Undo, session restore, and crash recovery are table stakes that BI/SQL tools still fail. Power Query has no undo in 2025; SSMS users pay Redgate to keep unsaved tabs; Power BI auto-recover files are empty or crash; Jupyter/VS Code lose cell edits to focus bugs. This is daily-driver chrome, not a nice-to-have.

- Result grids and large files are the other day-one cliff. DBeaver/G2: slow and messy on large datasets. SSMS: large grids freeze the app. Excel: 1M-row wall. JupyterLab: plots and 50+ cells kneecap the whole UI. People will try a 200k-row CSV or a fat query on hour one.

- Schema-aware autocomplete and a navigator that is fast on large catalogs is the SQL daily driver. Generic pretty UIs lose to "ugly but it works" unless they also do context completion. Warehouse users also want cost/dry-run before run; that is analysis, but it shows up on day one for BigQuery/Snowflake people.

- Hidden notebook state is the analysis complaint that became a product category (Marimo, jupytext, `# %%` scripts). Users still want the live kernel and inline plots (that is why notebooks exist). They hate unreproducible cells, JSON git diffs, and promoting a cell to a real function. Avoid hidden state; keep the kernel and the grid.

- Model-first tax is the BI equivalent. Power BI wants a star schema before DAX behaves; Looker wants LookML before a decent tooltip; Copilot/Pulse/ThoughtSpot want a semantic layer then still fail on messy questions. Analysts coming from Excel/Tableau canvas expect to drag a column and see a chart. Forcing a model, two languages (M + DAX), or bookmarks-as-navigation on day one is a known hate.

- Packed UI and AI nags are actively disliked. DBeaver is loved *because* it does not shove AI. Tableau regulars scroll past Pulse. Power BI Copilot invents DAX. SSMS/PBI monthly releases feel like bug delivery. A dense Eclipse tree is one failure mode; a hyper-clean single-pane toy is the other (Beekeeper vs DBeaver pane comment). Distinct, zoomable panes (RStudio panel zoom) beat both.

- Cloud ToS and browser-only are day-one deal-breakers for a large DE/SQL cohort. They will not paste prod credentials into a website (GDPR called out by name). They ask for offline, local fonts, local LSP, air-gap. Hex/Livedocs/Colab/ChatGPT interpreter sit in "share/platform/skip": useful for some teams, toxic as a default because of login walls, idle timeouts, credit meters, and data leaving the machine.

- Loud but a different product: git for binary PBIX/TWBX, Slack, lakehouse, dbt/semantic layer, scheduled cloud jobs, multiplayer notebooks, publish-to-app, SSO, Fabric/Databricks clusters, "replace dashboards with chat." Those dominate vendor blogs and platform threads. They are real for teams that already have a warehouse and a BI program. They are not what a person feels in the first hour of a desktop data IDE.

- Skip / one-off toys (loud in 2024-2026 launches, weak as daily drivers): in-product Copilot that writes fake DAX; Pulse/Q&A as the product; ThoughtSpot-style NLQ beyond simple aggregations; Hex-clone AI workspaces with credit meters; real-time collab as the headline; notebooks as production ETL (Databricks users already complain about debug/reuse). People ask for answers; they do not trust the toy to be right.

Avoid repeating: hidden notebook state, model-first tax before first chart, packed or nagging UI, cloud ToS / prod-in-the-browser, broken or inconsistent drag-drop/formatting, type-coercing file open, no undo, crashing save, result grids that die on large data, AI that is wrong with confidence.
