export interface IStockCurrentPrice {
    lastClose: number;
    currentPrice: number;
    currentPriceDateTime: Date;
    high: number;
    low: number;
    open: number;
    volume: number;
}