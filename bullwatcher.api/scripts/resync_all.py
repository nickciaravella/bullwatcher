from application import db
from app.data_access import iex


def _to_date_int(date):
    return date.day * 1 + date.month * 100 + date.year * 10000

def resync_all_tickers():
    db.engine.execute('DELETE FROM stock_daily')
    print("Cleared table")

    tickers = iex.get_ticker_list()
    print(f'Found tickers: {len(tickers)}')

    while tickers:
        batch = []
        while tickers and len(batch) < 5:
            batch.append(tickers.pop())

        ticker_to_dailies = iex.get_stock_dailies(batch, '5y')

        insert_values = []
        for ticker, dailies in ticker_to_dailies.items():
            for daily in dailies:
                insert_values.append(
                    f'({_to_date_int(daily.date)}, \'{ticker}\', {daily.low}, {daily.high}, {daily.open}, {daily.close}, {daily.volume})'
                )

        db.engine.execute('INSERT INTO stock_daily (date, ticker, low_price, high_price, open_price, close_price, volume) VALUES ' +  ','.join(insert_values))

        print(f'Batch saved: {len(insert_values)}')
        print(f'Tickers left: {len(tickers)}')

    print("DONE!")