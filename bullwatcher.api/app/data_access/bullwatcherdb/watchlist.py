from typing import List

import datetime

from application import db
from app.data_access.bullwatcherdb.common import commit_with_rollback
from app.database import models
from app.domain.stocks import StockMetadata
from app.domain.watchlist import UserWatchlist, UserWatchlistItem
from sqlalchemy import and_


def get_watchlists(user_id: str) -> List[UserWatchlist]:
    watchlists: List[models.UserWatchlist] = db.session\
        .query(models.UserWatchlist)\
        .filter(models.UserWatchlist.user_id == user_id)\
        .order_by(models.UserWatchlist.display_name)\
        .all()

    return [
        watchlist_database_to_domain(watchlist)
        for watchlist in watchlists
    ]


def create_watchlist(user_id: str, watchlist_name: str) -> UserWatchlist:
    """
    Creates a watchlist for the user with the given name.
    """
    new_watchlist: models.UserWatchlist = models.UserWatchlist(
        user_id=user_id,
        display_name=watchlist_name,
        items_last_updated_at=datetime.datetime.utcnow()
    )
    db.session.add(new_watchlist)
    commit_with_rollback(db.session)

    return watchlist_database_to_domain(db_model=new_watchlist)


def delete_watchlist(user_id: str, watchlist_id: int) -> None:
    """
    Deletes a watchlist and all associated items for a given user.
    """
    db.session.query(models.UserWatchlistItem).filter(
        and_(
            models.UserWatchlistItem.watchlist_id == watchlist_id,
            models.UserWatchlistItem.user_id == user_id
        )
    ).delete(synchronize_session='fetch')

    db.session.query(models.UserWatchlist).filter(
        and_(
            models.UserWatchlist.watchlist_id == watchlist_id,
            models.UserWatchlist.user_id == user_id
        )
    ).delete(synchronize_session='fetch')

    commit_with_rollback(db.session)


def get_watchlist_items(user_id: str, watchlist_id: int) -> List[UserWatchlistItem]:
    """
    Gets the list of watchlist items for the users watchlist
    """
    model_items: List[models.UserWatchlistItem] = db.session.query(models.UserWatchlistItem).filter(
        and_(
            models.UserWatchlistItem.watchlist_id == watchlist_id,
            models.UserWatchlistItem.user_id == user_id
        )
    ).order_by(models.UserWatchlistItem.position).all()

    domain_items: List[UserWatchlistItem] = []
    for model_item in model_items:
        metadata: models.StockMetadata = db.session.query(models.StockMetadata).get(model_item.ticker)
        domain_items.append(UserWatchlistItem(
            stock_metadata=StockMetadata(metadata.ticker, metadata.company_name, metadata.market_cap, metadata.sector),
            position=model_item.position
        ))

    return domain_items

def edit_watchlist_items(user_id: str,
                         watchlist_id: int,
                         items: List[UserWatchlistItem]) -> List[UserWatchlistItem]:
    """
    Updates a users watchlist to contain the given items. This is a complete
    replacement of all items in the watchlist.
    """
    watchlist: models.UserWatchlist = db.session.query(models.UserWatchlist).get(watchlist_id)
    if not watchlist:
        # If the watchlist doesn't exist, short circuit.
        return []

    # Delete any existing items
    db.session.query(models.UserWatchlistItem).filter(
        and_(
            models.UserWatchlistItem.watchlist_id == watchlist_id,
            models.UserWatchlistItem.user_id == user_id
        )
    ).delete(synchronize_session='fetch')

    # Add new items
    new_items: List[models.UserWatchlistItem] = [
        models.UserWatchlistItem(
            watchlist_id=watchlist_id,
            ticker=item.stock_metadata.ticker,
            user_id=user_id,
            position=item.position,
        )
        for item in items
    ]
    db.session.add_all(new_items)

    watchlist.items_last_updated_at = datetime.datetime.utcnow()
    commit_with_rollback(db.session)

    return items


def watchlist_database_to_domain(db_model) -> UserWatchlist:
    return UserWatchlist(watchlist_id=db_model.watchlist_id,
                         display_name=db_model.display_name)
