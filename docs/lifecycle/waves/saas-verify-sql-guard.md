# Independent verify: C-sql-guard

Slice: `C-sql-guard` in `docs/lifecycle/TRACKING.md` (SELECT-only SQL API + parser) and F-saas-W Phase E (`docs/plans/saas-2026-08-20.md`). Writer sidecar `docs/test-runs/.worker-done/C-sql-guard.md` (`done: true`; lists `sql_guard.py` only). Verifier did not write the slice. Static read of source only. Pytest not re-run. No Accept.

Handoff residual said regex allowlist, not sqlglot. That is stale. Current `sql_guard.py` imports and parses with sqlglot. Tests in source are nine functions; not re-executed here.

Phase E: Read-only SELECT (or WITH...SELECT) on workspace parquet views. Timeout, row cap, parser allowlist. No DDL/ATTACH/COPY. No writes to the Datly tree.

| Id | Verdict | vs plan | Evidence | Fix if fail |
|----|---------|---------|----------|-------------|
| A1 SELECT or WITH...SELECT only | pass | Matches Phase E read-only SELECT (or WITH...SELECT). UNION/EXCEPT/INTERSECT of SELECTs also allowed (extra, still select-like). | `guard_sql` parses one statement (`sql_guard.py` 100-131). `_is_select_like` accepts `exp.Select`, `With` whose body is select-like, `Union`/`Except`/`Intersect`, subquery/paren (`83-93`). Empty/non-string and non-select roots return "Only SELECT statements are allowed" (`102-103`, `128-129`). Tests: `test_allows_select` `SELECT 1`; `test_allows_with_select` (`tests/backend/test_sql_guard.py` 4-11). Route still wraps as subquery (`sql_query.py` 48). | n/a |
| A2 Forbidden DDL/DML/ATTACH/COPY/writes refused | pass | Matches Phase E no DDL/ATTACH/COPY and P0-6 named verbs. | Deny keys: INSERT UPDATE DELETE MERGE CREATE DROP ALTER ATTACH DETACH COPY EXPORT IMPORT INSTALL LOAD PRAGMA CALL SET VACUUM CHECKPOINT (`sql_guard.py` 9-31). Walk rejects those types plus `exp.Command` verbs and `SELECT INTO` (`96-97`, `121-126`). Tests reject DROP DELETE UPDATE INSERT ATTACH COPY and `SELECT 1; SELECT 2` (`test_sql_guard.py` 14-47). Unparseable SQL is refused (`111-112`). | n/a |
| A3 Timeout | fail | Missing vs Phase E "Timeout" and saas-be-expert "with timeout". TRACKING `C-sql-guard-v` notes "timeout later"; that is a deferral, not a plan change. | `sql_query.py` has no timeout, interrupt, `query_progress`, or statement_timeout. `create_duckdb_conn_with_parquet_views` is `duckdb.connect(":memory:")` with no timer (`agent_utils_sql.py` 28). Grep of sql route/helper for timeout/interrupt is empty. | Set a per-request DuckDB timeout or interrupt before `execute`. Add a test that a long query stops. |
| A4 Row cap | pass | Matches Phase E row cap. | Default 1000, max 5000, clamped `max(1, min(limit, _MAX_LIMIT))` (`sql_query.py` 20-21, 37-42). Fetch `limit+1` then trim and set `truncated` (`48`, `59-61`). | n/a |
| A5 Parser allowlist (regex or real parser) | pass | Matches Phase E parser allowlist. P0-6 wants a real parser (example sqlglot). Handoff "regex not sqlglot" is wrong vs current source. | `import sqlglot` / `sqlglot.parse(..., read="duckdb")` with fallback parse (`sql_guard.py` 5-7, 107-110). Allowlist is AST statement shape, not start-anchor regex. `sqlglot` already in `pyproject.toml` 36. Tests import `guard_sql` only; they do not assert parser library. | n/a |
| A6 Endpoint uses workspace parquet views (reuse helper), not a second engine | pass | Matches saas-be-expert: one analysis endpoint against `create_duckdb_conn_with_parquet_views`. Reuse helper. No second engine. | `POST /api/sql/query` (`sql_query.py` 18-25). `app.py` 307-308 registers `sql_bp`. `get_workspace` + `list_tables` then `create_duckdb_conn_with_parquet_views(workspace, input_tables)` (`44-47`). Helper builds in-memory DuckDB views over `read_parquet` (`agent_utils_sql.py` 14-35). No Spark, no extra catalog browser, no second SQL engine. | n/a |
| A7 No writes to the Datly application tree via SQL | pass | Matches Phase E and F-sql-guard "no writes to the Datly tree" for named write verbs. Residual: conn is not read-only; path table functions are not blocked. | Write statements are refused by the AST walk (A2). User SQL is executed only as a SELECT subquery (`sql_query.py` 48). Views are in-memory over workspace parquet paths the server supplies (`agent_utils_sql.py` 32-34), not client paths. No SQL UI that can save files. Connection is still `duckdb.connect(":memory:")` without `read_only=True`. | Residual: open a read-only conn after views exist; reject path-taking functions (`read_csv`, `read_parquet` with client paths, `COPY` via functions). |
| X1 Not SQL-as-home. Not a workbench. No Spark. No KNIME. No DataGrip clone | pass | Matches plan out of scope, D-sql-drawer, and this slice: no C-sql-drawer UI required. | Delivered files are guard, Flask route, blueprint register, unit tests. No SqlDrawer / workbench / catalog browser under `src/`. Grep of product `src` and `py-src` for Spark/KNIME/DataGrip clones is empty. SQL is an API, not home. | n/a |
| P06-readonly-conn | fail | Missing vs P0-6 "Prefer DuckDB read-only config". Not a named A-id fail of SELECT-only. | `duckdb.connect(":memory:")` (`agent_utils_sql.py` 28) then `CREATE VIEW` (34). User SQL is filtered, but the same conn can write if a verb or function slips the parser. | Create views, then run the user statement on a read-only handle, or set DuckDB config that forbids filesystem writes. |
| P06-bind-paths | fail | Missing vs P0-6 bind parameters, views only, no client filesystem paths. | User string is interpolated into `SELECT * FROM ({sql.strip().rstrip(';')}) AS _df_q LIMIT {limit + 1}` (`sql_query.py` 48). Table names in SQL are not membership-checked against `workspace.list_tables()` (`45-46`). `read_csv` / client `read_parquet` / absolute paths are not in the deny list. | Keep views from loaded tables only. Reject path-taking functions. Do not take filesystem paths from the client. |
| P06-memory-cap | fail | Missing vs P0-6 memory cap. | No DuckDB memory_limit on the query conn. | Set a per-request memory limit. |

## Missing / wrong / extra

- Missing vs Phase E: query timeout (A3). Memory cap (P0-6, not named A).
- Missing vs P0-6: DuckDB read-only for the user statement; table membership; reject path-taking functions.
- Missing tests: no Flask test for `POST /api/sql/query`; no tests for CREATE/PRAGMA/SET/CHECKPOINT/SELECT INTO/timeout. Writer/HANDOFF claimed 9 passed; source has those nine functions. Not re-run.
- Wrong vs handoff: residual "regex not sqlglot" is stale. Source is sqlglot.
- Extra vs a guard-only file: `routes/sql_query.py` execute API (writer sidecar omitted it). Identity required (`sql_query.py` 26-28). JSON body required (29-30). Errors log exception type only (54). `_json_cell` stringifies non-JSON cells (68-71). UNION/EXCEPT/INTERSECT allowed. CSRF is not on this POST (P0-3 lives on C-auth-session).

## Residual risks

- No timeout: a heavy SELECT can hold the worker until DuckDB finishes.
- In-memory DuckDB is read-write. `SELECT ... FROM read_csv('...')` can read host files even when COPY/ATTACH are blocked.
- No memory cap.
- No Flask-level test of the route.
- Writer sidecar lists only `sql_guard.py`; `sql_query.py` and `app.py` are also in the slice.
- Drawer UI is `C-sql-drawer`, out of scope. This slice is API + guard.

## Slice outcome

fail. Named A3 (timeout) is missing vs Phase E. A1 A2 A4 A5 A6 A7 X1 pass in source. Parser is sqlglot, not regex.

Verifier did not Accept. Manager decides.
