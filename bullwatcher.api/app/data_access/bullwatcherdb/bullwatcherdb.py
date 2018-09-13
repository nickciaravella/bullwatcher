from typing import Dict, List, Optional

from application import db
from app.database import conversion, models
from app.domain.stocks import StockSyncStatus, StockMetadata, StockDaily
from app.domain.patterns import PatternTicker, PatternType, PatternVote
from datetime import date, datetime
from flask_sqlalchemy import get_debug_queries
from sqlalchemy import and_, func
import time


def get_sync_statuses() -> Dict[str, datetime]:
    """
    Returns a dictionary of sync job name to the synced until datetime.
    """
    print('START -- DB get_sync_statuses')
    start = time.time()

    statuses: List[models.SyncStatus] = models.SyncStatus.query.all()
    ret: Dict[str, datetime] = {
        s.sync_job: s.synced_until
        for s in statuses
    }

    end = time.time()

    print('END   -- Time: ' + str(end - start))
    return ret


def set_sync_job_synced_until(sync_job: str, synced_until: datetime) -> None:
    """
    Sets the synced until datetime for a specific sync job.
    """
    print(f'START -- DB set_sync_job_synced_until: job: {sync_job}, synced_until: {synced_until}')
    start = time.time()

    db.session.merge(models.SyncStatus(sync_job=sync_job, synced_until=synced_until, last_updated_at=datetime.utcnow()))
    db.session.commit()

    end = time.time()
    print('END   -- Time: ' + str(end - start))


def get_stock_sync_statuses():
    print('START -- DB get_stock_sync_statuses')
    start = time.time()

    ret = [StockSyncStatus(m.ticker, m.synced_until) for m in models.StockSyncStatus.query.all()]

    end = time.time()

    print('END   -- Time: ' + str(end - start))
    return ret


def save_stock_sync_statuses(statuses):
    print('START -- DB save_stock_sync_statuses: ' + str(len(statuses)) + ' statuses')
    start = time.time()

    db_statuses = db.session.query(models.StockSyncStatus).filter(
        models.StockSyncStatus.ticker.in_([s.ticker for s in statuses])
    ).delete(synchronize_session='fetch')

    def create_status(status):
        db_status = models.StockSyncStatus()
        db_status.ticker = status.ticker
        db_status.synced_until = status.synced_until
        return db_status
    db.session.add_all(create_status(s) for s in statuses)
    db.session.commit()

    end = time.time()
    print('END   -- Time: ' + str(end - start))


def get_all_stock_daily_tickers():
    """
    Gets a list of all the tickers that have StockDaily entries.
    Out: List<string>
    """
    print('START -- DB get_all_stock_daily_tickers')
    start = time.time()

    results = db.session.query(models.StockDaily.ticker.distinct().label('ticker')).all()

    end = time.time()
    print(f'Found {len(results)} tickers.')
    print('END   -- Time: ' + str(end - start))

    return [r.ticker for r in results]


def save_batch_stock_daily(dailies_dict):
    # Chart API typically doesn't get updated until 2am. So to get the
    # current day, use the Quote API.

    print('START -- DB save_batch_stock_daily: ' + str(len(dailies_dict)) + ' tickers')
    start = time.time()

    latest = db.session.query(models.StockDaily.ticker, func.max(models.StockDaily.date).label('max_date')).filter(
        models.StockDaily.ticker.in_(dailies_dict.keys())).group_by(models.StockDaily.ticker).all()

    latest_per_ticker = {
        i.ticker: i.max_date for i in latest
    }

    count = 0
    for ticker in dailies_dict:
        if ticker in latest_per_ticker:
            print(f'{ticker}: Sync only after {str(latest_per_ticker[ticker])}')

        for daily in dailies_dict[ticker]:
            if ticker in latest_per_ticker and _to_date_int(daily.date) <= latest_per_ticker[ticker]:
                continue
            db_daily = models.StockDaily()
            db_daily.date = _to_date_int(daily.date)
            db_daily.ticker = ticker
            db_daily.low_price = daily.low
            db_daily.high_price = daily.high
            db_daily.open_price = daily.open
            db_daily.close_price = daily.close
            db_daily.volume = daily.volume
            db.session.add(db_daily)

            count += 1
            if count % 500 == 0:
                db.session.flush()

    db.session.commit()

    end = time.time()
    print(f'Saved {str(count)} rows.')
    print('END   -- Time: ' + str(end - start))


def get_batch_stock_daily(tickers: List[str], min_date: date, max_date: date) -> Dict[str, StockDaily]:
    """
    Gets a dictionary of ticker -> list of StockDaily. The stock daily objects will be sorted by date descending
    but may not include the min_date, max_date, or dates in between (i.e. weekends and holidays). If there are
    no StockDaily objects found for a specific ticker, that ticker will be omitted from the dictionary.
    """
    db_stock_dailies = db.session \
        .query(models.StockDaily) \
        .filter(and_(
            models.StockDaily.ticker.in_(tickers),
            models.StockDaily.date >= _to_date_int(min_date),
            models.StockDaily.date <= _to_date_int(max_date))) \
        .order_by(models.StockDaily.date.desc()) \
        .all()

    ret = {}
    for db_daily in db_stock_dailies:
        daily = StockDaily(
            date_str=_to_date_str(db_daily.date),
            open_=db_daily.open_price,
            high=db_daily.high_price,
            low=db_daily.low_price,
            close=db_daily.close_price,
            volume=db_daily.volume)

        if db_daily.ticker in ret:
            ret[db_daily.ticker].append(daily)
        else:
            ret[db_daily.ticker] = [daily]
    return ret


def get_batch_stock_daily_for_dates(tickers: List[str], dates: List[date]) -> Dict[str, StockDaily]:
    """
    Gets a dictionary of ticker -> list of StockDaily. The stock daily objects will be sorted by date descending
    but may not include the min_date, max_date, or dates in between (i.e. weekends and holidays). If there are
    no StockDaily objects found for a specific ticker, that ticker will be omitted from the dictionary.
    """
    print(f'START -- DB get_batch_stock_daily_for_dates: Tickers: {len(tickers)}, Dates: {len(dates)}')
    start = time.time()

    db_stock_dailies = db.session \
        .query(models.StockDaily) \
        .filter(and_(
            models.StockDaily.ticker.in_(tickers),
            models.StockDaily.date.in_([_to_date_int(date) for date in dates]))) \
        .order_by(models.StockDaily.date.desc()) \
        .all()

    ret = {}
    for db_daily in db_stock_dailies:
        daily = StockDaily(
            date_str=_to_date_str(db_daily.date),
            open_=db_daily.open_price,
            high=db_daily.high_price,
            low=db_daily.low_price,
            close=db_daily.close_price,
            volume=db_daily.volume)

        if db_daily.ticker in ret:
            ret[db_daily.ticker].append(daily)
        else:
            ret[db_daily.ticker] = [daily]

    end = time.time()
    print(f'Loaded {len(db_stock_dailies)} rows.')
    print('END   -- Time: ' + str(end - start))

    return ret


def get_max_pattern_sync_date():
    """
    Gets the date of the latest day that was synced for patterns.
    Out: datetime.datetime
    """
    print(f'START -- DB get_max_pattern_sync_date')
    start = time.time()

    results = db.session.query(func.max(models.PatternDaily.date).label('max_date')).all()
    date_int = results[0].max_date

    end = time.time()
    print('END   -- Time: ' + str(end - start))

    return _date_int_to_date(date_int)


def get_flag_pattern_tickers(date: datetime) -> List[PatternTicker]:
    """
    Gets the tickers that are considered to be flags for the given date.
    In: datetime.datetime
    Out: List[PatternTicker]
    """
    print(f'START -- DB get_flag_pattern_tickers')
    start = time.time()

    flags = db.session \
        .query(models.PatternDaily) \
        .filter(and_(
            models.PatternDaily.date == _to_date_int(date),
            models.PatternDaily.flag_votes.isnot(None)))

    flag_tickers = [
       PatternTicker(f.ticker, PatternType.FLAG, f.flag_votes) for f in flags
    ]

    end = time.time()
    print('END   -- Time: ' + str(end - start))

    return flag_tickers


def set_flag_pattern_tickers(date, tickers):
    """
    Sets the tickers to be the discovered flag pattern tickers for the date.
    Any already found tickers will be deleted and overwritten by this new set
    of tickers.
    In: datetime.datetime, List<string>
    Out: None
    """
    print(f'START -- DB set_flag_pattern_tickers: {len(tickers)} tickers')
    start = time.time()

    tickers = set(tickers)

    current_flags = db.session \
        .query(models.PatternDaily) \
        .filter(and_(
            models.PatternDaily.date == _to_date_int(date),
            models.PatternDaily.flag_votes.isnot(None)))

    for flag in current_flags:
        if flag.ticker not in tickers:
            flag.flag_votes = None
        else:
            tickers.remove(flag.ticker)

    for ticker in tickers:
        new_flag = models.PatternDaily()
        new_flag.date = _to_date_int(date)
        new_flag.ticker = ticker
        new_flag.flag_votes = 0
        db.session.add(new_flag)

    db.session.commit()

    end = time.time()
    print('END   -- Time: ' + str(end - start))


def add_vote_for_flag_pattern(vote: PatternVote):
    """
    Creates or updates the pattern vote. This updates the pattern to have a vote by the specific user and also
    increments the count of votes for the ticker in the pattern.
    Out: None
    """
    print(f'START -- DB add_vote_for_flag_pattern')
    start = time.time()

    user_vote: models.PatternVotesDaily = db.session \
        .query(models.PatternVotesDaily) \
        .filter(and_(
            models.PatternVotesDaily.date == _to_date_int(vote.date),
            models.PatternVotesDaily.ticker == vote.ticker,
            models.PatternVotesDaily.user_id == vote.user_id
        )) \
        .one_or_none()

    # Create / update / delete the user vote
    vote_delta = 0
    if vote.value == 0 and user_vote:
        vote_delta = vote.value - user_vote.flag_vote
        db.session.delete(user_vote)
    elif vote.value == 0:
        # Don't create any new one
        pass
    elif user_vote:
        vote_delta = vote.value - user_vote.flag_vote
        user_vote.flag_vote = vote.value
    else:
        vote_delta = vote.value
        user_vote = models.PatternVotesDaily()
        user_vote.date = _to_date_int(vote.date)
        user_vote.ticker = vote.ticker
        user_vote.user_id = vote.user_id
        user_vote.flag_vote = vote.value
        db.session.add(user_vote)

    # Create update delete the pattern daily
    flag = models.PatternDaily.query.filter_by(date=_to_date_int(vote.date), ticker=vote.ticker).one_or_none()
    if flag:
        flag.flag_votes += vote_delta
    else:
        flag = models.PatternDaily()
        flag.date = _to_date_int(vote.date)
        flag.ticker = vote.ticker
        flag.flag_votes = vote.value
        db.session.add(flag)

    db.session.commit()

    end = time.time()
    print('END   -- Time: ' + str(end - start))

    return PatternTicker(flag.ticker, PatternType.FLAG, flag.flag_votes)


def get_flag_pattern_user_votes(user_id: str, date: date) -> List[PatternVote]:
     user_votes: models.PatternVotesDaily = db.session \
        .query(models.PatternVotesDaily) \
        .filter(and_(
            models.PatternVotesDaily.date == _to_date_int(date),
            models.PatternVotesDaily.user_id == user_id
        )) \
        .all()

     return [
         PatternVote(date=_date_int_to_date(v.date),
                     user_id=v.user_id,
                     ticker=v.ticker,
                     value=v.flag_vote)
         for v in user_votes
     ]


def _to_date_int(date):
    return date.day * 1 + date.month * 100 + date.year * 10000


def _to_date_str(date_int):
    datetime_ = _date_int_to_date(date_int)
    return datetime_.strftime('%Y-%m-%d')


def _date_int_to_date(date_int):
    year = date_int // 10000
    month = (date_int // 100) % 100
    day = date_int % 100
    return datetime(year, month, day)


def _print_debug_queries():
    print('=========================================')
    print('========== DEBUG QUERIES ================')
    print('=========================================')
    print(get_debug_queries())
    print('=========================================')
    print('========== END OF QUERIES ===============')
    print('=========================================')
