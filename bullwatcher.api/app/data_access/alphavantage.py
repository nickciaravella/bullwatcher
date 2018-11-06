from typing import Any, Dict, List

import json
import os
import requests
import time

from app.data_access import http
from app.domain.common import TimeWindow
from app.domain.sectors import SectorId, SectorPerformance
from app.domain.stocks import StockDaily, MovingAverage, OnBalanceVolume


def get_url(function, symbol=None):
    api_key = os.environ['ALPHAVANTAGE_API_KEY']

    url: str = f'https://www.alphavantage.co/query?function={function}&apikey={api_key}'
    if symbol:
        url += f'&symbol={symbol}'

    return url


def _make_request(url):
    print('START -- GET ' + url)
    start = time.time()

    response = requests.get(url)
    data = json.loads(response.text)

    end = time.time()
    print('END   -- Time: ' + str(end - start))
    return data

# https://www.alphavantage.co/documentation/#sector
def get_sector_performances() -> List[SectorPerformance]:
    key_to_sector_id: Dict[str, SectorId] = {
        "Communication Services": SectorId.TELECOMMUNICATION_SERVICES,
        "Consumer Discretionary": SectorId.CONSUMER_DISCRETIONARY,
        "Consumer Staples": SectorId.CONSUMER_STAPLES,
        "Energy": SectorId.ENERGY,
        "Financials": SectorId.FINANCIALS,
        "Health Care": SectorId.HEALTH_CARE,
        "Industrials": SectorId.INDUSTRIALS,
        "Information Technology": SectorId.TECHNOLOGY,
        "Materials": SectorId.MATERIALS,
        "Real Estate": SectorId.REAL_ESTATE,
        "Utilities": SectorId.UTILITIES
    }

    key_to_time_window: Dict[str, TimeWindow] = {
        "Rank C: 5 Day Performance": TimeWindow.ONE_WEEK,
        "Rank D: 1 Month Performance": TimeWindow.ONE_MONTH,
        "Rank E: 3 Month Performance": TimeWindow.THREE_MONTHS,
        "Rank G: 1 Year Performance": TimeWindow.ONE_YEAR,
        "Rank H: 3 Year Performance": TimeWindow.THREE_YEARS,
        "Rank I: 5 Year Performance": TimeWindow.FIVE_YEARS
    }

    sector_json: Any = http.get_json(get_url('SECTOR'))

    sector_performances: List[SectorPerformance] = []
    for time_window_key in sector_json:
        if time_window_key not in key_to_time_window:
            continue

        for sector_key in sector_json[time_window_key]:
            if sector_key not in key_to_sector_id:
                continue

            sector_performances.append(
                SectorPerformance(id=key_to_sector_id[sector_key],
                                  time_window=key_to_time_window[time_window_key],
                                  percent_change=float(sector_json[time_window_key][sector_key].rstrip('%')))
            )

    return sector_performances

# https://www.alphavantage.co/documentation/#daily
def get_stock_daily(ticker):
    url = get_url('time_series_daily', ticker)
    # url += '&outputsize=full'
    data = _make_request(url)
    return [StockDaily(date,
                       float(info["1. open"]),
                       float(info["2. high"]),
                       float(info["3. low"]),
                       float(info["4. close"]),
                       float(info["5. volume"])
                       ) for date, info in data["Time Series (Daily)"].items()]

# https://www.alphavantage.co/documentation/#sma
def get_moving_average(ticker, interval):
    url = get_url('SMA', ticker)
    url += f'&interval=daily&time_period={interval}&series_type=close'
    response = requests.get(url)
    data = json.loads(response.text)
    time_period = data['Meta Data']['5: Time Period']
    sma_dict = data['Technical Analysis: SMA']
    return [MovingAverage(date, time_period, date_data['SMA']) for date, date_data in sma_dict.items()]

# https://www.alphavantage.co/documentation/#obv
def get_on_balance_volume(ticker):
    url = get_url('OBV', ticker)
    url += f'&interval=daily'
    response = requests.get(url)
    data = json.loads(response.text)
    analysis_dict = data['Technical Analysis: OBV']
    return [OnBalanceVolume(date, date_data['OBV']) for date, date_data in analysis_dict.items()]

# Stochastics: https://www.alphavantage.co/documentation/#stoch
def get_stochastics(ticker):
    url = get_url('STOCH', ticker)
    url += f'&interval=daily'
    response = requests.get(url)
    print(response.text)

# https://www.alphavantage.co/documentation/#bbands
def get_bollinger_bands(ticker):
    pass

# https://www.alphavantage.co/documentation/#sector-information
def get_sector_performance():
    pass
