import * as React from 'react';
import { IChartSettings } from '../models/chart-settings'
import StockChart from '../StockChart';

interface IFlagsPageProps {
    chartSettings: IChartSettings;
    date?: string;
}

interface IFlagsPageState {
    stocks: ITickerAndName[];
    date?: Date;
}

interface ITickerAndName {
    ticker: string;
    company_name: string;
}

export default class FlagsPage extends React.Component<IFlagsPageProps, IFlagsPageState> {

    constructor(props: IFlagsPageProps) {
        super(props);
        this.state = {
            date: null,
            stocks: []
        }

        this._loadFlags();
    }

    public render() {
        return (
            <div>
                <h1>Flags</h1>
                {this._renderDate(this.state.date)}
                <hr />
                {this._renderStocksList(this.state.stocks)}
            </div>
        );
    }

    private _renderDate(date?: Date) {
        if (date) {
            return (<h2>{date.toLocaleDateString()}</h2>);
        } else {
            return null;
        }
    }

    private _renderStocksList(stocks: ITickerAndName[]) {
        return stocks.map((stock: ITickerAndName) => (
            <div style={{paddingBottom: '50px'}}>
                <h2>{stock.company_name}</h2>
                <h3>({stock.ticker})</h3>
                <p>17</p>
                <button>+</button>
                <button>-</button>
                <StockChart ticker={stock.ticker} settings={this.props.chartSettings} />
            </div>
        ));
    }

    private _loadFlags() {
        const datePath: string = this.props.date ? `/${this.props.date}` : ''
        fetch(`http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com/patterns/flags${datePath}`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    date: new Date(json.date),
                    stocks: json.pattern_stocks.map((value: any) => ({
                        company_name: value.stock_metadata.company_name,
                        ticker: value.stock_metadata.ticker,
                    })).slice(0,20)
                })
            });
    }
}
