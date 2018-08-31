from typing import List

import datetime

from app.data_access import alphavantage, bullwatcherdb
from app.domain.sectors import SectorPerformance


def get_sector_performances() -> List[SectorPerformance]:
    last_updated, cached_sector_performances = bullwatcherdb.get_sector_performances()

    if last_updated > (datetime.datetime.utcnow() - datetime.timedelta(hours=1)):
        return cached_sector_performances

    current_sector_performances: List[SectorPerformance] = alphavantage.get_sector_performances()
    bullwatcherdb.update_sector_performances(current_sector_performances)
    return current_sector_performances
