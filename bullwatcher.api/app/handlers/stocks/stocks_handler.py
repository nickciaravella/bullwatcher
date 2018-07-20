from app.data_access import bullwatcherdb
from app.database import models
from app.domain.stocks import StockMetadata
from datetime import datetime, timedelta
from sqlalchemy import func


def get_stock_metadata(ticker):
    m = models.StockMetadata.query.filter(func.lower(models.StockMetadata.ticker) == func.lower(ticker)).one()
    return StockMetadata(m.ticker, m.company_name, m.market_cap, m.sector).to_json()

def get_stock_history(ticker):
    today = datetime.today()
    two_weeks_ago = today - timedelta(days=14)
    stock_dict = bullwatcherdb.get_batch_stock_daily([ticker], two_weeks_ago, today)
    return stock_dict[ticker] if ticker in stock_dict else []
