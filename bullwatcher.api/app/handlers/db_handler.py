from app.database import models

# Handler to read random data from the database. It will change over time.
def stock_metadata():
    return [{ 'ticker': m.ticker,
               'company_name': m.company_name,
               'market_cap': m.market_cap,
               'sector': m.sector } for m in models.StockMetadata.query.all() ]
