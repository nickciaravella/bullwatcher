from app.handlers.stocks import stocks_handler, stocks_sync
from app.handlers import db_handler
from flask import jsonify

def setup_routes(app):

    @app.route('/stock-history/<ticker>')
    def stock_history(ticker):
        return jsonify(stocks_handler.get_stock_history(ticker))

    @app.route('/sync-stocks/<int:count>')
    def sync_stocks(count):
        return jsonify([s.to_json() for s in stocks_sync.sync(count)])


    @app.route('/db/stock-metadata')
    def db_stock_metadata():
        return jsonify(db_handler.stock_metadata())
