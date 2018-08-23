from datetime import datetime


class StockMetadata:
    def __init__(self, ticker, company_name, market_cap, sector):
        self.ticker = ticker
        self.company_name = company_name
        self.market_cap = market_cap
        self.sector = sector

    def to_json(self):
        return {
            'ticker': self.ticker,
            'company_name': self.company_name,
            'market_cap': self.market_cap,
            'sector': self.sector
        }


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
    def __init__(self, date_str, open_, high, low, close, volume):
        self.date = datetime.strptime(date_str, '%Y-%m-%d').date()
        self.open = open_
        self.high = high
        self.low = low
        self.close = close
        self.volume = volume

    def to_json(self):
        return {
            'date': str(self.date),
            'open': self.open,
            'high': self.high,
            'low': self.low,
            'close': self.close,
            'volume': self.volume
        }


class StockCurrent:
    def __init__(self,
                 last_updated_time: datetime,
                 current_price: float,
                 open_: float,
                 high: float,
                 low: float,
                 volume: int,
                 previous_close: float):
        self.last_updated_time = last_updated_time
        self.current_price = current_price
        self.open_ = open_
        self.high = high
        self.low = low
        self.volume = volume
        self.previous_close = previous_close

    def to_json(self):
        return {
            'last_updated_time': str(self.last_updated_time),
            'current_price': self.current_price,
            'open': self.open_,
            'high': self.high,
            'low': self.low,
            'volume': self.volume,
            'previous_close': self.previous_close
        }


class MovingAverage:
    def __init__(self, date, interval, value):
        self.date = datetime.strptime(date, '%Y-%m-%d').date()
        self.interval = interval
        self.value = value


class OnBalanceVolume:
    def __init__(self, date, value):
        self.date = datetime.strptime(date, '%Y-%m-%d').date()
        self.value = value
