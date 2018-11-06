import datetime
from app.database import models

def convert_stock_metadata(domain):
    converted = models.StockMetadata()
    converted.ticker = domain.ticker
    converted.company_name = domain.company_name
    converted.market_cap = domain.market_cap
    converted.sector = domain.sector.id
    converted.last_updated_at = datetime.datetime.utcnow()
    return converted
