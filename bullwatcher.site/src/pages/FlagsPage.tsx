import * as React from 'react';
import { IChartSettings } from '../models/chart-settings'
import StockChart from '../StockChart';

interface IFlagsPageProps {
    chartSettings: IChartSettings;
    date?: string;
}

interface IFlagsPageState {
    stocks: ITickerAndName[];
}

interface ITickerAndName {
    ticker: string;
    company_name: string;
}

export default class FlagsPage extends React.Component<IFlagsPageProps, IFlagsPageState> {

    constructor(props: IFlagsPageProps) {
        super(props);
        this.state = {
            stocks: []
        }

        this._loadFlags();
    }

    public render() {
        const stockCharts: JSX.Element[] = this.state.stocks.map((stock: ITickerAndName) => (
            <div style={{paddingBottom: '50px'}}>
                <h2>{stock.company_name}</h2>
                <p>17</p>
                <button>+</button>
                <button>-</button>
                <StockChart ticker={stock.ticker} settings={this.props.chartSettings} />
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
                    stocks: json.map((value: any) => ({
                        company_name: value.company_name,
                        ticker: value.ticker,
                    })).slice(0,20)
                })
            });
    }
}