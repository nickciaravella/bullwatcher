from application import db
from app.database import conversion, models
from app.domain.stocks import StockSyncStatus
import time


def save_batch_stock_metadata(stock_metadatas):
    for metadata in stock_metadatas:
        db.session.merge(conversion.convert_stock_metadata(metadata))
    db.session.commit()


def get_stock_sync_statuses():
    return [StockSyncStatus(m.ticker, m.synced_until) for m in models.StockSyncStatus.query.all()]


def save_stock_sync_statuses(statuses):
    for status in statuses:
        db_status = models.StockSyncStatus()
        db_status.ticker = status.ticker
        db_status.synced_until = status.synced_until
        db.session.merge(db_status)
    db.session.commit()


def save_stock_daily(ticker, dailys):
    print('START -- DB save_stock_daily:' + ticker)
    start = time.time()

    latest = db.session.query(models.StockDaily).filter(
        models.StockDaily.ticker == ticker).order_by(
        models.StockDaily.date.desc()).first()
    if latest:
        print('Latest synced stock prices: ' + str(latest.date))
    for daily in dailys:
        if not latest or _to_date_int(daily.date) <= latest.date:
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
    db.session.commit()

    end = time.time()
    print('END   -- Time: ' + str(end - start))


def _to_date_int(date):
    return date.day * 1 + date.month * 100 + date.year * 10000
