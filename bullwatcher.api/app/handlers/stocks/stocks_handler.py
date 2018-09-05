from typing import Dict, List, Optional

from app.data_access import bullwatcherdb, iex
from app.database import models
from app.domain.rankings import Ranking
from app.domain.sectors import SectorId
from app.domain.stocks import StockMetadata, StockDaily, StockCurrent
from sqlalchemy import func


def get_stock_metadata(ticker):
    m = models.StockMetadata.query.filter(func.lower(models.StockMetadata.ticker) == func.lower(ticker)).one()
    return StockMetadata(m.ticker, m.company_name, m.market_cap, _convert_sector(m.sector)).to_json()


def get_stock_history(ticker: str) -> Optional[List[StockDaily]]:
    dailies_by_ticker: Dict[str, List[StockDaily]] = iex.get_stock_dailies([ticker], '2y')
    if ticker not in dailies_by_ticker:
        return None
    return dailies_by_ticker[ticker]


def get_stock_current(ticker: str) -> StockCurrent:
    return iex.get_stock_current(ticker)


def get_stock_rankings(ticker: str) -> List[Ranking]:
    return bullwatcherdb.get_stock_rankings(ticker)


def _convert_sector(sector: str) -> SectorId:
    mapping: Dict[str, SectorId] = {
        '': SectorId.UNKNOWN,
        'Basic Industries': SectorId.INDUSTRIALS,
        'Basic Materials': SectorId.MATERIALS,
        'Capital Goods': SectorId.INDUSTRIALS,
        'Communication Services': SectorId.TELECOMMUNICATION_SERVICES,
        'Consumer Cyclical': SectorId.CONSUMER_DISCRETIONARY,
        'Consumer Defensive': SectorId.CONSUMER_STAPLES,
        'Consumer Durables': SectorId.CONSUMER_DISCRETIONARY,
        'Consumer Non-Durables': SectorId.CONSUMER_STAPLES,
        'Consumer Services': SectorId.CONSUMER_DISCRETIONARY,
        'Energy': SectorId.ENERGY,
        'Finance': SectorId.FINANCIALS,
        'Financial Services': SectorId.FINANCIALS,
        'Industrials': SectorId.INDUSTRIALS,
        'Health Care': SectorId.HEALTH_CARE,
        'Healthcare': SectorId.HEALTH_CARE,
        'Miscellaneous': SectorId.UNKNOWN,
        'Public Utilities': SectorId.UTILITIES,
        'Real Estate': SectorId.REAL_ESTATE,
        'Technology': SectorId.TECHNOLOGY,
        'Transportation': SectorId.INDUSTRIALS,
        'Utilities': SectorId.UTILITIES,
    }

    if sector in mapping:
        return mapping[sector]
    else:
        return SectorId.UNKNOWN
