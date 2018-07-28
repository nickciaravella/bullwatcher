from typing import List

from app.data_access import bullwatcherdb
from app.domain.patterns import PatternTicker, PatternStock, DailyPatterns
from app.handlers.stocks.sync.patterns import flags
from app.utils import date_utils
from datetime import datetime, timedelta


def sync_patterns() -> DailyPatterns:
    """
    Searches all of the stocks to find patterns and stores them into
    the database. Returns a list of StockMeatadata objects for the patterns
    that it found.
    """
    all_tickers = bullwatcherdb.get_all_stock_daily_tickers()

    skip = 0
    top = 100
    tickers_found = []
    while skip <= len(all_tickers):
        tickers_found += _sync_tickers(all_tickers[skip:skip+top])
        skip += top

    date = date_utils.next_market_day()
    bullwatcherdb.set_flag_pattern_tickers(date, tickers_found)


def get_flags() -> DailyPatterns:
    """
    Gets the list of flags for the most recent date.
    """
    return get_flags_for_date(bullwatcherdb.get_max_pattern_sync_date())


def get_flags_for_date(date) -> DailyPatterns:
    """
    Gets the list of flags for the date provided.
    In: datetime.datetime
    """
    pattern_tickers = bullwatcherdb.get_flag_pattern_tickers(date)
    return _get_sorted_metadata_for_tickers(date, pattern_tickers)


def flag_vote(date: datetime, ticker: str, vote_delta: int) -> DailyPatterns:
    """
    Updates the ticker on the date given with a vote.
    In: date: datetime.datetime
    In: ticker: string
    In: vote_delta: int - will be added to the current vote count
    """
    pattern_ticker = bullwatcherdb.add_vote_for_flag_pattern(date, ticker, vote_delta)
    return _get_sorted_metadata_for_tickers(date, [pattern_ticker]).pattern_stocks[0]


def _sync_tickers(tickers: List[str]):
    today = datetime.today()
    two_weeks_ago = today - timedelta(days=14)
    dailies_dict = bullwatcherdb.get_batch_stock_daily(tickers,
                                                       two_weeks_ago,
                                                       today)
    return flags.pick_tickers(dailies_dict)


def _get_sorted_metadata_for_tickers(date: datetime, pattern_tickers: List[PatternTicker]) -> DailyPatterns:
    if not pattern_tickers:
        return DailyPatterns(date, [])

    patterns_by_tickers = {pt.ticker: pt for pt in pattern_tickers}
    metadatas = bullwatcherdb.get_batch_stock_metadata(patterns_by_tickers.keys())
    pattern_stocks = [
        PatternStock(stock_metadata=m,
                     pattern_type=patterns_by_tickers[m.ticker].pattern_type,
                     votes=patterns_by_tickers[m.ticker].votes)
        for m in metadatas
    ]
    sorted_pattern_stocks = sorted(pattern_stocks,
                                   key=lambda ps: (ps.votes, ps.stock_metadata.market_cap),
                                   reverse=True)
    return DailyPatterns(date=date, pattern_stocks=sorted_pattern_stocks)


