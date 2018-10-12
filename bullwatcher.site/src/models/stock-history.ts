export interface IStockDailyHistory {
    data: IStockDaily[];
    ticker: string;
}

export interface IStockDaily {
    close: number;
    date: Date;
    high: number;
    low: number;
    open: number;
    volume: number;
}
