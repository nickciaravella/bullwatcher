class StockMetadata:
    def __init__(self, ticker, company_name, market_cap, sector):
        self.ticker = ticker
        self.company_name = company_name
        self.market_cap = market_cap
        self.sector = sector


class StockSyncStatus:
    def __init__(self, ticker, synced_until):
        self.ticker = ticker
        self.synced_until = synced_until

    def to_json(self):
        return {
            'ticker': self.ticker,
            'synced_until': str(self.synced_until)
        }