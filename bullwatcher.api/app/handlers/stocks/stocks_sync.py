from datetime import datetime
from app.data_access import bullwatcherdb, exchanges
from app.domain.stocks import StockMetadata, StockSyncStatus


def sync(count):
    all_stocks = exchanges.get_stock_metadata()
    tickers_to_sync = set(_get_tickers_that_need_to_sync([s.ticker for s in all_stocks]))

    stocks_to_save = [stock for stock in all_stocks if stock.ticker in tickers_to_sync][:count]
    bullwatcherdb.save_batch_stock_metadata(stocks_to_save)

    new_statuses = [StockSyncStatus(s.ticker, datetime.utcnow()) for s in stocks_to_save]
    bullwatcherdb.save_stock_sync_statuses(new_statuses)

    return new_statuses


def _get_tickers_that_need_to_sync(input_tickers):
    statuses = bullwatcherdb.get_stock_sync_statuses()
    ticker_by_sync_date = { s.ticker: s.synced_until for s in statuses }
    return [t for t in input_tickers
              if t not in ticker_by_sync_date or ticker_by_sync_date[t].date() < datetime.utcnow().date()]
