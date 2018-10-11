from typing import List, Optional

from application import db
from app.data_access.bullwatcherdb.common import commit_with_rollback
from app.database import conversion, models
from app.domain.stocks import StockMetadata
from sqlalchemy import func, or_
import time


def save_batch_stock_metadata(stock_metadatas):
    print('START -- DB save_batch_stock_metadata: ' + str(len(stock_metadatas)) + ' metadatas')
    start = time.time()

    db.session.query(models.StockMetadata).filter(
        models.StockMetadata.ticker.in_([s.ticker for s in stock_metadatas])
    ).delete(synchronize_session='fetch')

    db.session.add_all(conversion.convert_stock_metadata(metadata) for metadata in stock_metadatas)
    commit_with_rollback(db.session)

    end = time.time()
    print('END   -- Time: ' + str(end - start))


def get_all_stock_metadata():
    print('START -- DB get_all_stock_metadata')
    start = time.time()

    metadatas: List[models.StockMetadata] = db.session.query(models.StockMetadata).order_by(
        models.StockMetadata.market_cap.desc()
    ).all()

    converted: List[StockMetadata] = [
        StockMetadata(m.ticker, m.company_name, m.market_cap, m.sector)
        for m in metadatas
    ]

    end = time.time()
    print('END   -- Time: ' + str(end - start))
    return converted


def search_stock_metadata_by_prefix(prefix: str, max_results: int):
    print('START -- DB get_all_stock_metadata')
    start = time.time()

    metadatas: List[models.StockMetadata] = db.session.query(models.StockMetadata)\
        .filter(or_(
            models.StockMetadata.ticker.like(f'{prefix.upper()}%'),
            func.lower(models.StockMetadata.company_name).like(f'{prefix.lower()}%')
        ))\
        .order_by(models.StockMetadata.market_cap.desc())\
        .limit(max_results)\
        .all()

    converted: List[StockMetadata] = [
        StockMetadata(m.ticker, m.company_name, m.market_cap, m.sector)
        for m in metadatas
    ]

    end = time.time()
    print('END   -- Time: ' + str(end - start))
    return converted


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


def get_stock_metadata(ticker: str):
    print(f'START -- DB get_stock_metadata: {ticker}')
    start = time.time()

    db_metadata: Optional[models.StockMetadata] = models.StockMetadata \
        .query \
        .filter(func.lower(models.StockMetadata.ticker) == func.lower(ticker)) \
        .one_or_none()

    end = time.time()
    print('END   -- Time: ' + str(end - start))

    if db_metadata:
        return StockMetadata(db_metadata.ticker, db_metadata.company_name, db_metadata.market_cap, db_metadata.sector)
    else:
        return None
