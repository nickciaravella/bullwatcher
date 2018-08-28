from typing import Dict, List

import datetime
import time
from sqlalchemy import and_

from application import db
from app.domain.common import TimeWindow
from app.domain.rankings import Ranking, RankingType
from app.database import models


def merge_rankings(rankings: List[Ranking], time_window: TimeWindow, ranking_type: RankingType) -> None:
    """
    Merges all of the rankings based on time window and type. The merge happens in the following way:
    1. If the ranking does not yet exist for the ticker, it will add it.
    2. If the ranking/value has changed for the ticker, it will update it.
    3. If there is no ranking for an existing ticker in the database, it will delete it from the database.
    """
    print(f'START -- DB merge_rankings -- Rankings: {len(rankings)}')
    start = time.time()

    current_rankings_by_ticker: Dict[str, Ranking] = {
        r.ticker: r for r in rankings
    }

    # Clear existing data for this time_window and ranking_type
    db.session.query(models.StockRanking).filter(
        and_(
            models.StockRanking.time_window == time_window,
            models.StockRanking.ranking_type == ranking_type)
    ).delete(synchronize_session='fetch')
    db.session.commit()

    # Insert new data
    insert_values = []
    for ticker, ranking in current_rankings_by_ticker.items():
        insert_values.append(
            f'(\'{ticker}\', \'{ranking.time_window}\', \'{ranking.ranking_type}\', {ranking.rank}, {ranking.value}, \'{str(datetime.datetime.utcnow())}\')'
        )

    if insert_values:
        sql = 'INSERT INTO stock_ranking VALUES ' + ','.join(insert_values)
        db.engine.execute(sql)

    end = time.time()
    print(f'END   -- Time: ' + str(end - start))


def get_rankings(time_window: str, ranking_type: str) -> List[Ranking]:
    """
    Gets the list of rankings for the given time window and ranking type. They will be ordered by rank asc.
    """
    print(f'START -- DB get_rankings -- RankingType: {ranking_type}, Time Window: {time_window}')
    start = time.time()

    db_rankings: List[models.StockRanking] = db.session \
        .query(models.StockRanking) \
        .filter(and_(
        models.StockRanking.time_window == time_window,
        models.StockRanking.ranking_type == ranking_type)) \
        .order_by(models.StockRanking.rank.asc()) \
        .all()

    rankings: List[Ranking] = [
        Ranking(
            ticker=r.ticker,
            ranking_type=r.ranking_type,
            time_window=r.time_window,
            rank=r.rank,
            value=r.value
        )
        for r in db_rankings
    ]

    print(f'Total rankings: {len(rankings)}')

    end = time.time()
    print(f'END   -- Time: {end - start}')
    return rankings
