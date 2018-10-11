from typing import Dict, List, Tuple

import datetime
import time

from application import db
from app.data_access.bullwatcherdb.common import commit_with_rollback
from app.database import models
from app.domain.sectors import SectorId, SectorPerformance


def get_sector_performances() -> Tuple[datetime.datetime, List[SectorPerformance]]:
    print(f'START -- DB get_sector_performances')
    start = time.time()

    all_models: List[models.SectorPerformance] = db.session.query(models.SectorPerformance).all()

    max_update_time: datetime.datetime = datetime.datetime.utcnow() - datetime.timedelta(weeks=52)
    if all_models:
        max_update_time = max([m.last_updated_at for m in all_models])

    end = time.time()
    print(f'Found {len(all_models)} sector performances, last updated: {max_update_time}.')
    print('END   -- Time: ' + str(end - start))

    return max_update_time, [
        SectorPerformance(id=m.id,
                          name=m.name,
                          time_window=m.time_window,
                          percent_change=m.percent_change)
        for m in all_models
    ]


def update_sector_performances(sector_performances: List[SectorPerformance]):
    print(f'START -- DB update_sector_performances: {len(sector_performances)}')
    start = time.time()

    now: datetime.datetime = datetime.datetime.utcnow()
    db.session.query(models.SectorPerformance).delete(synchronize_session='fetch')
    commit_with_rollback(db.session)

    db_models = [
        models.SectorPerformance(id=sector.id,
                                 name=sector.name,
                                 time_window=sector.time_window,
                                 percent_change=sector.percent_change,
                                 last_updated_at=now)
        for sector in sector_performances
    ]

    insert_values = []
    for sector in sector_performances:
        insert_values.append(
            f'(\'{sector.id}\', \'{sector.time_window}\', \'{sector.name}\', {sector.percent_change}, \'{str(datetime.datetime.utcnow())}\')'
        )

    if insert_values:
        sql = 'INSERT INTO sector_performance (id, time_window, name, percent_change, last_updated_at) VALUES ' + ','.join(insert_values)
        db.engine.execute(sql)

    end = time.time()
    print(f'Saved {len(db_models)} sector performances.')
    print('END   -- Time: ' + str(end - start))


def convert_db_sector_to_domain(sector: str) -> SectorId:
    """
    Converts a sector from the database string to a domain SectorId. If there is no mapped SectorId, then it will
    be mapped to SectorId.UNKNOWN
    """
    mapping: Dict[str, SectorId] = {
        '': SectorId.UNKNOWN,
        'Basic Industries': SectorId.INDUSTRIALS,
        'Basic Materials': SectorId.MATERIALS,
        'Capital Goods': SectorId.INDUSTRIALS,
        'Communication Services': SectorId.TELECOMMUNICATION_SERVICES,
        'Consumer Cyclical': SectorId.CONSUMER_DISCRETIONARY,
        'Consumer Defensive': SectorId.CONSUMER_STAPLES,
        'Consumer Durables': SectorId.CONSUMER_DISCRETIONARY,
        'Consumer Non-Durables': SectorId.CONSUMER_STAPLES,
        'Consumer Services': SectorId.CONSUMER_DISCRETIONARY,
        'Energy': SectorId.ENERGY,
        'Finance': SectorId.FINANCIALS,
        'Financial Services': SectorId.FINANCIALS,
        'Industrials': SectorId.INDUSTRIALS,
        'Health Care': SectorId.HEALTH_CARE,
        'Healthcare': SectorId.HEALTH_CARE,
        'Miscellaneous': SectorId.UNKNOWN,
        'Public Utilities': SectorId.UTILITIES,
        'Real Estate': SectorId.REAL_ESTATE,
        'Technology': SectorId.TECHNOLOGY,
        'Transportation': SectorId.INDUSTRIALS,
        'Utilities': SectorId.UTILITIES,
    }

    if sector in mapping:
        return mapping[sector]
    else:
        return SectorId.UNKNOWN