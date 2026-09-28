"""Built-in ``web`` / WebDataLoader: registry, SSRF, file + HTML catalog, no crawl."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

import pytest

from data_formulator.data_loader.external_data_loader import ExternalDataLoader
from data_formulator.data_loader.probe_utils import assert_source_table_identifier

pytestmark = [pytest.mark.backend]

PUBLIC_CSV_URL = "https://example.com/sales.csv"
CSV_BYTES = b"a,b\n1,2\n3,4\n"


def _csv_fetch(url: str = PUBLIC_CSV_URL, content: bytes = CSV_BYTES) -> dict:
    return {
        "content": content,
        "content_type": "text/csv",
        "final_url": url,
        "truncated": False,
    }


class TestWebLoaderRegistry:
    def test_web_is_registered_after_import(self):
        from data_formulator.data_loader import DATA_LOADERS

        assert "web" in DATA_LOADERS
        assert DATA_LOADERS["web"].__name__ == "WebDataLoader"

    def test_catalog_policy_is_expensive_never_auto(self):
        from data_formulator.data_loader import DATA_LOADERS

        policy = DATA_LOADERS["web"].CATALOG_CACHE_POLICY
        assert policy.refresh_cost == "expensive"
        assert policy.automatic_refresh == "never"

    def test_auth_mode_is_not_none(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        # mode none would treat web like sample_datasets (always on).
        # User web instances must stay gated by DISABLE_DATA_CONNECTORS.
        assert WebDataLoader.auth_config().get("mode") != "none"

    def test_plugin_override_of_web_is_blocked(self):
        from data_formulator import data_loader as dl

        class FakeWeb(ExternalDataLoader):
            def __init__(self, params=None):
                self.params = params or {}

            @staticmethod
            def list_params():
                return []

            def list_tables(self, table_filter=None):
                return []

            def fetch_data_as_arrow(self, source_table, import_options=None):
                raise NotImplementedError

        assert "web" in dl._BUILTIN_KEYS
        builtin = dl.DATA_LOADERS["web"]
        n_errors = len(dl.PLUGIN_ERRORS)
        try:
            dl._register_plugin_class("web", FakeWeb, Path("web_data_loader.py"))
            assert dl.DATA_LOADERS["web"] is builtin
            assert "web" not in dl.PLUGIN_LOADERS
            added = dl.PLUGIN_ERRORS[n_errors:]
            assert any(e.get("kind") == "override_builtin" for e in added)
            assert any("web" in (e.get("reason") or "") for e in added)
        finally:
            del dl.PLUGIN_ERRORS[n_errors:]


class TestWebConnectionAndSecrets:
    def test_test_connection_rejects_private_url(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        loader = WebDataLoader({"url": "http://127.0.0.1/secret.csv"})
        assert loader.test_connection() is False

    def test_test_connection_rejects_file_url(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        loader = WebDataLoader({"url": "file:///etc/passwd"})
        assert loader.test_connection() is False

    def test_authorization_not_in_get_safe_params(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        loader = WebDataLoader({
            "url": PUBLIC_CSV_URL,
            "authorization": "Bearer secret-token",
            "render": False,
            "format": "csv",
        })
        safe = loader.get_safe_params()
        assert "authorization" not in safe
        assert "secret-token" not in str(safe)
        assert safe.get("url") == PUBLIC_CSV_URL


class TestWebCsvImport:
    def test_mocked_csv_returns_arrow_and_identifier_source_table(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        loader = WebDataLoader({"url": PUBLIC_CSV_URL, "format": "csv"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_csv_fetch(),
        ) as mocked:
            with patch("requests.get") as raw_get:
                tables = loader.list_tables()
                assert len(tables) == 1
                source_table = tables[0]["name"]
                assert source_table == assert_source_table_identifier(source_table)
                assert " " not in source_table
                assert ";" not in source_table
                assert "SELECT" not in source_table.upper()

                arrow = loader.fetch_data_as_arrow(source_table)
                assert arrow.num_rows == 2
                assert list(arrow.column_names) == ["a", "b"]

                sized = loader.fetch_data_as_arrow(source_table, {"size": 1})
                assert sized.num_rows == 1

                projected = loader.fetch_data_as_arrow(
                    source_table, {"columns": ["a"]},
                )
                assert projected.column_names == ["a"]

        raw_get.assert_not_called()
        called_urls = [call.args[0] for call in mocked.call_args_list]
        assert called_urls
        assert set(called_urls) == {PUBLIC_CSV_URL}

    def test_source_table_sql_is_rejected(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        loader = WebDataLoader({"url": PUBLIC_CSV_URL, "format": "csv"})
        with pytest.raises(ValueError, match="identifier"):
            loader.fetch_data_as_arrow("SELECT * FROM sales")

    def test_json_unwrap_uses_fetch_url_bytes(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        payload = b'{"data": [{"a": 1}, {"a": 2}]}'
        url = "https://example.com/items.json"
        loader = WebDataLoader({"url": url, "format": "json"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value={
                "content": payload,
                "content_type": "application/json",
                "final_url": url,
                "truncated": False,
            },
        ):
            arrow = loader.fetch_data_as_arrow("items")
        assert arrow.num_rows == 2
        assert "a" in arrow.column_names


class TestWebNoCrawl:
    def test_html_with_links_does_not_follow(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/page"
        html = (
            b"<html><body>"
            b"<a href='https://evil.example/other.csv'>other</a>"
            b"<a href='/next'>next</a>"
            b"<table><tr><th>x</th></tr><tr><td>1</td></tr></table>"
            b"</body></html>"
        )
        loader = WebDataLoader({"url": url, "format": "auto"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value={
                "content": html,
                "content_type": "text/html",
                "final_url": url,
                "truncated": False,
            },
        ) as mocked:
            tables = loader.list_tables()
            assert [t["name"] for t in tables] == ["table_0"]
            assert tables[0]["name"] == assert_source_table_identifier(
                tables[0]["name"]
            )
            arrow = loader.fetch_data_as_arrow("table_0")
            assert arrow.num_rows == 1
            assert "x" in arrow.column_names
            called_urls = [call.args[0] for call in mocked.call_args_list]
            assert called_urls
            assert set(called_urls) == {url}
            assert not any("evil.example" in u for u in called_urls)
            assert not any(u.endswith("/next") for u in called_urls)
            assert not any(u.endswith("/other.csv") for u in called_urls)


def _html_fetch(url: str, content: bytes) -> dict:
    return {
        "content": content,
        "content_type": "text/html",
        "final_url": url,
        "truncated": False,
    }


def _n_tables_html(n: int) -> bytes:
    parts = [b"<html><body>"]
    for i in range(n):
        parts.append(
            f"<table><tr><th>c{i}</th></tr><tr><td>{i}</td></tr></table>".encode()
        )
    parts.append(b"</body></html>")
    return b"".join(parts)


class TestWebHtmlCatalog:
    def test_two_tables_list_and_fetch_each(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/report"
        html = (
            b"<html><body>"
            b"<table><tr><th>a</th></tr><tr><td>1</td></tr></table>"
            b"<table><tr><th>b</th></tr><tr><td>2</td></tr></table>"
            b"</body></html>"
        )
        loader = WebDataLoader({"url": url, "format": "html"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_html_fetch(url, html),
        ) as mocked:
            with patch("requests.get") as raw_get:
                tables = loader.list_tables()
                names = [t["name"] for t in tables]
                assert names == ["table_0", "table_1"]
                for name in names:
                    assert name == assert_source_table_identifier(name)

                first = loader.fetch_data_as_arrow("table_0")
                assert first.num_rows == 1
                assert "a" in first.column_names

                second = loader.fetch_data_as_arrow("table_1")
                assert second.num_rows == 1
                assert "b" in second.column_names

        raw_get.assert_not_called()
        called_urls = [call.args[0] for call in mocked.call_args_list]
        assert set(called_urls) == {url}

    def test_empty_html_is_honest_empty_catalog(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/empty"
        loader = WebDataLoader({"url": url, "format": "html"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_html_fetch(url, b""),
        ) as mocked:
            assert loader.list_tables() == []

        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_html_fetch(url, b"<html><body><p>no tables</p></body></html>"),
        ) as mocked_page:
            assert loader.list_tables() == []
            called_urls = [call.args[0] for call in mocked_page.call_args_list]
            assert called_urls == [url]

        mocked.assert_called()

    def test_html_table_cap_is_20(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/many"
        loader = WebDataLoader({"url": url, "format": "auto"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_html_fetch(url, _n_tables_html(21)),
        ):
            tables = loader.list_tables()
        assert len(tables) <= 20
        assert len(tables) == 20
        assert [t["name"] for t in tables] == [f"table_{i}" for i in range(20)]
        for node in tables:
            assert node["name"] == assert_source_table_identifier(node["name"])

    def test_unknown_html_index_raises(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/one"
        html = b"<html><body><table><tr><th>x</th></tr><tr><td>1</td></tr></table></body></html>"
        loader = WebDataLoader({"url": url, "format": "html"})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_html_fetch(url, html),
        ):
            with pytest.raises(ValueError, match="Unknown"):
                loader.fetch_data_as_arrow("table_9")

    def test_render_false_does_not_call_playwright(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/page"
        html = b"<html><body><table><tr><th>x</th></tr><tr><td>1</td></tr></table></body></html>"
        loader = WebDataLoader({"url": url, "format": "html", "render": False})
        with patch(
            "data_formulator.data_loader.web_data_loader.fetch_url_bytes",
            return_value=_html_fetch(url, html),
        ):
            with patch(
                "data_formulator.data_loader.web_data_loader.render_url_with_playwright"
            ) as mocked_render:
                tables = loader.list_tables()
        assert [t["name"] for t in tables] == ["table_0"]
        mocked_render.assert_not_called()

    def test_render_true_uses_playwright_when_available(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/app"
        rendered = (
            "<html><body><table><tr><th>c</th></tr>"
            "<tr><td>9</td></tr></table></body></html>"
        )
        loader = WebDataLoader({"url": url, "format": "html", "render": True})
        with patch(
            "data_formulator.data_loader.web_data_loader.playwright_available",
            return_value=True,
        ):
            with patch(
                "data_formulator.data_loader.web_data_loader.render_url_with_playwright",
                return_value=rendered,
            ) as mocked_render:
                with patch(
                    "data_formulator.data_loader.web_data_loader.fetch_url_bytes"
                ) as mocked_fetch:
                    tables = loader.list_tables()
                    arrow = loader.fetch_data_as_arrow("table_0")
        assert [t["name"] for t in tables] == ["table_0"]
        assert arrow.num_rows == 1
        assert "c" in arrow.column_names
        assert mocked_render.call_args_list
        assert all(call.args[0] == url for call in mocked_render.call_args_list)
        mocked_fetch.assert_not_called()

    def test_render_true_without_playwright_fails_closed(self):
        from data_formulator.data_loader.web_data_loader import WebDataLoader

        url = "https://example.com/app"
        loader = WebDataLoader({"url": url, "format": "html", "render": True})
        with patch(
            "data_formulator.data_loader.web_data_loader.playwright_available",
            return_value=False,
        ):
            with patch(
                "data_formulator.data_loader.web_data_loader.fetch_url_bytes"
            ) as mocked_fetch:
                with pytest.raises(RuntimeError, match="Playwright"):
                    loader.list_tables()
                mocked_fetch.assert_not_called()
