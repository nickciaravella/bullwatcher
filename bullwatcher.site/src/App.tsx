import * as React from 'react';
import './App.css';

import logo from './logo.svg';

import SearchBox from './SearchBox';
import StockChart from './StockChart';

export default class App extends React.Component {
    public render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Bull Watcher</h1>
                    <SearchBox />
                </header>
                <div style={{ margin: '100px' }}>
                    <StockChart ticker='MSFT' />
                </div>
            </div>
        );
    }
}
