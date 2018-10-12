import { IStockCurrentPrice } from "src/models/stock-current";
import { IUserWatchlistItem } from "src/models/user-watchlist";

export enum SortOrder {
    ALPHABETICAL = 'alphabetical',
    CUSTOM = 'custom',
    MARKET_CAP = 'marketCap',
    PERCENT_CHANGE = 'percentChange',
}

export interface IWatchlistItemInfo {
    item: IUserWatchlistItem;
    price: IStockCurrentPrice;
}
