from typing import Dict, List, Tuple

import datetime

class TimeWindow:
    TWO_YEARS = '2y'
    ONE_YEAR = '1y'
    SIX_MONTHS = '6m'
    THREE_MONTHS = '3m'
    ONE_MONTH = '1m'
    TWO_WEEKS = '2w'

    @classmethod
    def is_valid(cls, time_window: str):
        if time_window in TimeWindow.to_time_delta_dict():
            return True
        else:
            return False

    @classmethod
    def to_time_delta_dict(cls) -> Dict[str, datetime.timedelta]:
        return {
            TimeWindow.TWO_YEARS:    datetime.timedelta(weeks=104),
            TimeWindow.ONE_YEAR:     datetime.timedelta(weeks=52),
            TimeWindow.SIX_MONTHS:   datetime.timedelta(weeks=26),
            TimeWindow.THREE_MONTHS: datetime.timedelta(weeks=13),
            TimeWindow.ONE_MONTH:    datetime.timedelta(weeks=4),
            TimeWindow.TWO_WEEKS:    datetime.timedelta(weeks=2),
        }

    @classmethod
    def to_asc_delta_tuple_array(cls) -> List[Tuple[str, datetime.timedelta]]:
        return [
            (TimeWindow.TWO_YEARS,    datetime.timedelta(weeks=104)),
            (TimeWindow.ONE_YEAR,     datetime.timedelta(weeks=52)),
            (TimeWindow.SIX_MONTHS,   datetime.timedelta(weeks=26)),
            (TimeWindow.THREE_MONTHS, datetime.timedelta(weeks=13)),
            (TimeWindow.ONE_MONTH,    datetime.timedelta(weeks=4)),
            (TimeWindow.TWO_WEEKS,    datetime.timedelta(weeks=2)),
        ]