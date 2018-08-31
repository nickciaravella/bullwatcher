from typing import List, Tuple

import datetime
import time

from application import db
from app.database import models
from app.domain.sectors import SectorPerformance


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
    db.session.commit()

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