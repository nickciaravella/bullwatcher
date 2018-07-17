from datetime import datetime
from app.data_access import bullwatcherdb, iex
from app.domain.stocks import StockMetadata, StockSyncStatus
import app.data_access.alphavantage as alpha
import time

def sync(count):
    all_tickers = iex.get_ticker_list()
    tickers_to_sync = set(_get_tickers_that_need_to_sync(all_tickers)[:count])

    if not tickers_to_sync:
        return []

    functions = [
        _sync_metadata,
        _sync_daily
    ]
    for function in functions:
        function(tickers_to_sync)

    new_statuses = [StockSyncStatus(ticker, datetime.utcnow()) for ticker in tickers_to_sync]
    bullwatcherdb.save_stock_sync_statuses(new_statuses)

    return new_statuses


def _get_tickers_that_need_to_sync(input_tickers):
    statuses = bullwatcherdb.get_stock_sync_statuses()
    ticker_by_sync_date = { s.ticker: s.synced_until for s in statuses }
    return [t for t in input_tickers
              if t not in ticker_by_sync_date or ticker_by_sync_date[t].date() < datetime.utcnow().date()]


def _sync_metadata(tickers):
    stocks_to_save = iex.get_stock_metadata(tickers)
    bullwatcherdb.save_batch_stock_metadata(stocks_to_save)


def _sync_daily(tickers):
    dailies_dict = iex.get_stock_dailies(tickers)
    bullwatcherdb.save_batch_stock_daily(dailies_dict)
