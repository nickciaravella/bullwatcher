import { observable } from 'mobx';

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

export class StockHistoryStore {
    @observable public stockDailyHistory: IStockDailyHistory;

    public fetchDailyDataAsync(ticker: string): Promise<void> {
        this.stockDailyHistory = null;
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=6JPLGVEP5LPD9YMD&outputsize=full`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                this.stockDailyHistory = this._responseToDailyHistory(json);
            });
    }

    private _responseToDailyHistory(json: any): IStockDailyHistory {
        const dailyData: IStockDaily[] = [];

        const timeSeriesData = json['Time Series (Daily)'];
        for (const date in timeSeriesData) {
            if (timeSeriesData.hasOwnProperty(date)) {
                const daily = {
                    close: +timeSeriesData[date]['4. close'],
                    date: new Date(date),
                    high: +timeSeriesData[date]['2. high'],
                    low: +timeSeriesData[date]['3. low'],
                    open: +timeSeriesData[date]['1. open'],
                    volume: +timeSeriesData[date]['5. volume'],
                }
                dailyData.push(daily);
            }
        }

        return {
            data: dailyData,
            ticker: json['Meta Data']['2. Symbol']
        };
    }
}
