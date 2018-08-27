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

    # TODO: HACK! Figure out a way to do more performant saving of data.
    rankings = rankings[0:50]
    current_rankings_by_ticker: Dict[str, Ranking] = {
        r.ticker: r for r in rankings
    }

    existing_rankings: List[models.StockRanking] = db.session \
        .query(models.StockRanking) \
        .filter(and_(
            models.StockRanking.time_window == time_window,
            models.StockRanking.ranking_type == ranking_type)) \
        .all()

    inserted_or_updated = []
    for db_ranking in existing_rankings:
        if db_ranking.ticker not in current_rankings_by_ticker:
            # Delete those that don't exist anymore
            db.session.delete(db_ranking)
            db.session.commit()
        else:
            # Update those that do exist
            current_ranking: Ranking = current_rankings_by_ticker[db_ranking.ticker]
            db_ranking.rank = current_ranking.rank
            db_ranking.value = current_ranking.value
            db_ranking.last_updated_at = datetime.datetime.utcnow()
            inserted_or_updated.append(db_ranking)
            del current_rankings_by_ticker[db_ranking.ticker]

    # Add all the new ones
    for ticker, ranking in current_rankings_by_ticker.items():
        inserted_or_updated.append(
            models.StockRanking(ticker=ranking.ticker,
                                ranking_type=ranking.ranking_type,
                                time_window=ranking.time_window,
                                rank=ranking.rank,
                                value=ranking.value,
                                last_updated_at=datetime.datetime.utcnow())
        )

    db.session.bulk_save_objects(inserted_or_updated)
    db.session.commit()

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

    print (f'Total rankings: {len(rankings)}')

    end = time.time()
    print(f'END   -- Time: {end - start}')
    return rankings