import { IAuthContext, IUserContext } from "src/models/auth-context";
import { TimeWindow } from "src/models/common";
import { IStockCurrentPrice } from "src/models/stock-current";
import { createStockMetadataFromBullwatcher, IStockMetadata } from "src/models/stock-metadata";
import { IDailyPatternList, IUserPatternVote, PatternType } from "src/models/stock-patterns";
import { IStockRanking } from "src/models/stock-rankings";

export class BullWatcher {
    private baseUrl: string = `http://api.bullwatcher.com`;

    public login(authContext: IAuthContext): Promise<IUserContext> {
        const url: string = this.baseUrl + `/login`;
        return fetch(url, {
                body: JSON.stringify({
                    "email": authContext.email,
                    "full_name": authContext.friendlyName,
                    "identity_id": authContext.identityId,
                    "identity_provider": authContext.identityProvider,
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
            })
            .then((response) => response.json())
            .then((json) => {
                return {
                    email: json.email,
                    friendlyName: json.full_name,
                    userId: json.user_id,
                }
            });
    }

    public getStockMetadata(ticker: string): Promise<IStockMetadata> {
        const url: string = this.baseUrl + `${ticker}/metadata`;
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

    public getPatterns(date?: string): Promise<IDailyPatternList> {
        const datePath: string = date ? `/${date}` : '';
        const url = this.baseUrl + `/patterns/flags${datePath}`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => { return {
                    date: new Date(json.date),
                    patternStocks: json.pattern_stocks.map((stock: any) => { return {
                        patternType: PatternType.FLAG,
                        stockMetadata: createStockMetadataFromBullwatcher(stock.stock_metadata),
                        votes: stock.votes
                    }})
                }});
    }

    public getUserPatternVotes(userId: string, date: Date): Promise<IUserPatternVote[]> {
        const url: string = this.baseUrl + `/patterns/flags/votes/${userId}/${this.getDateString(date)}`;
        return fetch(url)
            .then((response) => response.json())
            .then((array) =>
                array.map((json: any) => { return {
                    date: new Date(json.date),
                    ticker: json.ticker,
                    userId: json.user_id,
                    value: json.value
                }})
            );
    }

    public async voteOnPattern(userId: string, date: Date, ticker: string, value: number): Promise<void> {
        const url: string = this.baseUrl + `/patterns/flags/votes`;
        await fetch(url, {
            body: JSON.stringify({
                "date": this.getDateString(date),
                "ticker": ticker,
                "user_id": userId,
                "value": value
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
        });
    }

    public async getStockCurrentPrice(ticker: string): Promise<IStockCurrentPrice> {
        const url: string = this.baseUrl + `/${ticker}/price`;
        const response: any = await fetch(url);
        const json: any = await response.json()
        return {
            currentPrice: json.current_price,
            currentPriceDateTime: new Date(json.last_updated_time),
            high: json.high,
            lastClose: json.previous_close,
            low: json.low,
            open: json.open,
            volume: json.volume
        }
    }

    public async getStockRankings(
        timeWindow: TimeWindow,
        minimumMarketCap?: number): Promise<IStockRanking[]> {
        let url: string = this.baseUrl + `/rankings/price_percent_change/${timeWindow}`;
        if (minimumMarketCap && minimumMarketCap > 0) {
            url += `?min_market_cap=${minimumMarketCap}`;
        }

        const jsonArray: any[] = await this.getJson(url);
        return jsonArray.map((json: any) => { return {
            rank: json.rank,
            ticker: json.ticker,
            timeWindow: TimeWindow[json.time_window as string],
            value: json.value,
        }});
    }

    private async getJson(url: string): Promise<any | any[]> {
        const response: any = await fetch(url);
        return await response.json()
    }

    private getDateString(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }
}