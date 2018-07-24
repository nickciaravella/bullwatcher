from app.handlers.stocks import patterns_handler, stocks_handler, stocks_sync
from app.handlers import db_handler
from datetime import datetime
from flask import jsonify

def setup_routes(app):

    @app.route('/stock-history/<ticker>')
    def stock_history(ticker):
        return jsonify([s.to_json() for s in stocks_handler.get_stock_history(ticker.upper())])


    @app.route('/sync-stocks/<int:count>')
    def sync_stocks(count):
        return jsonify([s.to_json() for s in stocks_sync.sync(count)])


    @app.route('/patterns/sync')
    def sync_patterns():
       return jsonify([m.to_json() for m in patterns_handler.sync_patterns()])


    @app.route('/patterns/flags')
    def get_patterns():
       return jsonify([m.to_json() for m in patterns_handler.get_flags()])


    @app.route('/patterns/flags/<date>')
    def get_patterns_for_date(date):
        try:
            date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return "Invalid date.", 400

        return jsonify([m.to_json() for m in patterns_handler.get_flags_for_date(date)])


    @app.route('/stock-tickers')
    def db_stock_tickers():
        return jsonify(db_handler.stock_tickers())


    @app.route('/stock-metadata/<ticker>')
    def db_stock_metadata(ticker):
        return jsonify(stocks_handler.get_stock_metadata(ticker))
