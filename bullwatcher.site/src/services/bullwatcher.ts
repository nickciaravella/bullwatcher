import { IStockMetadata } from "src/models/stock-metadata";
import { IAuthContext, IUserContext } from "../models/auth-context";

export class BullWatcher {
    private baseUrl: string = `http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com`;

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