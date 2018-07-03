from application import db
from app.database import conversion, models
from app.domain.stocks import StockSyncStatus

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
