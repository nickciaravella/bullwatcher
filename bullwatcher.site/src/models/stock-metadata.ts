import { observable, ObservableMap } from 'mobx';


export interface IStockMetadata {
    ticker: string;
    companyName: string;
    marketCap: number;
    sector: string;
}

export class StockMetadataStore {
    @observable public stockMetadatas: ObservableMap<string, IStockMetadata> =
        new ObservableMap<string, IStockMetadata>();

    public fetchDailyDataAsync(ticker: string): Promise<void> {
        const url = `http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com/stock-metadata/${ticker}`;
        // const url = `http://localhost:5000/stock-metadata/${ticker}`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                console.info("Received stock metadata!");
                this.stockMetadatas.set(ticker, this._responseToStockMetadata(json));
            });
    }

    private _responseToStockMetadata(json: any): IStockMetadata {
        return {
            companyName: json.company_name,
            marketCap: json.market_cap,
            sector: json.sector,
            ticker: json.ticker,
        }
    }
}