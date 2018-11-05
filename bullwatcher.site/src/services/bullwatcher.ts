import { IAuthContext, IUserContext } from "src/models/auth-context";
import { TimeWindow } from "src/models/common";
import { INews } from "src/models/news";
import { ISector, ISectorPerformance } from "src/models/sectors";
import { IStockCurrentPrice } from "src/models/stock-current";
import { IStockDaily, IStockDailyHistory } from "src/models/stock-history";
import { createStockMetadataFromBullwatcher, IStockMetadata } from "src/models/stock-metadata";
import { IDailyPatternList, IUserPatternVote, PatternType } from "src/models/stock-patterns";
import { IStockRanking } from "src/models/stock-rankings";
import { IUserWatchlist, IUserWatchlistItem } from "src/models/user-watchlist";

export class BullWatcher {
    private baseUrl: string = `https://api.bullwatcher.com`;

    public async login(authContext: IAuthContext): Promise<IUserContext> {
        const url: string = this.baseUrl + `/login`;
        const json: any = await this.postJson(url, {
            "email": authContext.email,
            "full_name": authContext.friendlyName,
            "identity_id": authContext.identityId,
            "identity_provider": authContext.identityProvider,
        });

        return {
            email: json.email,
            friendlyName: json.full_name,
            userId: json.user_id,
        };
    }

    public getStockMetadata(ticker: string): Promise<IStockMetadata> {
        const url: string = this.baseUrl + `/${ticker.toUpperCase()}/metadata`;
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

    public async searchStockMetadata(prefix: string): Promise<IStockMetadata[]> {
        const url: string = this.baseUrl + `/stock-metadata?prefix=${prefix}`;
        const jsonArray: any[] = await this.getJson(url);
        return jsonArray.map(json => {
            return {
                companyName: json.company_name,
                marketCap: json.market_cap,
                sector: json.sector,
                ticker: json.ticker,
            }
        });
    }

    public async getStockDailyHistory(ticker: string):  Promise<IStockDailyHistory> {
        const url = this.baseUrl + `/${ticker}/price-history`;
        const jsonArray: any[] = await this.getJson(url);

        const dailyData: IStockDaily[] = [];
        for (const daily of jsonArray) {
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
        await this.postJson(url, {
            "date": this.getDateString(date),
            "ticker": ticker,
            "user_id": userId,
            "value": value
        });
    }

    public async getStockCurrentPrice(ticker: string): Promise<IStockCurrentPrice> {
        const url: string = this.baseUrl + `/${ticker}/price`;
        const response: any = await fetch(url);
        const json: any = await response.json()
        return {
            afterHoursDateTime: new Date(json.after_hours_updated_time),
            afterHoursPrice: json.after_hours_price,
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
        minimumMarketCap?: number,
        sectorsFilter?: string): Promise<IStockRanking[]> {
        let url: string = this.baseUrl + `/rankings/price_percent_change/${timeWindow}`;
        let query: string = '';
        if (minimumMarketCap && minimumMarketCap > 0) {
            query += `min_market_cap=${minimumMarketCap}`;
        }
        if (sectorsFilter) {
            if (query.length > 0) {
                query += '&';
            }
            query += `sector=${sectorsFilter}`;
        }
        if (query.length > 0) {
            url += `?${query}`;
        }

        const jsonArray: any[] = await this.getJson(url);
        return jsonArray.map((json: any) => { return {
            rank: json.rank,
            ticker: json.ticker,
            timeWindow: json.time_window,
            value: json.value,
        }});
    }

    public async getSingleStockRankings(ticker: string): Promise<IStockRanking[]> {
        const url: string = this.baseUrl + `/${ticker}/rankings`;
        const jsonArray: any[] = await this.getJson(url);
        return jsonArray.map((json: any) => { return {
            rank: json.rank,
            ticker: json.ticker,
            timeWindow: json.time_window,
            value: json.value,
        }});
    }

    public async getSectors(): Promise<ISector[]> {
        const sectorPerformances = await this.getSectorPerformances();
        const sectorIds = new Set();
        const sectors: ISector[] = [];

        for (const sectorPerformance of sectorPerformances) {
            if (sectorIds.has(sectorPerformance.id)) {
                continue;
            }
            sectorIds.add(sectorPerformance.id);
            sectors.push({
                id: sectorPerformance.id,
                sectorName: sectorPerformance.sectorName
            });
        }

        return sectors;
    }

    public async getSectorPerformances(): Promise<ISectorPerformance[]> {
        const url: string = this.baseUrl + '/sectors/performances';
        const jsonArray: any[] = await this.getJson(url);
        return jsonArray.map((json: any) => { return {
            id: json.id,
            percentChange: json.percent_change,
            sectorName: json.name,
            timeWindow: json.time_window,
        }})
    }

    public async getUserWatchlists(userId: string): Promise<IUserWatchlist[]> {
        const url: string = this.baseUrl + `/users/${userId}/watchlists`
        const jsonArray: any[] = await this.getJson(url)
        return jsonArray.map((json: any) => { return {
            displayName: json.display_name,
            watchlistId: json.watchlist_id,
        }})
    }

    public async createUserWatchlist(userId: string, watchlistName: string): Promise<IUserWatchlist> {
        const url: string = this.baseUrl + `/users/${userId}/watchlists`;
        const json: any = await this.postJson(url, { display_name: watchlistName });
        return {
            displayName: json.display_name,
            watchlistId: json.watchlist_id,
        }
    }

    public async deleteUserWatchlist(userId: string, watchlistId: number): Promise<void> {
        const url: string = this.baseUrl + `/users/${userId}/watchlists/${watchlistId}`;
        await this.delete(url);
    }

    public async getUserWatchlistItems(userId: string, watchlistId: number): Promise<IUserWatchlistItem[]> {
        const url: string = this.baseUrl + `/users/${userId}/watchlists/${watchlistId}/items`
        const jsonArray: any[] = await this.getJson(url)
        return jsonArray.map((json: any) => { return {
            position: json.position,
            stockMetadata: createStockMetadataFromBullwatcher(json.stock_metadata),
        }})
    }

    public async setUserWatchlistItems(
        userId: string,
        watchlistId: number,
        items: IUserWatchlistItem[]
    ): Promise<IUserWatchlistItem[]> {
        const url: string = this.baseUrl + `/users/${userId}/watchlists/${watchlistId}/items`

        const requestItems: any[] = []
        for (const item of items) {
            requestItems.push({
                position: item.position,
                stock_metadata: {
                    company_name: item.stockMetadata.companyName,
                    market_cap: item.stockMetadata.marketCap,
                    sector: item.stockMetadata.sector,
                    ticker: item.stockMetadata.ticker
                }
            })
        }

        const jsonArray: any[] = await this.putJson(url, requestItems)
        return jsonArray.map((json: any) => { return {
            position: json.position,
            stockMetadata: createStockMetadataFromBullwatcher(json.stock_metadata),
        }})
    }

    public async getNews(ticker?: string): Promise<INews[]> {
        let url: string = this.baseUrl + '/news';
        if (ticker) {
            url += `/${ticker}`;
        }

        const responseJson: any = await this.getJson(url);
        const jsonArray: any[] = responseJson.news_articles;
        return jsonArray.map((json: any) => { return {
            description: json.description,
            headline: json.title,
            newsUrl: json.article_url,
            publishedDate: new Date(json.published_at),
            source: json.source.name,
            thumbnailUrl: json.image_url
        }});
    }

    private async getJson(url: string): Promise<any | any[]> {
        const response: any = await fetch(url);
        return await response.json()
    }

    private async delete(url: string): Promise<void> {
        await fetch(url, {
                method: 'DELETE',
            })
    }

    private async postJson(url: string, body: any): Promise<any | any[]> {
        const response = await fetch(url, {
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
            })
        return response.json()
    }

    private async putJson(url: string, body: any): Promise<any | any[]> {
        const response = await fetch(url, {
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'PUT',
            })
        return response.json()
    }

    private getDateString(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }
}