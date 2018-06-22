import * as React from 'react';
import './App.css';

import logo from './logo.svg';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts/highstock';

import SearchBox from './SearchBox';

class App extends React.Component {
  private options = {
    series: [{
      data: [100, 102, 101, 100.42, 103]
    }],
    title: {
      text: 'MSFT'
    }
  }
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Bull Watcher</h1>
          <SearchBox />
        </header>
        <div style={{ margin: '100px' }}>
          <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={this.options}
          />
        </div>
      </div>
    );
  }
}

export default App;
