import requests
import time
from app.domain.stocks import StockMetadata
from datetime import datetime

_exchange_csvs = [
    'http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NYSE&render=download',
    'http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&render=download'
]

# Assume that the CSV only changes once per day and only load the
# data once per day.
# Key = (url_to_csv, date)
_cached_csvs = {}

def get_stock_metadata():
    stocks = []
    today = datetime.utcnow().date()
    for csv_url in _exchange_csvs:
        csv_key = (csv_url, today)
        new_stocks = []

        if csv_key in _cached_csvs:
            new_stocks = _cached_csvs[csv_key]
        else:
            print('START -- GET ' + csv_url)
            start = time.time()

            data = requests.get(csv_url)

            end = time.time()
            print('END   -- Time: ' + str(end - start))

            new_stocks = _parse_stock_info(data.text)
            _cached_csvs[csv_key] = new_stocks

        stocks += new_stocks

    return sorted(stocks, key=lambda s: s.market_cap, reverse=True)


def _parse_stock_info(csv):
    stocks = []
    for line in csv.split('\r\n')[1:]:
        columns = [c.strip('"') for c in line.split('","')]
        if len(columns) < 8:
            continue
        if columns[6] == 'n/a' or columns[7] == 'n/a':
            continue

        stocks.append(StockMetadata(
            columns[0].strip(),
            columns[1].strip(),
            float(columns[3].strip()),
            columns[6].strip()
        ))

    return stocks
