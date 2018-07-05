from app.domain.stocks import StockDaily, MovingAverage, OnBalanceVolume
import json
import os
import requests
import time


def get_url(function, symbol):
    api_key = os.environ['ALPHAVANTAGE_API_KEY']
    return f'https://www.alphavantage.co/query?function={function}&symbol={symbol}&apikey={api_key}'

def _make_request(url):
    print('START -- GET ' + url)
    start = time.time()

    response = requests.get(url)
    data = json.loads(response.text)

    end = time.time()
    print('END   -- Time: ' + str(end - start))
    return data

# https://www.alphavantage.co/documentation/#daily
def get_stock_daily(ticker):
    url = get_url('time_series_daily', ticker)
    # url += '&outputsize=full'
    data = _make_request(url)
    return [StockDaily(date, info) for date, info in data["Time Series (Daily)"].items()]

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
