from app.domain.common import TimeWindow


class RankingType:
    PRICE_PERCENT_CHANGE = 'price_percent_change'

    @classmethod
    def is_valid(cls, ranking_type: str):
        if ranking_type in [RankingType.PRICE_PERCENT_CHANGE]:
            return True
        else:
            return False


class Ranking:
    def __init__(self,
                ticker: str,
                ranking_type: RankingType,
                time_window: TimeWindow,
                rank: int,
                value: float):
        self.ticker: str = ticker
        self.time_window: TimeWindow  = time_window
        self.ranking_type: RankingType = ranking_type
        self.rank: int = rank
        self.value: float = value

    def to_json(self):
        return {
            'ticker': self.ticker,
            'time_window': self.time_window,
            'ranking_type': self.ranking_type,
            'rank': self.rank,
            'value': self.value
        }
