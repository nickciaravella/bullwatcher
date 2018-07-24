from app.data_access import bullwatcherdb
from app.handlers.stocks.sync.patterns import flags
from app.utils import date_utils
from datetime import datetime, timedelta


def sync_patterns():
    '''
    Searches all of the stocks to find patterns and stores them into
    the database. Returns a list of StockMeatadata objects for the patterns
    that it found.
    Out: List<StockMetadata>
    '''
    all_tickers = bullwatcherdb.get_all_stock_daily_tickers()

    skip = 0
    top = 100
    tickers_found = []
    while skip <= len(all_tickers):
        tickers_found += sync_tickers(all_tickers[skip:skip+top])
        skip += top

    bullwatcherdb.set_flag_pattern_tickers(date_utils.next_market_day(), tickers_found)
    return _get_sorted_metadata_for_tickers(tickers_found)


def get_flags():
    '''
    Gets the list of flags for the most recent date.
    Out: List<StockMetadata>
    '''
    return get_flags_for_date(bullwatcherdb.get_max_pattern_sync_date())


def get_flags_for_date(date):
    '''
    Gets the list of flags for the date provided.
    In: datetime.datetime
    Out: List<StockMetadata>
    '''
    tickers = bullwatcherdb.get_flag_pattern_tickers(date)
    return _get_sorted_metadata_for_tickers(tickers)


def sync_tickers(tickers):
    today = datetime.today()
    two_weeks_ago = today - timedelta(days=14)
    dailies_dict = bullwatcherdb.get_batch_stock_daily(tickers,
                                                       two_weeks_ago,
                                                       today)
    return flags.pick_tickers(dailies_dict)


def _get_sorted_metadata_for_tickers(tickers):
    if not tickers:
        return []
    return sorted(bullwatcherdb.get_batch_stock_metadata(tickers), key=lambda m: m.market_cap, reverse=True)

