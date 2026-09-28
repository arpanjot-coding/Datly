"""SELECT-only probe/fetch compilers and SQL-looking source_table refusal."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from data_formulator.data_loader import probe_utils
from data_formulator.data_loader.mssql_data_loader import MSSQLDataLoader
from data_formulator.data_loader.mysql_data_loader import MySQLDataLoader
from data_formulator.data_loader.postgresql_data_loader import PostgreSQLDataLoader
from data_formulator.data_loader.probe_utils import (
    assert_source_table_identifier,
    compile_probe_sql,
    refuse_source_write_sql,
)

pytestmark = [pytest.mark.backend]


class TestAssertSourceTableIdentifier:
    def test_accepts_dotted_table(self):
        assert assert_source_table_identifier("public.orders") == "public.orders"

    def test_accepts_table_named_grant(self):
        assert assert_source_table_identifier("public.grant") == "public.grant"

    def test_refuses_select_snippet(self):
        with pytest.raises(ValueError, match="not SQL"):
            assert_source_table_identifier("SELECT * FROM public.orders")

    def test_refuses_semicolon(self):
        with pytest.raises(ValueError, match="not SQL"):
            assert_source_table_identifier("public.orders; DROP TABLE x")

    def test_refuses_space_for_sql_loaders(self):
        with pytest.raises(ValueError, match="not SQL"):
            assert_source_table_identifier("public orders")

    def test_allow_spaces_for_file_paths(self):
        assert (
            assert_source_table_identifier("my file.csv", allow_spaces=True)
            == "my file.csv"
        )

    def test_allow_spaces_still_refuses_select(self):
        with pytest.raises(ValueError, match="not SQL"):
            assert_source_table_identifier(
                "SELECT * FROM t", allow_spaces=True,
            )


class TestRefuseSourceWriteSql:
    def test_allows_select(self):
        sql = 'SELECT "region" FROM t LIMIT 10'
        assert refuse_source_write_sql(sql) == sql

    def test_allows_select_from_grant_table(self):
        sql = 'SELECT * FROM "grant" LIMIT 1'
        assert refuse_source_write_sql(sql) == sql

    @pytest.mark.parametrize(
        "sql",
        [
            "DROP TABLE t",
            "DELETE FROM t",
            "UPDATE t SET x = 1",
            "INSERT INTO t VALUES (1)",
            "TRUNCATE TABLE t",
            "ALTER TABLE t ADD c INT",
            "COPY t FROM STDIN",
            "ATTACH 'other.db'",
            "GRANT SELECT ON t TO u",
        ],
    )
    def test_refuses_write_verbs(self, sql):
        with pytest.raises(ValueError, match="refused|only SELECT"):
            refuse_source_write_sql(sql)

    def test_refuses_second_statement(self):
        with pytest.raises(ValueError, match="single SELECT"):
            refuse_source_write_sql("SELECT 1; DROP TABLE t")


class TestCompileProbeSqlReadonly:
    def test_sample_projection_is_select(self):
        sql = compile_probe_sql({"columns": ["region"]}, out_limit=10)
        assert sql == 'SELECT "region" FROM t LIMIT 10'

    def test_refuses_write_smuggled_in_relation(self):
        with pytest.raises(ValueError):
            compile_probe_sql(
                {"columns": ["a"]},
                out_limit=1,
                relation="t; DROP TABLE users",
            )


class TestPostgresReadOnlyOptions:
    def test_options_keep_encoding_and_set_read_only(self):
        loader = PostgreSQLDataLoader.__new__(PostgreSQLDataLoader)
        loader.host = "localhost"
        loader.port = "5432"
        loader.user = "u"
        loader.password = ""
        kwargs = loader._connection_kwargs("postgres")
        assert "client_encoding=UTF8" in kwargs["options"]
        assert "default_transaction_read_only=on" in kwargs["options"]
        assert kwargs["client_encoding"] == "UTF8"

    def test_resolve_refuses_workflow_sql(self):
        loader = PostgreSQLDataLoader.__new__(PostgreSQLDataLoader)
        loader.database = "analytics"
        with pytest.raises(ValueError, match="not SQL"):
            loader._resolve_source_table("SELECT * FROM public.orders")


class TestMysqlReadOnlySession:
    @pytest.mark.known_failing
    def test_connect_kwargs_include_read_only_session(self, monkeypatch):
        captured: dict = {}

        def fake_connect(**kwargs):
            captured.update(kwargs)
            return MagicMock()

        monkeypatch.setattr(
            "data_formulator.data_loader.mysql_data_loader.pymysql.connect",
            fake_connect,
        )
        MySQLDataLoader({"host": "h", "user": "u", "password": "p"})
        assert captured["init_command"] == "SET SESSION TRANSACTION READ ONLY"


class TestMssqlApplicationIntent:
    @pytest.mark.known_failing
    def test_connection_string_sets_application_intent(self, monkeypatch):
        captured: dict = {}

        def fake_connect(conn_str, timeout=None):
            captured["conn_str"] = conn_str
            return MagicMock()

        monkeypatch.setattr(
            "data_formulator.data_loader.mssql_data_loader.mssql_python.connect",
            fake_connect,
        )
        MSSQLDataLoader({
            "server": "localhost",
            "user": "sa",
            "password": "p",
            "database": "app",
        })
        assert "ApplicationIntent=ReadOnly" in captured["conn_str"]
