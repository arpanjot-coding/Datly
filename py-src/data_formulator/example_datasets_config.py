"""Sample table shipped with Datly.

The CSV lives in ``sample_data`` so the desktop app can open it without a
network call. ``url`` is the public source page, kept for attribution.
"""

EXAMPLE_DATASETS = [
    {
        "source": "yahoo-finance",
        "name": "Stock prices",
        "description": (
            "6,000 daily prices for 12 large US companies, 30 Sep 2024 through 28 Sep 2026. "
            "Technology, consumer, financials, health, energy, and industrials are included. "
            "Open, high, low, and close are adjusted for splits so a price line stays continuous. "
            "Source: Yahoo Finance, https://finance.yahoo.com/."
        ),
        "tables": [
            {
                "format": "csv",
                "path": "stock_prices.csv",
                "url": "https://finance.yahoo.com/",
                "sample": """date,symbol,company,sector,open,high,low,close,volume
2024-09-30,AAPL,Apple,Technology,228.13,231.07,227.74,231.07,54541900
2024-09-30,JPM,JPMorgan Chase,Financials,197.99,202.45,196.98,202.36,8663800
2026-09-28,NVDA,NVIDIA,Technology,229.7,233.21,228.46,229.21,113532177""",
            }
        ],
    },
]
