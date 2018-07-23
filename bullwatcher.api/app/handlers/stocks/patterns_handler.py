from app.data_access import bullwatcherdb
from app.handlers.stocks.sync.patterns import flags
from app.utils import date_utils
from datetime import datetime, timedelta


def sync_patterns():
    all_tickers = bullwatcherdb.get_all_stock_daily_tickers()

    skip = 0
    top = 100
    tickers_found = []
    while skip <= len(all_tickers):
        tickers_found += sync_tickers(all_tickers[skip:skip+top])
        skip += top

    bullwatcherdb.set_flag_pattern_tickers(date_utils.next_market_day(), tickers_found)
    return sorted(bullwatcherdb.get_batch_stock_metadata(tickers_found), key=lambda m: m.market_cap, reverse=True)


def sync_tickers(tickers):
    today = datetime.today()
    two_weeks_ago = today - timedelta(days=14)
    dailies_dict = bullwatcherdb.get_batch_stock_daily(tickers,
                                                       two_weeks_ago,
                                                       today)
    return flags.pick_tickers(dailies_dict)
