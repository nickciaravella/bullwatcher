import * as React from 'react';
import './App.css';

import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

// import Footer from 'src/components/siteTemplate/Footer';
import Header from 'src/components/siteTemplate/Header'
import NavBar from 'src/components/siteTemplate/NavBar';
import { AuthContextStore } from 'src/models/auth-store';
import { ChartSettingsStore } from 'src/models/chart-settings'
import { StockCurrentPriceStore } from 'src/models/stock-current-store';
import { StockMetadataStore } from 'src/models/stock-metadata';
import FlagsPage from 'src/pages/FlagsPage';
import FrontPage from 'src/pages/FrontPage';
import RankingsPage from 'src/pages/RankingsPage';
import StockDetailPage from 'src/pages/StockDetailPage';
import WatchlistPage from 'src/pages/WatchlistPage';

interface IAppState {
    searchTicker: string;
}

export default class App extends React.Component<any, IAppState> {

    public render() {
        const chartSettingsStore = new ChartSettingsStore();
        chartSettingsStore.fetchChartSettings();
        const stockCurrentPriceStore = new StockCurrentPriceStore();
        const stockMetadataStore = new StockMetadataStore();
        const authContextStore = new AuthContextStore();
        authContextStore.loadUserContext();
        return (
            <BrowserRouter>
                <div className="App">
                    <Header authContextStore={authContextStore} />
                    <NavBar onTickerSearch={this.onTickerSearch} />
                    {this.state && this.state.searchTicker && <Redirect to={"/stocks/" + this.state.searchTicker} />}
                    <div style={{ margin: 'auto', paddingTop: '15px', maxWidth: '1200px'}}>
                        <Switch>
                            <Route exact={true} path="/" render={() => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                   <FrontPage chartSettings={chartSettingsStore.chartSettings}
                                              stockCurrentPriceStore={stockCurrentPriceStore} />
                                );
                            }} />
                            <Route path="/stocks/:id" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <StockDetailPage
                                        chartSettingsStore={chartSettingsStore}
                                        stockMetadataStore={stockMetadataStore}
                                        ticker={props.match.params.id} />
                                );
                           }} />
                           <Route path="/watchlists" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <WatchlistPage
                                        authContextStore={authContextStore}
                                        chartSettings={chartSettingsStore.chartSettings}
                                        stockCurrentPriceStore={stockCurrentPriceStore} />
                                );
                           }} />
                           <Route path="/patterns/flags/:date" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <FlagsPage
                                        chartSettings={chartSettingsStore.chartSettings}
                                        date={props.match.params.date}
                                        authContextStore={authContextStore} />
                                );
                           }} />
                           <Route path="/patterns/flags" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <FlagsPage
                                        chartSettings={chartSettingsStore.chartSettings}
                                        authContextStore={authContextStore} />
                                );
                           }} />
                           <Route path="/rankings" render={(props) => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <RankingsPage chartSettings={chartSettingsStore.chartSettings} />
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
