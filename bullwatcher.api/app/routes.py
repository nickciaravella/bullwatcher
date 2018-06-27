from app.handlers.stocks.stocks_handler import get_stock_history


def setup_routes(app):

    @app.route('/stock-history/<ticker>')
    def stock_history(ticker):
        return get_stock_history(ticker)
