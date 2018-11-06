import { observable, ObservableMap } from 'mobx';

import { ISector } from 'src/models/sectors';
import { ONE_BILLION, ONE_MILLION } from 'src/utils';


export interface IStockMetadata {
    ticker: string;
    companyName: string;
    marketCap: number;
    sector: ISector;
}

export function marketCapCategory(marketCap: number): string {
    // https://www.fool.com/knowledge-center/market-capitalization.aspx
    if (marketCap > 200 * ONE_BILLION) {
        return "Mega";
    } else if (marketCap > 10 * ONE_BILLION) {
        return "Large";
    } else if (marketCap > 2 * ONE_BILLION) {
        return "Mid";
    } else if (marketCap > 300 * ONE_MILLION) {
        return "Small";
    } else {
        return "Micro";
    }
}

export function createStockMetadataFromBullwatcher(json: any): IStockMetadata {
    return {
        companyName: json.company_name,
        marketCap: json.market_cap,
        sector: {
            id: json.sector.id,
            sectorName: json.sector.name
        },
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