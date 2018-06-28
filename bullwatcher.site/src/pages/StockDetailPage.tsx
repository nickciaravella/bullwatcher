import * as React from 'react';
import { IChartSettings } from '../models/chart-settings'
import StockChart from '../StockChart';

interface IStockDetailPageProps {
    ticker: string;
    chartSettings: IChartSettings;
}

interface IStockDetailPageState {
    ticker: string;
}

export default class App extends React.Component<IStockDetailPageProps, IStockDetailPageState> {

    constructor(props: IStockDetailPageProps) {
        super(props);
        this.state = {ticker: this.props.ticker};
    }

    public componentDidUpdate (prevProps: IStockDetailPageProps) {
        if (prevProps.ticker !== this.props.ticker) {
            this.setState({ticker: this.props.ticker });
        }
      }

    public render() {
        return (
            <div className="App">
               <div>
                   <StockChart ticker={this.state.ticker} settings={this.props.chartSettings} />
                </div>
            </div>
        );
    }
}
