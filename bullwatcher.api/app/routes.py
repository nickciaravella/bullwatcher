import traceback

from app.domain.exceptions import HttpError
from app.domain.patterns import PatternVote
from app.handlers.stocks import patterns_handler, rankings_handler, sectors_handler, stocks_handler, stocks_sync
from app.handlers import db_handler, user_handler
from datetime import datetime
from flask import jsonify, request
from werkzeug.exceptions import HTTPException


def setup_routes(app):

    ### EXCEPTION HANDLING ###
    @app.errorhandler(HttpError)
    def handle_known_error(httpError: HttpError):
        json = {
            'error': httpError.message,
            'debug_message': httpError.response_data,
            'url': httpError.url or request.url
        }
        return jsonify(json), httpError.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(http_ex: HTTPException):
        return handle_known_error(HttpError(
            status_code=http_ex.code,
            message='Flask Error',
            response_data=http_ex.description,
            url=request.url
        ))

    @app.errorhandler(Exception)
    def handle_unknown_error(ex: Exception):
        return handle_known_error(HttpError(
            status_code=500,
            message='Internal Error',
            response_data=traceback.format_exc(),
            url=request.url
        ))


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
    @app.route('/<ticker>/price')
    def stock_price(ticker):
        stock_current = stocks_handler.get_stock_current(ticker.upper())
        return jsonify(stock_current.to_json())

    @app.route('/<ticker>/price-history')
    def stock_history(ticker):
        history = stocks_handler.get_stock_history(ticker.upper())
        if not history:
            return f'Ticker "{ticker}" not found.', 404
        return jsonify([s.to_json() for s in history])

    @app.route('/<ticker>/metadata')
    def db_stock_metadata(ticker):
        return jsonify(stocks_handler.get_stock_metadata(ticker))

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


    ### SECTORS ###
    @app.route('/sectors/performances')
    def get_sector_performances():
        return jsonify([s.to_json() for s in sectors_handler.get_sector_performances()])


    ### RANKINGS ###
    @app.route('/rankings/sync')
    def sync_rankings():
        rankings_handler.sync_rankings()
        return '{}'

    @app.route('/rankings/<ranking_type>/<time_window>')
    def get_rankings(ranking_type: str, time_window: str):
        rankings = rankings_handler.get_rankings(ranking_type=ranking_type,
                                                 time_window=time_window,
                                                 min_market_cap=request.args.get('min_market_cap', default=None, type=int),
                                                 sector=request.args.get('sector', default=None, type=str))
        return jsonify([r.to_json() for r in rankings])
