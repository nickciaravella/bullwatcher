import { IStockMetadata } from 'src/models/stock-metadata'

export interface IUserWatchlist {
    watchlistId: number;
    displayName: string;
}

export interface IUserWatchlistItem {
    stockMetadata: IStockMetadata;
    position: number;
}
