from app.domain.patterns import PatternVote
from app.handlers.stocks import patterns_handler, stocks_handler, stocks_sync
from app.handlers import db_handler, user_handler
from datetime import datetime, date
from flask import jsonify, request


def setup_routes(app):

    ### USER ###
    @app.route('/login', methods=['POST'])
    def login():
        return jsonify(user_handler.login(request.json).to_json())

    @app.route('/users')
    def get_users():
        return jsonify([s.to_json() for s in user_handler.get_users()])

    @app.route('/users/<user_id>')
    def get_user(user_id: str):
        return jsonify(user_handler.get_user(user_id).to_json())

    ### STOCK ###
    @app.route('/stock-history/<ticker>')
    def stock_history(ticker):
        history = stocks_handler.get_stock_history(ticker.upper())
        if not history:
            return f'Ticker "{ticker}" not found.', 404
        return jsonify([s.to_json() for s in history])

    @app.route('/sync-stocks/<int:count>')
    def sync_stocks(count):
        return jsonify([s.to_json() for s in stocks_sync.sync(count)])

    @app.route('/patterns/sync')
    def sync_patterns():
        patterns_handler.sync_patterns()
        return jsonify({})

    @app.route('/patterns/flags')
    def get_patterns():
        return jsonify(patterns_handler.get_flags().to_json())

    @app.route('/patterns/flags/<date>')
    def get_patterns_for_date(date):
        try:
            date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return "Invalid date.", 400

        return jsonify(patterns_handler.get_flags_for_date(date).to_json())

    @app.route('/patterns/flags/votes', methods=['POST'])
    def pattern_vote():
        vote = PatternVote.from_json(request.json)
        return jsonify(patterns_handler.flag_vote(vote).to_json())

    @app.route('/patterns/flags/votes/<user_id>/<date>')
    def get_pattern_votes_for_user(user_id: str, date: str):
        date: date = datetime.strptime(date, "%Y-%m-%d").date()
        return jsonify([v.to_json() for v in patterns_handler.get_pattern_votes_for_user(user_id=user_id, date=date)])

    @app.route('/stock-tickers')
    def db_stock_tickers():
        return jsonify(db_handler.stock_tickers())

    @app.route('/stock-metadata/<ticker>')
    def db_stock_metadata(ticker):
        return jsonify(stocks_handler.get_stock_metadata(ticker))

