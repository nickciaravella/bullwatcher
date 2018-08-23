from typing import Dict, List, Optional

from app.data_access import iex
from app.database import models
from app.domain.stocks import StockMetadata, StockDaily, StockCurrent
from sqlalchemy import func


def get_stock_metadata(ticker):
    m = models.StockMetadata.query.filter(func.lower(models.StockMetadata.ticker) == func.lower(ticker)).one()
    return StockMetadata(m.ticker, m.company_name, m.market_cap, m.sector).to_json()


def get_stock_history(ticker: str) -> Optional[List[StockDaily]]:
    dailies_by_ticker: Dict[str, List[StockDaily]] = iex.get_stock_dailies([ticker], '2y')
    if ticker not in dailies_by_ticker:
        return None
    return dailies_by_ticker[ticker]


def get_stock_current(ticker: str) -> StockCurrent:
    return iex.get_stock_current(ticker)
