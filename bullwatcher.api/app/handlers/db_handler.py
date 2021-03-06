from application import db
from app.database import models
from app.data_access import bullwatcherdb
from sqlalchemy import func

# Handler to read random data from the database. It will change over time.
def stock_metadata(ticker):
    m = models.StockMetadata.query.filter(func.lower(models.StockMetadata.ticker) == func.lower(ticker)).one()
    return {
        'ticker': m.ticker,
        'company_name': m.company_name,
        'market_cap': m.market_cap,
        'sector': m.sector
    }


def stock_tickers():
    return bullwatcherdb.get_all_stock_daily_tickers()
