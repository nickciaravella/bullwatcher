from application import db
from app.database import conversion, models
from app.domain.stocks import StockSyncStatus, StockMetadata
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


def save_stock_daily(ticker, dailys):
    print('START -- DB save_stock_daily: ' + ticker)
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
