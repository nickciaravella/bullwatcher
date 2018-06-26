import * as React from 'react';
import './App.css';

import logo from './logo.svg';

import StockDetailPage from './pages/StockDetailPage';
import SearchBox from './SearchBox';

import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import StockChart from './StockChart';


interface IAppState {
    searchTicker: string;
}

export default class App extends React.Component<any, IAppState> {

    public render() {
        return (
            <BrowserRouter>
                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <h1 className="App-title">Bull Watcher</h1>
                        <SearchBox onSearchFunc={this.onTickerSearch} />
                    </header>
                    {this.state && this.state.searchTicker && <Redirect to={"/stocks/" + this.state.searchTicker} />}
                    <div style={{ margin: '100px' }}>
                        <Switch>
                            <Route exact={true} path="/" render={() => { // tslint:disable-next-line jsx-no-lambda
                                return (
                                    <StockChart ticker='MSFT' />
                                );
                            }} />
                            <Route exact={true} path="/stocks/:id" component={StockDetailPage} />
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
