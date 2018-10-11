import { observer } from 'mobx-react';
import * as React from 'react';

import TextBox from 'src/components/TextBox'
import { AuthContextStore } from 'src/models/auth-store';
import { IChartSettings } from 'src/models/chart-settings'
import { IStockMetadata } from 'src/models/stock-metadata';
import { IUserWatchlist, IUserWatchlistItem } from 'src/models/user-watchlist';
import SearchBox from 'src/SearchBox';
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

        const addTickerForm: JSX.Element = (
            <div>
                Add Ticker:
               <SearchBox onSearchFunc={this.addTickerToWatchlist} />
            </div>
        )

        const deleteWatchlistButton: JSX.Element = (
            <div>
                <button onClick={this.deleteWatchlist}>Delete Watchlist</button>
            </div>
        )

        const stockCharts: JSX.Element[] = []
        for (const item of watchlistItems) {
            const removeFromWatchlistFunc = () => this.removeFromWatchlist(item.stockMetadata.ticker);
            stockCharts.push((
                <div key={item.stockMetadata.ticker} style={{paddingBottom: '50px'}}>
                    <h3>{item.stockMetadata.companyName} ( {item.stockMetadata.ticker} )</h3>
                    <button onClick={removeFromWatchlistFunc}>Remove</button>
                    <StockChart ticker={item.stockMetadata.ticker} settings={this.props.chartSettings} />
                </div>
            ))
        }

        return (
            <div>
                {this.renderWatchlistsPicker(currentWatchlist, watchlists)}
                <br />
                <br />
                <div>
                    New Watchlist: <TextBox onSubmitFunc={this.createNewWatchlist}
                                            showSubmitButton={true}
                                            placeholderText="watchlist name" />
                </div>
                <h2>{currentWatchlist.displayName}</h2>
                { deleteWatchlistButton }
                <br />
                <br />
                { addTickerForm }
                { stockCharts }
            </div>
        );
    }

    private renderWatchlistsPicker(currentWatchlist: IUserWatchlist, watchlists: IUserWatchlist[]) {
        const watchlistsToRender = []
        for(const watchlist of watchlists) {
            watchlistsToRender.push(
                <option key={watchlist.watchlistId} value={watchlist.watchlistId}>{watchlist.displayName}</option>
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

    private addTickerToWatchlist = async (ticker: string) => {
        const { authContextStore } = this.props;
        const { currentWatchlist, watchlistItems } = this.state;
        if (!authContextStore.userContext || !currentWatchlist) {
            return;
        }

        const stockMetadata: IStockMetadata = await this.bullwatcher.getStockMetadata(ticker)
        watchlistItems.push({
            position: watchlistItems.length,
            stockMetadata
        })

        const newItems = await this.bullwatcher.setUserWatchlistItems(
            authContextStore.userContext.userId,
            currentWatchlist.watchlistId,
            watchlistItems)

        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist,
            watchlistItems: newItems,
            watchlists: prevState.watchlists
        }});
    }

    private removeFromWatchlist = async (ticker: string) => {
        const { authContextStore } = this.props;
        const { currentWatchlist, watchlistItems } = this.state;
        if (!authContextStore.userContext || !currentWatchlist) {
            return;
        }

        let removePosition: number = 0;
        for (const item of watchlistItems) {
            if (item.stockMetadata.ticker.toLowerCase() === ticker.toLowerCase()) {
                removePosition = item.position;
            }
        }

        const updatedItems: IUserWatchlistItem[] = []
        for (const item of watchlistItems) {
            if (item.position < removePosition) {
                updatedItems.push(item);
            } else if (item.position > removePosition) {
                item.position = item.position - 1
                updatedItems.push(item);
            } else {
                continue;
            }
        }

        const newItems = await this.bullwatcher.setUserWatchlistItems(
            authContextStore.userContext.userId,
            currentWatchlist.watchlistId,
            updatedItems)

        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist,
            watchlistItems: newItems,
            watchlists: prevState.watchlists
        }});
    }

    private deleteWatchlist = async () => {
        const { authContextStore } = this.props;
        const { currentWatchlist } = this.state;
        if (!authContextStore.userContext || !currentWatchlist) {
            return;
        }

        await this.bullwatcher.deleteUserWatchlist(authContextStore.userContext.userId, currentWatchlist.watchlistId);

        this.setState({
            currentWatchlist: null,
            watchlistItems: [],
            watchlists: [],
        }, this.loadWatchlists)
    }

    private createNewWatchlist = async (watchlistName: string) => {
        const { authContextStore } = this.props;
        if (!authContextStore.userContext) {
            return;
        }
        if (watchlistName.length === 0) {
            return;
        }

        await this.bullwatcher.createUserWatchlist(authContextStore.userContext.userId, watchlistName)
        await this.loadWatchlists()
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
