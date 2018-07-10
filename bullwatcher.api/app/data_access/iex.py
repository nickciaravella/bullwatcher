from app.domain.stocks import StockDaily, StockMetadata
from app.data_access import http


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


def get_stock_dailies(tickers):
    if len(tickers) > 100:
        raise Exception('More than 100 tickers is not supported.')

    symbols = ','.join(tickers)
    all_dailies = http.get_json(f'https://api.iextrading.com/1.0/stock/market/batch?symbols={symbols}&types=chart&range=1m')

    dailies = {}
    for symbol, data in all_dailies.items():
        chart = data['chart']
        dailies[symbol] = []
        for daily in chart:
            try:
                dailies[symbol].append(
                    StockDaily(daily['date'],
                               daily['open'],
                               daily['high'],
                               daily['low'],
                               daily['close'],
                               daily['volume']))
            except KeyError:
                # For some reason, sometimes IEX is missing some data.
                # Just skip the data for that date.
                print("Missed day of data for " + symbol)

    return dailies
