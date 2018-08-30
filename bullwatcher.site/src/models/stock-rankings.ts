import { TimeWindow } from 'src/models/common';

export interface IStockRanking {
    ticker: string;
    timeWindow: TimeWindow;
    rank: number;
    value: number;
}