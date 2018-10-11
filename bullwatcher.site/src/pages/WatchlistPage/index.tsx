import { observer } from 'mobx-react';
import * as React from 'react';

import TextBox from 'src/components/TextBox'
import { AuthContextStore } from 'src/models/auth-store';
import { IChartSettings } from 'src/models/chart-settings'
import { StockCurrentPriceStore } from 'src/models/stock-current-store';
import { IStockMetadata } from 'src/models/stock-metadata';
import { IUserWatchlist, IUserWatchlistItem } from 'src/models/user-watchlist';
import SearchBox from 'src/SearchBox';
import { BullWatcher } from 'src/services/bullwatcher';
import StockChart from 'src/StockChart';
import { IStockCurrentPrice } from '../../models/stock-current';
import StockCurrentPrice from '../../StockCurrentPrice';

interface IWatchlistPageProps {
    authContextStore: AuthContextStore;
    chartSettings: IChartSettings;
    stockCurrentPriceStore: StockCurrentPriceStore;
}

interface IWatchlistPageState {
    currentWatchlist?: IUserWatchlist;
    sortOrder: SortOrder;
    watchlistItems: IWatchlistItemInfo[];
    watchlists: IUserWatchlist[];
}

enum SortOrder {
    ALPHABETICAL = 'alphabetical',
    CUSTOM = 'custom',
    MARKET_CAP = 'marketCap',
    PERCENT_CHANGE = 'percentChange',
}

interface IWatchlistItemInfo {
    item: IUserWatchlistItem;
    price: IStockCurrentPrice;
}

@observer
export default class WatchlistPage extends React.Component<IWatchlistPageProps, IWatchlistPageState> {
    private bullwatcher = new BullWatcher();

    constructor(props: IWatchlistPageProps) {
        super(props);
        this.state = {
            currentWatchlist: null,
            sortOrder: SortOrder.CUSTOM,
            watchlistItems: [],
            watchlists: [],
        }
        this.loadWatchlists();
    }

    public render() {
        const { currentWatchlist, sortOrder, watchlists } = this.state;

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

        const sortOrderPicker: JSX.Element = (
            <form>
                <label>Sort Order</label>
                <select value={sortOrder} onChange={this.handleSortOrderChanged}>
                    <option value={SortOrder.ALPHABETICAL}>Alphabetical</option>
                    <option value={SortOrder.CUSTOM}>Custom</option>
                    <option value={SortOrder.MARKET_CAP}>Market Cap</option>
                    <option value={SortOrder.PERCENT_CHANGE}>Percent Change</option>
                </select>
            </form>
        )

        const stockCharts: JSX.Element[] = []
        for (const info of this.getSortedItems()) {
            const item: IUserWatchlistItem = info.item;
            const removeFromWatchlistFunc = () => this.removeFromWatchlist(item.stockMetadata.ticker);
            stockCharts.push((
                <div key={item.stockMetadata.ticker} style={{paddingBottom: '50px'}}>
                    <h3>{item.stockMetadata.companyName} ( {item.stockMetadata.ticker} )</h3>
                    <button onClick={removeFromWatchlistFunc}>Remove</button>
                    <StockCurrentPrice currentPrice={info.price} />
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
                { sortOrderPicker }
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

        const newItemInfos: IWatchlistItemInfo[] = await this.getWatchlistItemInfos(newItems);

        this.setState((prevState) => { return {
            currentWatchlist: newWatchlist,
            sortOrder: prevState.sortOrder,
            watchlistItems: newItemInfos,
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
        const newItem: IUserWatchlistItem = {
            position: watchlistItems.length,
            stockMetadata
        }

        let newItems: IUserWatchlistItem[] = watchlistItems.map(item => item.item);
        newItems.push(newItem);

        newItems = await this.bullwatcher.setUserWatchlistItems(
            authContextStore.userContext.userId,
            currentWatchlist.watchlistId,
            newItems)

        const newItemInfos: IWatchlistItemInfo[] = await this.getWatchlistItemInfos(newItems);

        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist,
            sortOrder: prevState.sortOrder,
            watchlistItems: newItemInfos,
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
        for (const info of watchlistItems) {
            const item: IUserWatchlistItem = info.item;
            if (item.stockMetadata.ticker.toLowerCase() === ticker.toLowerCase()) {
                removePosition = item.position;
            }
        }

        const updatedItems: IUserWatchlistItem[] = []
        for (const info of watchlistItems) {
            const item: IUserWatchlistItem = info.item;
            if (item.position < removePosition) {
                updatedItems.push(item);
            } else if (item.position > removePosition) {
                item.position = item.position - 1
                updatedItems.push(item);
            } else {
                continue;
            }
        }

        const newItems: IUserWatchlistItem[] = await this.bullwatcher.setUserWatchlistItems(
            authContextStore.userContext.userId,
            currentWatchlist.watchlistId,
            updatedItems);

        const newItemInfos: IWatchlistItemInfo[] = await this.getWatchlistItemInfos(newItems);

        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist,
            sortOrder: prevState.sortOrder,
            watchlistItems: newItemInfos,
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

        this.setState((prevState) => { return {
            currentWatchlist: null,
            sortOrder: prevState.sortOrder,
            watchlistItems: [],
            watchlists: [],
        } }, this.loadWatchlists)
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

        let newItemInfos: IWatchlistItemInfo[] = watchlistItems;
        if (!currentWatchlist) {
            const newItems = await this.bullwatcher.getUserWatchlistItems(
                authContextStore.userContext.userId,
                firstWatchlist.watchlistId);
            newItemInfos = await this.getWatchlistItemInfos(newItems);
        }

        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist ? prevState.currentWatchlist : firstWatchlist,
            sortOrder: prevState.sortOrder,
            watchlistItems: newItemInfos,
            watchlists
        }})
    }

    private getSortedItems(): IWatchlistItemInfo[] {
        const { sortOrder, watchlistItems } = this.state;

        let comparer = (one: IWatchlistItemInfo, two: IWatchlistItemInfo) => one.item.position - two.item.position;
        switch (sortOrder) {
            case SortOrder.ALPHABETICAL:
                comparer = (one: IWatchlistItemInfo, two: IWatchlistItemInfo) =>
                    one.item.stockMetadata.companyName.toUpperCase() > two.item.stockMetadata.companyName.toUpperCase() ? 1 : -1;
                break;
            case SortOrder.MARKET_CAP:
                comparer = (one: IWatchlistItemInfo, two: IWatchlistItemInfo) =>
                    two.item.stockMetadata.marketCap - one.item.stockMetadata.marketCap;
                break;
            case SortOrder.PERCENT_CHANGE:
            comparer = (one: IWatchlistItemInfo, two: IWatchlistItemInfo) => {
                const onePercentChange = (one.price.currentPrice-one.price.lastClose) / one.price.lastClose
                const twoPercentChange = (two.price.currentPrice-two.price.lastClose) / two.price.lastClose
                return twoPercentChange - onePercentChange;
            }
            case SortOrder.CUSTOM:
            default:
                break;
        }

        return watchlistItems.sort(comparer);
    }

    private handleSortOrderChanged = (event: React.FormEvent<HTMLSelectElement>) => {
        const newSortOrder: SortOrder = event.currentTarget.value as SortOrder;
        this.setState((prevState) => { return {
            currentWatchlist: prevState.currentWatchlist,
            sortOrder: newSortOrder,
            watchlistItems: prevState.watchlistItems,
            watchlists: prevState.watchlists
        }})
    }

    private getWatchlistItemInfos = async (items: IUserWatchlistItem[]) => {
        const newItemInfos: IWatchlistItemInfo[] = [];
        for (const item of items) {
            const price: IStockCurrentPrice = await this.props.stockCurrentPriceStore.getStockCurrentPrice(item.stockMetadata.ticker);
            newItemInfos.push({
                item,
                price
            })
        }

        return newItemInfos;
    }
}
