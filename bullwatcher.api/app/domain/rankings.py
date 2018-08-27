from app.domain.common import TimeWindow


class RankingType:
    PRICE_PERCENT_CHANGE = 'price_percent_change'


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

