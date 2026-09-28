from data_formulator.sql_guard import guard_sql


def test_allows_select():
    ok, _ = guard_sql("SELECT 1")
    assert ok is True


def test_allows_with_select():
    ok, _ = guard_sql("WITH x AS (SELECT 1 AS a) SELECT a FROM x")
    assert ok is True


def test_rejects_drop():
    ok, reason = guard_sql("DROP TABLE t")
    assert ok is False
    assert "SELECT" in reason


def test_rejects_delete():
    ok, _ = guard_sql("DELETE FROM t")
    assert ok is False


def test_rejects_update():
    ok, _ = guard_sql("UPDATE t SET a = 1")
    assert ok is False


def test_rejects_insert():
    ok, _ = guard_sql("INSERT INTO t VALUES (1)")
    assert ok is False


def test_rejects_attach():
    ok, _ = guard_sql("ATTACH 'foo.db'")
    assert ok is False


def test_rejects_copy():
    ok, _ = guard_sql("COPY t TO 'out.csv'")
    assert ok is False


def test_rejects_multi_statement():
    ok, _ = guard_sql("SELECT 1; SELECT 2")
    assert ok is False
