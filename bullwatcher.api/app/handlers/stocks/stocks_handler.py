import json


def get_stock_history(ticker):
    return json.dumps({
        'ticker': ticker,
        'price': 10
    })
