import * as React from 'react';
import './App.css';

import logo from './logo.svg';

import StockDetailPage from './pages/StockDetailPage';
import WatchlistPage from './pages/WatchlistPage';

import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import StockChart from './StockChart';

import ChartSettingsPicker from './ChartSettingsPicker';
import { ChartSettingsStore } from './models/chart-settings'
import SearchBox from './SearchBox';

interface IAppState {
    searchTicker: string;
}

export default class App extends React.Component<any, IAppState> {
    public componentDidMount() {
        document.title = "Bull Watcher"
    }

    public render() {
        const chartSettingsStore = new ChartSettingsStore();
        chartSettingsStore.fetchChartSettings();

        return (
            <BrowserRouter>
                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <h1 className="App-title">Bull Watcher</h1>
                        <SearchBox onSearchFunc={this.onTickerSearch} />
                    </header>
                    <div>
                        <button>Change Chart Settings</button>
                        <div style={{visibility: 'visible'}}>
                            <ChartSettingsPicker chartSettingsStore={chartSettingsStore} />
                        </div>
                    </div>
                    {this.state && this.state.searchTicker && <Redirect to={"/stocks/" + this.state.searchTicker} />}
                    <div style={{ margin: 'auto', paddingTop: '50px', maxWidth: '1200px'}}>
                        <Switch>
                            <Route exact={true} path="/" render={() => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <StockChart ticker='MSFT' settings={chartSettingsStore.chartSettings} />
                                );
                            }} />
                            <Route path="/stocks/:id" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <StockDetailPage
                                        ticker={props.match.params.id}
                                        chartSettings={chartSettingsStore.chartSettings} />
                                );
                           }} />
                           <Route path="/watchlist/:tickers" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <WatchlistPage
                                        tickers={props.match.params.tickers}
                                        chartSettings={chartSettingsStore.chartSettings} />
                                );
                           }} />
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        );
    }

    private onTickerSearch = (ticker: string): void => {
        this.setState({
            searchTicker: ticker
        });
    }
}
