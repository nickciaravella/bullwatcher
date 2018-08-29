from typing import Dict, List

from app.domain.stocks import StockCurrent, StockDaily, StockMetadata
from app.data_access import http
from datetime import datetime


def get_ticker_list():
    stock_array = http.get_json('https://api.iextrading.com/1.0/ref-data/symbols')
    return [s['symbol'].upper() for s in stock_array if s['type'] == 'cs']


def get_stock_metadata(tickers):
    if len(tickers) > 100:
        raise Exception('More than 100 tickers is not supported.')

    symbols = ','.join(tickers)
    all_company_data = http.get_json(f'https://api.iextrading.com/1.0/stock/market/batch?symbols={symbols}&types=company,stats')

    metadatas = []
    for symbol, data in all_company_data.items():
        metadatas.append(
            StockMetadata(symbol.upper(), data['company']['companyName'], data['stats']['marketcap'], data['company']['sector'])
        )

    return metadatas


def get_stock_dailies(tickers: List[str], range_: str) -> Dict[str, List[StockDaily]]:
    """
    Gets a dictionary of ticker to list of StockDaily. If there is no data for the given ticker, then it will
    be omitted from the dictionary.
    :param range_: Supported values: '1m', '2y'
    """
    if len(tickers) > 100:
        raise Exception('More than 100 tickers is not supported.')

    symbols = ','.join(tickers)
    all_dailies = http.get_json(f'https://api.iextrading.com/1.0/stock/market/batch?symbols={symbols}&types=chart,quote&range={range_}')

    dailies = {}
    for symbol, data in all_dailies.items():
        chart = data['chart']
        max_date = None
        dailies[symbol] = []
        for daily in chart:
            try:
                stock_daily = StockDaily(daily['date'],
                                         daily['open'],
                                         daily['high'],
                                         daily['low'],
                                         daily['close'],
                                         daily['volume'])

                max_date = stock_daily.date if not max_date else max(max_date, stock_daily.date)

                if None in [stock_daily.date, stock_daily.open, stock_daily.high, stock_daily.low,
                            stock_daily.close, stock_daily.volume]:
                    continue

                dailies[symbol].append(stock_daily)
            except KeyError:
                # For some reason, sometimes IEX is missing some data.
                # Just skip the data for that date.
                print("Missed day of data for " + symbol)

        # Try to get the latest day from the quote if it wasn't already added
        # to the chart data.
        try:
            quote = data['quote']
            quote_datetime = datetime.utcfromtimestamp(quote['closeTime']/1000)
            open_datetime = datetime.utcfromtimestamp(quote['openTime']/1000)
            if open_datetime > quote_datetime:
                print('Open date > close date, skipping this quote')
            elif quote_datetime and max_date and quote_datetime.date() > max_date:
                formatted_date = quote_datetime.strftime('%Y-%m-%d')
                quote_daily = StockDaily(formatted_date,
                                         quote['open'],
                                         quote['high'],
                                         quote['low'],
                                         quote['close'],
                                         quote['avgTotalVolume'])

                if None in [quote_daily.date, quote_daily.open, quote_daily.high, quote_daily.low,
                            quote_daily.close, quote_daily.volume]:
                    raise ValueError("One of the values are None")

                dailies[symbol].append(quote_daily)
        except Exception as e:
            print("Could not parse quote for " + symbol)
            print(e)

    return dailies


def get_stock_current(ticker: str) -> StockCurrent:
    quote: Dict[str, any] = http.get_json(f'https://api.iextrading.com/1.0/stock/{ticker}/quote')
    return StockCurrent(
        last_updated_time=datetime.utcfromtimestamp(quote['latestUpdate']/1000),
        current_price=quote['latestPrice'],
        open_=quote['open'],
        high=quote['high'],
        low=quote['low'],
        volume=quote['latestVolume'],
        previous_close=quote['previousClose'],
    )

