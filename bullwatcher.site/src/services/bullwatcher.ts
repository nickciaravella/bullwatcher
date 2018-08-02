import { IStockMetadata } from "src/models/stock-metadata";

export class BullWatcher {
    private baseUrl: string = `http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com`;

    public getStockMetadata(ticker: string): Promise<IStockMetadata> {
        const url: string = this.baseUrl + `/stock-metadata/${ticker}`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                return {
                    companyName: json.company_name,
                    marketCap: json.market_cap,
                    sector: json.sector,
                    ticker: json.ticker,
                }
            });
    }
}