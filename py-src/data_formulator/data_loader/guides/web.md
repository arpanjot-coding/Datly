**URL**

Paste one public HTTP or HTTPS address of a data file (CSV, JSON, Excel, or Parquet). Private, local, and `file://` addresses are blocked.

**Authorization**

Optional. Enter a Bearer token or a full Authorization header value when the file is behind a header. This value is not stored in catalog metadata.

**Format**

Leave `auto` to detect from the URL or content type. Set `csv`, `json`, `html`, or `xlsx` to force a parser. HTML table extraction is not part of this connection guide.

**Render**

Leave off. Browser rendering is reserved and is not used by default.
