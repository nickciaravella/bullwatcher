from typing import Any, Dict

from app.domain.stocks import StockMetadata


class UserWatchlist:
    def __init__(self,
                 watchlist_id: int,
                 display_name: str):
        self.watchlist_id: int = watchlist_id
        self.display_name: str = display_name

    def to_json(self):
        return {
            'watchlist_id': self.watchlist_id,
            'display_name': self.display_name,
        }


class UserWatchlistItem:
    def __init__(self,
                 stock_metadata: StockMetadata,
                 position: int):
        self.stock_metadata: StockMetadata = stock_metadata
        self.position: int = position

    def to_json(self):
        return {
            'stock_metadata': self.stock_metadata.to_json(),
            'position': self.position
        }

    @classmethod
    def from_json(self, json: Dict[str, Any]) -> 'UserWatchlistItem':
        return UserWatchlistItem(
            stock_metadata=StockMetadata.from_json(json['stock_metadata']),
            position=json['position']
        )
