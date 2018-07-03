import requests
from app.domain.stocks import StockMetadata


_exchange_csvs = [
    'http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NYSE&render=download',
    'http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&render=download'
]


def get_stock_metadata():
    stocks = []
    for csv_url in _exchange_csvs:
        data = requests.get(csv_url)
        stocks += _parse_stock_info(data.text)
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
