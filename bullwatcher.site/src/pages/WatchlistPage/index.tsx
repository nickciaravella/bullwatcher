import { observer } from 'mobx-react';
import * as React from 'react';

import { AuthContextStore } from 'src/models/auth-store';
import { IChartSettings } from 'src/models/chart-settings'
import { IUserWatchlist, IUserWatchlistItem } from 'src/models/user-watchlist';
import { BullWatcher } from 'src/services/bullwatcher';
import StockChart from 'src/StockChart';

interface IWatchlistPageProps {
    authContextStore: AuthContextStore;
    chartSettings: IChartSettings;
}

interface IWatchlistPageState {
    currentWatchlist?: IUserWatchlist;
    watchlistItems: IUserWatchlistItem[];
    watchlists: IUserWatchlist[];
}

@observer
export default class WatchlistPage extends React.Component<IWatchlistPageProps, IWatchlistPageState> {
    private bullwatcher = new BullWatcher();

    constructor(props: IWatchlistPageProps) {
        super(props);
        this.state = {
            currentWatchlist: null,
            watchlistItems: [],
            watchlists: [],
        }
        this.loadWatchlists();
    }

    public render() {
        const { currentWatchlist, watchlistItems, watchlists } = this.state;

        if (!watchlists || !currentWatchlist) {
            return null;
        }

        const stockCharts: JSX.Element[] = watchlistItems.map((item: IUserWatchlistItem) => (
            <div style={{paddingBottom: '50px'}}>
                <h3>{item.stockMetadata.companyName} ( {item.stockMetadata.ticker} )</h3>
                <StockChart ticker={item.stockMetadata.ticker} settings={this.props.chartSettings} />
            </div>
        ));

        return (
            <div>
                {this.renderWatchlistsPicker(currentWatchlist, watchlists)}
                <h2>{currentWatchlist.displayName}</h2>
                {stockCharts}
            </div>
        );
    }

    private renderWatchlistsPicker(currentWatchlist: IUserWatchlist, watchlists: IUserWatchlist[]) {
        const watchlistsToRender = []
        for(const watchlist of watchlists) {
            watchlistsToRender.push(
                <option value={watchlist.watchlistId}>{watchlist.displayName}</option>
            )
        }

        return (
            <form>
                <label>Watchlists</label>
                <select value={currentWatchlist.watchlistId} onChange={this.handleWatchlistChanged}>
                    {watchlistsToRender}
                </select>
            </form>
        )
    }

    private handleWatchlistChanged = async (event: React.FormEvent<HTMLSelectElement>) => {
        const newWatchlistId: number = +event.currentTarget.value;
        const newWatchlist = this.state.watchlists.find(watchlist => watchlist.watchlistId === newWatchlistId)
        if (!newWatchlist) {
            return;
        }

        const newItems: IUserWatchlistItem[] = await this.bullwatcher.getUserWatchlistItems(
                this.props.authContextStore.userContext.userId,
                newWatchlist.watchlistId);

        this.setState((prevState) => { return {
            currentWatchlist: newWatchlist,
            watchlistItems: newItems,
            watchlists: prevState.watchlists
        }})
    }

    private async loadWatchlists() {
        const { authContextStore } = this.props;
        if (!authContextStore.userContext) {
            return;
        }

        const { currentWatchlist, watchlistItems } = this.state;
        const watchlists: IUserWatchlist[] = await this.bullwatcher.getUserWatchlists(authContextStore.userContext.userId);
        const firstWatchlist: IUserWatchlist = watchlists.length === 0 ? null : watchlists[0];

        let newItems: IUserWatchlistItem[] = watchlistItems;
        if (!currentWatchlist) {
            newItems = await this.bullwatcher.getUserWatchlistItems(
                authContextStore.userContext.userId,
                firstWatchlist.watchlistId);
        }

        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist ? prevState.currentWatchlist : firstWatchlist,
            watchlistItems: newItems,
            watchlists
        }})
    }
}
