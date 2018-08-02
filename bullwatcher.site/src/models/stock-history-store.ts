import { observable } from 'mobx';

import { AlphaVantage } from '../services/alphavantage';
import { IStockDaily, IStockDailyHistory } from './stock-history';


export class StockHistoryStore {
    @observable public stockDailyHistory: IStockDailyHistory;

    public fetchDailyDataAsync(ticker: string): Promise<void> {
        this.stockDailyHistory = null;

        if (ticker.startsWith('^')) {
            // Indicies are not available through IEX, only AlphaVantage
            return new AlphaVantage()
                .getStockDaily(ticker)
                .then((history: IStockDailyHistory) => {
                    this.stockDailyHistory = history;
                })
        }
        else {
            const url = `https://api.iextrading.com/1.0/stock/${ticker}/chart/2y`
            return fetch(url)
                .then((response) => response.json())
                .then((json) => {
                    this.stockDailyHistory = this._responseToDailyHistory(json, ticker);
                });
            }

    }

    private _responseToDailyHistory(json: any, ticker: string): IStockDailyHistory {
        const dailyData: IStockDaily[] = [];

        for (const daily of json) {
            dailyData.push({
                close: daily.close,
                date: new Date(daily.date),
                high: daily.high,
                low: daily.low,
                open: daily.open,
                volume: daily.volume,
            });
        }

        dailyData.sort((first: IStockDaily, second: IStockDaily) => first.date.valueOf() - second.date.valueOf());
        return {
            data: dailyData,
            ticker: ticker.toUpperCase()
        };
    }
}
