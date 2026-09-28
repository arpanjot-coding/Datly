"""SSRF-closed user-URL client: web_utils only (no file://, no private/metadata).

Locks `_validate_url_for_ssrf`, `fetch_url_bytes`, and `_ssrf_safe_session`
redirect re-check. Sample-datasets catalog fetch is a trusted path and is
not exercised here.
"""

from __future__ import annotations

import socket
from unittest.mock import MagicMock, patch

import pytest
import requests

from data_formulator.agents import web_utils
from data_formulator.agents.web_utils import (
    DEFAULT_MAX_FETCH_BYTES,
    _ssrf_safe_session,
    _validate_url_for_ssrf,
    fetch_url_bytes,
)

pytestmark = [pytest.mark.backend, pytest.mark.security]

PUBLIC_HTTPS_URL = "https://example.com/data.csv"
PUBLIC_IP = "93.184.216.34"

# Acceptance rejects (fail closed). DNS for hostnames/IPs is mocked.
REJECT_EMPTY = ""
REJECT_FILE = "file:///etc/passwd"
REJECT_FTP = "ftp://example.com/data.csv"
REJECT_LOOPBACK = "http://127.0.0.1"
REJECT_LOCALHOST = "http://localhost"
REJECT_RFC1918_10 = "http://10.0.0.1"
REJECT_RFC1918_192 = "http://192.168.0.1"
REJECT_METADATA = "http://169.254.169.254"
REJECT_IPV6_LOOPBACK = "http://[::1]"
REJECT_MAPPED_LOOPBACK = "http://[::ffff:127.0.0.1]"
REJECT_MAPPED_RFC1918 = "http://[::ffff:10.0.0.1]"
REJECT_MAPPED_METADATA = "http://[::ffff:169.254.169.254]"

_DNS_MAP = {
    "127.0.0.1": "127.0.0.1",
    "localhost": "127.0.0.1",
    "10.0.0.1": "10.0.0.1",
    "192.168.0.1": "192.168.0.1",
    "169.254.169.254": "169.254.169.254",
    "::1": "::1",
    "::ffff:127.0.0.1": "::ffff:127.0.0.1",
    "::ffff:10.0.0.1": "::ffff:10.0.0.1",
    "::ffff:169.254.169.254": "::ffff:169.254.169.254",
    "example.com": PUBLIC_IP,
}


def _addrinfo(ip: str):
    """Minimal getaddrinfo tuple; web_utils only reads sockaddr[0]."""
    if ":" in ip:
        return [(socket.AF_INET6, socket.SOCK_STREAM, 6, "", (ip, 0, 0, 0))]
    return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip, 0))]


def _fake_getaddrinfo(host, port, *args, **kwargs):
    if host in _DNS_MAP:
        return _addrinfo(_DNS_MAP[host])
    raise socket.gaierror(socket.EAI_NONAME, "mocked nxdomain")


@pytest.fixture
def mock_dns():
    with patch.object(web_utils.socket, "getaddrinfo", side_effect=_fake_getaddrinfo) as mocked:
        yield mocked


class TestIsPrivateIp:
    def test_loopback_and_rfc1918_and_metadata(self):
        assert web_utils._is_private_ip("127.0.0.1")
        assert web_utils._is_private_ip("10.0.0.1")
        assert web_utils._is_private_ip("192.168.0.1")
        assert web_utils._is_private_ip("169.254.169.254")
        assert web_utils._is_private_ip("::1")

    def test_ipv4_mapped_same_blocked_addresses(self):
        assert web_utils._is_private_ip("::ffff:127.0.0.1")
        assert web_utils._is_private_ip("::ffff:10.0.0.1")
        assert web_utils._is_private_ip("::ffff:192.168.0.1")
        assert web_utils._is_private_ip("::ffff:169.254.169.254")

    def test_public_ipv4_and_mapped_public(self):
        assert not web_utils._is_private_ip(PUBLIC_IP)
        assert not web_utils._is_private_ip(f"::ffff:{PUBLIC_IP}")


def _session_returning(chunks, content_type="text/csv; charset=utf-8", final_url=PUBLIC_HTTPS_URL):
    response = MagicMock()
    response.headers = {"content-type": content_type}
    response.url = final_url
    response.iter_content.return_value = chunks
    response.raise_for_status = MagicMock()

    session = MagicMock()
    session.get.return_value = response
    session.__enter__.return_value = session
    session.__exit__.return_value = False
    return session


class TestValidateUrlForSsrfRejects:
    def test_empty_url(self):
        with pytest.raises(ValueError, match="empty"):
            _validate_url_for_ssrf(REJECT_EMPTY)

    def test_file_scheme(self):
        with pytest.raises(ValueError):
            _validate_url_for_ssrf(REJECT_FILE)

    def test_file_scheme_with_host(self):
        with pytest.raises(ValueError):
            _validate_url_for_ssrf("file://localhost/etc/passwd")

    def test_ftp_scheme(self):
        with pytest.raises(ValueError):
            _validate_url_for_ssrf(REJECT_FTP)

    def test_local_filesystem_path_is_not_a_url(self):
        with pytest.raises(ValueError):
            _validate_url_for_ssrf("C:\\Windows\\win.ini")
        with pytest.raises(ValueError):
            _validate_url_for_ssrf("/etc/passwd")

    @pytest.mark.parametrize(
        "url",
        [
            REJECT_LOOPBACK,
            REJECT_LOCALHOST,
            REJECT_RFC1918_10,
            REJECT_RFC1918_192,
            REJECT_METADATA,
            REJECT_IPV6_LOOPBACK,
            REJECT_MAPPED_LOOPBACK,
            REJECT_MAPPED_RFC1918,
            REJECT_MAPPED_METADATA,
        ],
    )
    def test_private_metadata_and_loopback(self, url, mock_dns):
        with pytest.raises(ValueError, match="private|internal|Blocked"):
            _validate_url_for_ssrf(url)

    def test_unresolved_hostname_fails_closed(self, mock_dns):
        with pytest.raises(ValueError, match="resolve"):
            _validate_url_for_ssrf("https://no-such-host.invalid")


class TestValidateUrlForSsrfPublicHttps:
    def test_public_https_passes_with_mocked_dns(self, mock_dns):
        assert _validate_url_for_ssrf(PUBLIC_HTTPS_URL) == PUBLIC_HTTPS_URL
        mock_dns.assert_called()
        assert mock_dns.call_args[0][0] == "example.com"


class TestSsrfSafeSessionRedirectRecheck:
    def test_adapter_blocks_private_redirect_before_send(self, mock_dns):
        session = _ssrf_safe_session()
        adapter = session.get_adapter(REJECT_METADATA + "/")
        req = requests.Request("GET", REJECT_METADATA + "/latest/meta-data/").prepare()

        with patch.object(requests.adapters.HTTPAdapter, "send") as super_send:
            with pytest.raises(ValueError, match="private|internal|Blocked"):
                adapter.send(req)
            super_send.assert_not_called()

    def test_public_request_reaches_adapter_send_then_private_is_blocked(self, mock_dns):
        sent_urls: list[str] = []

        def fake_super_send(self, request, **kwargs):
            sent_urls.append(request.url)
            resp = MagicMock()
            resp.status_code = 200
            resp.url = request.url
            resp.headers = {}
            return resp

        session = _ssrf_safe_session()
        public_req = requests.Request("GET", PUBLIC_HTTPS_URL).prepare()
        private_req = requests.Request("GET", REJECT_LOOPBACK + "/secret").prepare()

        with patch.object(requests.adapters.HTTPAdapter, "send", fake_super_send):
            session.get_adapter(PUBLIC_HTTPS_URL).send(public_req)
            with pytest.raises(ValueError, match="private|internal|Blocked"):
                session.get_adapter(REJECT_LOOPBACK).send(private_req)

        assert PUBLIC_HTTPS_URL in sent_urls
        assert not any("127.0.0.1" in url for url in sent_urls)


class TestFetchUrlBytesUsesSharedClient:
    def test_empty_url_fails_closed(self):
        with pytest.raises(ValueError, match="empty"):
            fetch_url_bytes(REJECT_EMPTY)

    def test_file_scheme_fails_closed(self):
        with pytest.raises(ValueError):
            fetch_url_bytes(REJECT_FILE)

    def test_loopback_fails_closed_before_http(self, mock_dns):
        with pytest.raises(ValueError, match="private|internal|Blocked"):
            fetch_url_bytes(REJECT_LOOPBACK)

    def test_uses_ssrf_safe_session_not_requests_get(self, mock_dns):
        session = _session_returning([b"a,b\n1,2\n"])
        with patch.object(web_utils, "_ssrf_safe_session", return_value=session) as factory:
            with patch.object(web_utils.requests, "get") as raw_get:
                result = fetch_url_bytes(PUBLIC_HTTPS_URL)

        raw_get.assert_not_called()
        factory.assert_called_once()
        session.get.assert_called_once()
        assert result["content"] == b"a,b\n1,2\n"
        assert result["content_type"] == "text/csv"
        assert result["final_url"] == PUBLIC_HTTPS_URL
        assert result["truncated"] is False

    def test_size_cap_truncates_and_default_cap_stays(self, mock_dns):
        session = _session_returning([b"x" * 100, b"y" * 100], content_type="application/octet-stream")
        with patch.object(web_utils, "_ssrf_safe_session", return_value=session):
            result = fetch_url_bytes(PUBLIC_HTTPS_URL, max_bytes=50)

        assert result["truncated"] is True
        assert len(result["content"]) == 50
        assert DEFAULT_MAX_FETCH_BYTES == 20 * 1024 * 1024
