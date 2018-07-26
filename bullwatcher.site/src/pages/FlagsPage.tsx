import * as React from 'react';
import { IChartSettings } from '../models/chart-settings'
import StockChart from '../StockChart';

interface IFlagsPageProps {
    chartSettings: IChartSettings;
    date?: string;
}

interface IFlagsPageState {
    tickers: string[];
}

export default class FlagsPage extends React.Component<IFlagsPageProps, IFlagsPageState> {

    constructor(props: IFlagsPageProps) {
        super(props);
        this.state = {
            tickers: []
        }

        this._loadFlags();
    }

    public render() {
        const stockCharts: JSX.Element[] = this.state.tickers.map((ticker: string) => (
            <div style={{paddingBottom: '50px'}}>
               <StockChart ticker={ticker} settings={this.props.chartSettings} />
            </div>
        ));
        return stockCharts;
    }

    private _loadFlags() {
        const datePath: string = this.props.date ? `/${this.props.date}` : ''
        fetch(`http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com/patterns/flags${datePath}`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    tickers: json.map((value: any) => value.ticker).slice(0,20)
                })
            });
    }
}