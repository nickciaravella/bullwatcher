from typing import Dict, List, Optional

from app.data_access import bullwatcherdb, iex
from app.domain.rankings import Ranking
from app.domain.stocks import StockMetadata, StockDaily, StockCurrent


def search_stock_metadata(prefix: Optional[str], max_results: Optional[str]) -> List[StockMetadata]:
    if max_results:
        max_results = int(max_results)

    if not prefix:
        all_metadatas = bullwatcherdb.get_all_stock_metadata()
        if max_results:
            return all_metadatas[:max_results]
        else:
            return all_metadatas
    else:
        return bullwatcherdb.search_stock_metadata_by_prefix(prefix=prefix,
                                                             max_results=max_results if max_results else 5)


def get_stock_metadata(ticker) -> Optional[StockMetadata]:
    metadata = bullwatcherdb.get_stock_metadata(ticker)

    if not metadata:
        metadatas: List[StockMetadata] = iex.get_stock_metadata([ticker])
        if metadatas:
            metadata = metadatas[0]
            bullwatcherdb.save_batch_stock_metadata([metadata])

    if metadata:
        metadata.sector = bullwatcherdb.convert_db_sector_to_domain(metadata.sector)

    return metadata


def get_stock_history(ticker: str) -> Optional[List[StockDaily]]:
    dailies_by_ticker: Dict[str, List[StockDaily]] = iex.get_stock_dailies([ticker], '2y')
    if ticker not in dailies_by_ticker:
        return None
    return dailies_by_ticker[ticker]


def get_stock_current(ticker: str) -> StockCurrent:
    return iex.get_stock_current(ticker)


def get_stock_rankings(ticker: str) -> List[Ranking]:
    return bullwatcherdb.get_stock_rankings(ticker)
