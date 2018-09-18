from typing import List

from app.data_access import bullwatcherdb
from app.domain.watchlist import UserWatchlist, UserWatchlistItem


def create_user_watchlist(user_id: str, watchlist_name: str) -> UserWatchlist:
    return bullwatcherdb.create_watchlist(user_id=user_id,
                                          watchlist_name=watchlist_name)

def get_watchlists(user_id: str) -> List[UserWatchlist]:
    return bullwatcherdb.get_watchlists(user_id=user_id)


def delete_user_watchlist(user_id: str, watchlist_id: int) -> None:
    bullwatcherdb.delete_watchlist(user_id=user_id, watchlist_id=watchlist_id)


def get_user_watchlist_items(user_id: str, watchlist_id: int) -> List[UserWatchlistItem]:
    return bullwatcherdb.get_watchlist_items(user_id=user_id, watchlist_id=watchlist_id)


def update_user_watchlist_items(user_id: str,
                                watchlist_id: int,
                                items: List[UserWatchlistItem]) -> List[UserWatchlistItem]:
    return bullwatcherdb.edit_watchlist_items(user_id=user_id,
                                              watchlist_id=watchlist_id,
                                              items=items)
