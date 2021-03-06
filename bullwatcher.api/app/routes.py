from typing import List

import datetime
import traceback

from app.domain.exceptions import HttpError
from app.domain.patterns import PatternVote
from app.domain.watchlist import UserWatchlistItem
from app.handlers import db_handler, news_handler, user_handler, watchlist_handler
from app.handlers.stocks.sync import sync_handler
from app.handlers.stocks import patterns_handler, rankings_handler, sectors_handler, stocks_handler
from flask import jsonify, request
from werkzeug.exceptions import HTTPException


def setup_routes(app):

    # EXCEPTION HANDLING ###
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


    # USER ###
    @app.route('/login', methods=['POST'])
    def login():
        return jsonify(user_handler.login(request.json).to_json())

    @app.route('/users')
    def get_users():
        return jsonify([s.to_json() for s in user_handler.get_users()])

    @app.route('/users/<user_id>')
    def get_user(user_id: str):
        return jsonify(user_handler.get_user(user_id).to_json())

    @app.route('/users/<user_id>/watchlists', methods=['GET'])
    def get_user_watchlists(user_id: str):
        return jsonify([w.to_json() for w in watchlist_handler.get_watchlists(user_id=user_id)])

    @app.route('/users/<user_id>/watchlists', methods=['POST'])
    def create_user_watchlist(user_id: str):
        return jsonify(
            watchlist_handler.create_user_watchlist(
                user_id=user_id,
                watchlist_name=request.json['display_name']
            ).to_json()
        )

    @app.route('/users/<user_id>/watchlists/<int:watchlist_id>', methods=['DELETE'])
    def delete_user_watchlist(user_id: str, watchlist_id: int):
        watchlist_handler.delete_user_watchlist(user_id=user_id, watchlist_id=watchlist_id)
        return ('', 200)

    @app.route('/users/<user_id>/watchlists/<int:watchlist_id>/items', methods=['GET'])
    def get_user_watchlist_items(user_id: str, watchlist_id: int):
        return jsonify([
            item.to_json()
            for item in watchlist_handler.get_user_watchlist_items(user_id=user_id, watchlist_id=watchlist_id)
        ])

    @app.route('/users/<user_id>/watchlists/<int:watchlist_id>/items', methods=['PUT'])
    def update_user_watchlist_items(user_id: str, watchlist_id: int):
        items: List[UserWatchlistItem] = [
            UserWatchlistItem.from_json(item)
            for item in request.json
        ]
        return jsonify([
            item.to_json()
            for item in watchlist_handler.update_user_watchlist_items(user_id=user_id,
                                                                      watchlist_id=watchlist_id,
                                                                      items=items)
        ])


    # SYNC ###
    @app.route('/sync')
    def sync():
        result = sync_handler.sync()
        return jsonify(result)


    # STOCK ###
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

    @app.route('/stock-metadata')
    def search_stock_metadata():
        matching = stocks_handler.search_stock_metadata(prefix=request.args.get('prefix'),
                                                        max_results=request.args.get('max-results'))
        return jsonify([m.to_json() for m in matching])

    @app.route('/<ticker>/metadata')
    def get_stock_metadata(ticker):
        metadata = stocks_handler.get_stock_metadata(ticker)
        if metadata:
            return jsonify(metadata.to_json())
        else:
            return {}, 404

    @app.route('/<ticker>/rankings')
    def get_stock_rankings(ticker: str):
        return jsonify([r.to_json() for r in stocks_handler.get_stock_rankings(ticker.upper())])

    @app.route('/patterns/flags')
    def get_patterns():
        return jsonify(patterns_handler.get_flags().to_json())

    @app.route('/patterns/flags/<date>')
    def get_patterns_for_date(date):
        try:
            date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return "Invalid date.", 400

        return jsonify(patterns_handler.get_flags_for_date(date).to_json())

    @app.route('/patterns/flags/votes', methods=['POST'])
    def pattern_vote():
        vote = PatternVote.from_json(request.json)
        return jsonify(patterns_handler.flag_vote(vote).to_json())

    @app.route('/patterns/flags/votes/<user_id>/<date_str>')
    def get_pattern_votes_for_user(user_id: str, date_str: str):
        date: datetime.date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        return jsonify([v.to_json() for v in patterns_handler.get_pattern_votes_for_user(user_id=user_id, date=date)])

    @app.route('/stock-tickers')
    def db_stock_tickers():
        return jsonify(db_handler.stock_tickers())


    # SECTORS ###
    @app.route('/sectors/performances')
    def get_sector_performances():
        return jsonify([s.to_json() for s in sectors_handler.get_sector_performances()])


    # RANKINGS ###
    @app.route('/rankings/<ranking_type>/<time_window>')
    def get_rankings(ranking_type: str, time_window: str):
        rankings = rankings_handler.get_rankings(
            ranking_type=ranking_type,
            time_window=time_window,
            min_market_cap=request.args.get(
                'min_market_cap', default=None, type=int),
            sector=request.args.get('sector', default=None, type=str))
        return jsonify([r.to_json() for r in rankings])


    # NEWS
    @app.route('/news')
    def get_market_news():
        return jsonify(news_handler.get_market_news().to_json())

    @app.route('/news/<ticker>')
    def get_stock_news(ticker: str):
        return jsonify(news_handler.get_stock_news(ticker=ticker).to_json())
