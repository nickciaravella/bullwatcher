from datetime import date, datetime

class PatternType:
    FLAG = "flag"


class PatternStock:
    def __init__(self, stock_metadata, pattern_type, votes):
        self.stock_metadata = stock_metadata
        self.pattern_type = pattern_type
        self.votes = votes

    def to_json(self):
        return {
            'stock_metadata': self.stock_metadata.to_json(),
            'pattern_type':  self.pattern_type,
            'votes':  self.votes
        }

class PatternTicker:
    def __init__(self, ticker, pattern_type, votes):
        self.ticker = ticker
        self.pattern_type = pattern_type
        self.votes = votes

class DailyPatterns:
    def __init__(self, date, pattern_stocks):
        self.date = date
        self.pattern_stocks = pattern_stocks

    def to_json(self):
        return {
            'date': str(self.date),
            'pattern_stocks': [p.to_json() for p in self.pattern_stocks]
        }


class PatternVote:
    def __init__(self, date: date, ticker: str, user_id: str, value: int):
        self.date: date = date
        self.ticker: str = ticker
        self.user_id: str = user_id
        self.value: int = value

    @classmethod
    def from_json(self, json: dict):
        return PatternVote(
            date=datetime.strptime(json['date'], "%Y-%m-%d").date(),
            ticker=json['ticker'],
            user_id=json['user_id'],
            value=int(json['value'])
        )

    def to_json(self):
        return {
            'date': str(self.date),
            'ticker': self.ticker,
            'user_id': self.user_id,
            'value': self.value
        }