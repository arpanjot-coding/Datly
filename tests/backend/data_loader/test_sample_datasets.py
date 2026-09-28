"""The shipped sample table loads from a local file and stays offline."""

from data_formulator.data_loader.sample_datasets_loader import SampleDatasetsLoader
from data_formulator.example_datasets_config import EXAMPLE_DATASETS

EXPECTED = ["Stock prices"]


def test_catalog_lists_the_stock_sample():
    names = [ds["name"] for ds in EXAMPLE_DATASETS]
    assert names == EXPECTED
    table = EXAMPLE_DATASETS[0]["tables"][0]
    assert table["path"] == "stock_prices.csv"
    assert table["url"].startswith("https://")

    listed = SampleDatasetsLoader().list_tables()
    assert [item["name"] for item in listed] == EXPECTED
    columns = {column["name"] for column in listed[0]["metadata"]["columns"]}
    assert {"date", "symbol", "company", "sector", "close", "volume"} <= columns


def test_stock_sample_loads_without_network():
    loader = SampleDatasetsLoader()
    table = loader.fetch_data_as_arrow("Stock prices", {"size": 5})
    assert table.num_rows == 5
    assert table.num_columns == 9
    assert loader._last_total_rows == 6000
