from app.domain.stocks import StockMetadata
from app.database import models

def convert_stock_metadata(domain):
    converted = models.StockMetadata()
    converted.ticker = domain.ticker
    converted.company_name = domain.company_name
    converted.market_cap = domain.market_cap
    converted.sector = domain.sector
    return converted
