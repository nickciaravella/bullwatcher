import { IAuthContext, IUserContext } from "src/models/auth-context";
import { createStockMetadataFromBullwatcher, IStockMetadata } from "src/models/stock-metadata";
import { IDailyPatternList, IUserPatternVote, PatternType } from "src/models/stock-patterns";

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

    private getDateString(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }
}