
from datetime import datetime


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


class StockDaily:
    def __init__(self, date, info):
        self.date = datetime.strptime(date, '%Y-%m-%d').date()
        self.open = float(info["1. open"])
        self.high = float(info["2. high"])
        self.low = float(info["3. low"])
        self.close = float(info["4. close"])
        self.volume = float(info["5. volume"])


class MovingAverage:
    def __init__(self, date, interval, value):
        self.date = datetime.strptime(date, '%Y-%m-%d').date()
        self.interval = interval
        self.value = value


class OnBalanceVolume:
    def __init__(self, date, value):
        self.date = datetime.strptime(date, '%Y-%m-%d').date()
        self.value = value