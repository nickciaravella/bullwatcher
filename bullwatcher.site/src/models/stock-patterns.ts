import { IStockMetadata } from "src/models/stock-metadata";

export enum PatternType {
    FLAG = "flag"
}

export interface IUserPatternVote {
    date: Date;
    userId: string;
    ticker: string;
    value: number;
}

export interface IDailyPatternList {
    date: Date;
    patternStocks: IPatternStock[];
}

export interface IPatternStock {
    patternType: PatternType;
    stockMetadata: IStockMetadata;
    votes: number;
}