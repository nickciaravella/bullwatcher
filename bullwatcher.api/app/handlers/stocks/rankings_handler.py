from typing import Dict, List, Set, Tuple

import datetime
from operator import itemgetter

from app.data_access import bullwatcherdb
from app.domain.common import TimeWindow
from app.domain.exceptions import HttpError
from app.domain.rankings import Ranking, RankingType
from app.domain.stocks import StockDaily


def get_rankings(ranking_type: str, time_window: str) -> List[Ranking]:
    if not RankingType.is_valid(ranking_type):
        raise HttpError(
            status_code=400,
            message='Bad Request',
            response_data=f'ranking_type is not valid: {ranking_type}'
        )
    if not TimeWindow.is_valid(time_window):
        raise HttpError(
            status_code=400,
            message='Bad Request',
            response_data=f'time_window is not valid: {time_window}'
        )

    return bullwatcherdb.get_rankings(time_window=time_window, ranking_type=ranking_type)


def sync_rankings():

    # Part 0: Load all the data
    all_tickers = bullwatcherdb.get_all_stock_daily_tickers()

    search_dates: Set[datetime.date] = set()
    today: datetime.date = datetime.datetime.today().date()
    for tuple in TimeWindow.to_asc_delta_tuple_array() + [('', datetime.timedelta(days=0))]:
        delta: datetime.timedelta = tuple[1]
        base_search_date = today - delta
        search_dates.add(base_search_date - datetime.timedelta(days=3))
        search_dates.add(base_search_date - datetime.timedelta(days=2))
        search_dates.add(base_search_date - datetime.timedelta(days=1))
        search_dates.add(base_search_date)

    dailies_per_ticker: Dict[str, List[StockDaily]] = bullwatcherdb.get_batch_stock_daily_for_dates(
        tickers=all_tickers,
        dates=list(search_dates))
    print("[RANKINGS] Tickers loaded: " + str(len(dailies_per_ticker)))

    rankings_dict: Dict[RankingType, Dict[TimeWindow, List[Tuple[float, float, str]]]] = {
        RankingType.PRICE_PERCENT_CHANGE: {
            tuple[0]: [] for tuple in TimeWindow.to_asc_delta_tuple_array()
        }
    }

    # EXTENSION POINT: To rank other things, add another handler here.
    # Params: List[StockDaily]
    # Return: Dict[RankingType, Dict[TimeWindow, Tuple[float, float]]]
    #                                               effective value, value
    # Update dates that are searched for (with caution).
    ranking_handlers = [
        handle_price_percent_change
    ]

    # Part I: Determine values for all of the tickers
    print("[RANKINGS] PROCESSING TICKERS")
    for ticker in dailies_per_ticker:
        if not len(dailies_per_ticker[ticker]) > 1:
            # Ticker not found or only 1 day
            continue

        for ranking_handler in ranking_handlers:
            ranking_per_time_window_per_type = ranking_handler(dailies_per_ticker[ticker])
            for ranking_type in ranking_per_time_window_per_type:
                for time_window in ranking_per_time_window_per_type[ranking_type]:
                    effective_value, actual_value = ranking_per_time_window_per_type[ranking_type][time_window]
                    rankings_dict[ranking_type][time_window].append((effective_value, actual_value, ticker))

    # Part II: Sort the tickers by their value for each ranking & time window
    print("[RANKINGS] SORTING TICKERS BY VALUES")
    for ranking_type in rankings_dict:
        for time_window in rankings_dict[ranking_type]:
            rankings_dict[ranking_type][time_window].sort(key=itemgetter(0), reverse=True)

    # Part III: Assign ranks
    print("[RANKINGS] ASSIGNING RANKS")
    for ranking_type in rankings_dict:
        for time_window in rankings_dict[ranking_type]:

            rankings: List[Ranking] = []

            for i, ranking_tuple in enumerate(rankings_dict[ranking_type][time_window]):
                rankings.append(Ranking(
                    ticker=ranking_tuple[2],
                    ranking_type=ranking_type,
                    time_window=time_window,
                    rank=i+1,
                    value=ranking_tuple[1],
                ))

            print(f'[RANKINGS] SAVING TO DATABASE: {ranking_type} {time_window}')
            bullwatcherdb.merge_rankings(rankings=rankings,
                                         ranking_type=ranking_type,
                                         time_window=time_window)

    print("[RANKINGS] DONE")


def handle_price_diff_percent(dailies: List[StockDaily]) -> Dict[TimeWindow, float]:
    """
    Returns the price difference from the time window ago.
    If the time_window goes further than the history of the StockDaily, then the first StockDaily is used.
    The time_window always ends with the _most recent_ StockDaily, which may or may not be today.

    NOTE: IT IS ASSUMED THAT THE BATCH OF STOCKDAILY ARE ORDERED DESCENDING!
    """
    time_window_to_delta: List[Tuple[str, datetime.timedelta]] = TimeWindow.to_asc_delta_tuple_array()

    result_dict = {}
    time_window_index = 0
    end_daily = dailies[0]
    start_date: datetime.date = datetime.datetime.today().date() - time_window_to_delta[time_window_index][1]
    previous_daily = None
    for daily in reversed(dailies):
        while daily.date >= start_date:
            should_add = False
            if previous_daily and previous_daily.date < start_date and daily.date > start_date:
                start_value = previous_daily.close
                should_add = True
            if start_date == daily.date:
                start_value = daily.close
                should_add = True
            if should_add:
                result_dict[time_window_to_delta[time_window_index][0]] = ((end_daily.close - start_value) / start_value) * 100

            time_window_index += 1
            if time_window_index == len(time_window_to_delta):
                return result_dict
            start_date: datetime.date = datetime.datetime.today().date() - time_window_to_delta[time_window_index][1]

        previous_daily = daily

    return result_dict


def handle_price_percent_change(dailies: List[StockDaily]) -> Dict[RankingType, Dict[TimeWindow, Tuple[float, float]]]:
    ret = {
        RankingType.PRICE_PERCENT_CHANGE: {},
    }

    values_per_time_window = handle_price_diff_percent(dailies)
    for time_window in values_per_time_window:
        value = values_per_time_window[time_window]
        ret[RankingType.PRICE_PERCENT_CHANGE][time_window] = (value, value)

    return ret
