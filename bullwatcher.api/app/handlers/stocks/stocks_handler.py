from app.database import models
from app.domain.stocks import StockMetadata
from sqlalchemy import func


def get_stock_metadata(ticker):
    m = models.StockMetadata.query.filter(func.lower(models.StockMetadata.ticker) == func.lower(ticker)).one()
    return StockMetadata(m.ticker, m.company_name, m.market_cap, m.sector).to_json()
