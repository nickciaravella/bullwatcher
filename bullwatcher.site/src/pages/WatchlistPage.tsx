import { observer } from 'mobx-react';
import * as React from 'react';

import { IChartSettings } from 'src/models/chart-settings'
import StockChart from 'src/StockChart';

interface IWatchlistPageProps {
    tickers: string;
    chartSettings: IChartSettings;
}

interface IWatchlistPageState {
    tickers: string[];
}

@observer
export default class WatchlistPage extends React.Component<IWatchlistPageProps, IWatchlistPageState> {

    constructor(props: IWatchlistPageProps) {
        super(props);
        this.state = {
            tickers: this.parseTickers(this.props.tickers)
        }
    }

    public render() {
        const stockCharts: JSX.Element[] = this.state.tickers.map((ticker: string) => (
            <div style={{paddingBottom: '50px'}}>
               <StockChart ticker={ticker} settings={this.props.chartSettings} />
            </div>
        ));
        return stockCharts;
    }

    private parseTickers(tickers: string): string[] {
        return tickers.split(',');
    }
}
