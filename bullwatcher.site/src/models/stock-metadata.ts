import { observable, ObservableMap } from 'mobx';


export interface IStockMetadata {
    ticker: string;
    companyName: string;
    marketCap: number;
    sector: string;
}

export function createStockMetadataFromBullwatcher(json: any): IStockMetadata {
    return {
        companyName: json.company_name,
        marketCap: json.market_cap,
        sector: json.sector,
        ticker: json.ticker,
    }
}

export class StockMetadataStore {
    @observable public stockMetadatas: ObservableMap<string, IStockMetadata> =
        new ObservableMap<string, IStockMetadata>();

    public fetchDailyDataAsync(ticker: string): Promise<void> {
        const url = `https://api.bullwatcher.com/${ticker}/metadata`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                console.info("Received stock metadata!");
                this.stockMetadatas.set(ticker, this._responseToStockMetadata(json));
            });
    }

    private _responseToStockMetadata(json: any): IStockMetadata {
        return createStockMetadataFromBullwatcher(json);
    }
}