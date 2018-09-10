from typing import Dict, List, Tuple

import datetime

class SyncJob:
    PATTERNS_SYNC   = 'PATTERNS_SYNC'
    RANKINGS_SYNC   = 'RANKINGS_SYNC'
    STOCK_SYNC      = 'STOCK_SYNC'


class TimeWindow:
    FIVE_YEARS      = '5y'
    THREE_YEARS     = '3y'
    TWO_YEARS       = '2y'
    ONE_YEAR        = '1y'
    SIX_MONTHS      = '6m'
    THREE_MONTHS    = '3m'
    ONE_MONTH       = '1m'
    TWO_WEEKS       = '2w'
    ONE_WEEK        = '1w'

    @classmethod
    def is_valid(cls, time_window: str):
        if time_window in TimeWindow.to_time_delta_dict():
            return True
        else:
            return False

    @classmethod
    def to_time_delta_dict(cls) -> Dict[str, datetime.timedelta]:
        return {
            TimeWindow.FIVE_YEARS:   datetime.timedelta(weeks=52*5),
            TimeWindow.THREE_YEARS:  datetime.timedelta(weeks=52*3),
            TimeWindow.TWO_YEARS:    datetime.timedelta(weeks=52*2),
            TimeWindow.ONE_YEAR:     datetime.timedelta(weeks=52),
            TimeWindow.SIX_MONTHS:   datetime.timedelta(weeks=52/2),
            TimeWindow.THREE_MONTHS: datetime.timedelta(weeks=52/4),
            TimeWindow.ONE_MONTH:    datetime.timedelta(weeks=4),
            TimeWindow.TWO_WEEKS:    datetime.timedelta(weeks=2),
            TimeWindow.ONE_WEEK:     datetime.timedelta(weeks=1),
        }

    @classmethod
    def to_asc_delta_tuple_array(cls) -> List[Tuple[str, datetime.timedelta]]:
        return [
            (TimeWindow.FIVE_YEARS,   datetime.timedelta(weeks=52*5)),
            (TimeWindow.THREE_YEARS,  datetime.timedelta(weeks=52*3)),
            (TimeWindow.TWO_YEARS,    datetime.timedelta(weeks=52*2)),
            (TimeWindow.ONE_YEAR,     datetime.timedelta(weeks=52)),
            (TimeWindow.SIX_MONTHS,   datetime.timedelta(weeks=52/2)),
            (TimeWindow.THREE_MONTHS, datetime.timedelta(weeks=52/4)),
            (TimeWindow.ONE_MONTH,    datetime.timedelta(weeks=4)),
            (TimeWindow.TWO_WEEKS,    datetime.timedelta(weeks=2)),
            (TimeWindow.ONE_WEEK,     datetime.timedelta(weeks=1)),
        ]