from typing import Any, Dict
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

    @classmethod
    def from_json(self, json: Dict[str, Any]) -> 'StockMetadata':
        return StockMetadata(
            ticker=json['ticker'],
            company_name=json['company_name'],
            market_cap=json['market_cap'],
            sector=json['sector']
        )


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
                 after_hours_price: float,
                 after_hours_updated_time: datetime,
                 current_price: float,
                 high: float,
                 last_updated_time: datetime,
                 low: float,
                 open_: float,
                 previous_close: float,
                 volume: int) -> None:
        self.after_hours_price: float = after_hours_price
        self.after_hours_updated_time: datetime = after_hours_updated_time
        self.current_price: float = current_price
        self.high: float = high
        self.last_updated_time: datetime = last_updated_time
        self.low: float = low
        self.open_: float = open_
        self.previous_close: float = previous_close
        self.volume: int = volume

    def to_json(self) -> Dict[str, Any]:
        return {
            'after_hours_price': self.after_hours_price,
            'after_hours_updated_time': str(self.after_hours_updated_time),
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
