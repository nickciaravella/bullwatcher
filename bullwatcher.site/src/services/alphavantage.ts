import { IStockDaily, IStockDailyHistory } from "src/models/stock-history";

export class AlphaVantage {

    public getStockDaily(ticker: string): Promise<IStockDailyHistory> {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=6JPLGVEP5LPD9YMD&outputsize=full`;

        return fetch(url)
        .then((response) => response.json())
        .then((json) => {
            return this._responseToDailyHistory(json, ticker);
        });
    }

    private _responseToDailyHistory(json: any, ticker: string): IStockDailyHistory {
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