from application import db
from app.database import conversion, models
from app.domain.stocks import StockSyncStatus, StockMetadata, StockDaily
from datetime import datetime
from flask_sqlalchemy import get_debug_queries
from sqlalchemy import and_, func
import time


def save_batch_stock_metadata(stock_metadatas):
    print('START -- DB save_batch_stock_metadata: ' + str(len(stock_metadatas)) + ' metadatas')
    start = time.time()

    db.session.query(models.StockMetadata).filter(
        models.StockMetadata.ticker.in_([s.ticker for s in stock_metadatas])
    ).delete(synchronize_session='fetch')

    db.session.add_all(conversion.convert_stock_metadata(metadata) for metadata in stock_metadatas)
    db.session.commit()

    end = time.time()
    print('END   -- Time: ' + str(end - start))


def get_batch_stock_metadata(tickers):
    print('START -- DB get_batch_stock_metadata: ' + str(len(tickers)) + ' tickers')
    start = time.time()

    db_metadatas = db.session.query(models.StockMetadata).filter(
        models.StockMetadata.ticker.in_(tickers)
    )

    metadatas = [
        StockMetadata(m.ticker, m.company_name, m.market_cap, m.sector)
        for m in db_metadatas
    ]

    end = time.time()
    print('END   -- Time: ' + str(end - start))
    return metadatas


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
    '''
    Gets a list of all the tickers that have StockDaily entries.
    Out: List<string>
    '''
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


def get_batch_stock_daily(tickers, min_date, max_date):
    '''
    Gets a dictionary of ticker -> list of StockDaily. The stock daily objects will be sorted by date descending
    but may not include the min_date, max_date, or dates in between (i.e. weekends and holidays). If there are
    no StockDaily objects found for a specific ticker, that ticker will be omitted from the dictionary.
    '''
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


def set_flag_pattern_tickers(date, tickers):
    '''
    Sets the tickers to be the discovered flag pattern tickers for the date.
    Any already found tickers will be deleted and overwritten by this new set
    of tickers.
    In: Date, List<string>
    Out: None
    '''
    print(f'START -- DB set_flag_pattern_tickers: {len(tickers)} tickers')
    start = time.time()

    tickers = set(tickers)

    current_flags = db.session \
        .query(models.PatternDaily) \
        .filter(models.PatternDaily.flag_votes.isnot(None))

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


def _to_date_int(date):
    return date.day * 1 + date.month * 100 + date.year * 10000


def _to_date_str(date_int):
    year = date_int // 10000
    month = (date_int // 100) % 100
    day = date_int % 100
    datetime_ = datetime(year, month, day)
    return datetime_.strftime('%Y-%m-%d')


def _print_debug_queries():
    print('=========================================')
    print('========== DEBUG QUERIES ================')
    print('=========================================')
    print(get_debug_queries())
    print('=========================================')
    print('========== END OF QUERIES ===============')
    print('=========================================')
