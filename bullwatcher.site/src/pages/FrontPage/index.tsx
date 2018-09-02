import * as React from 'react';
import { IChartSettings } from '../../models/chart-settings'
import StockChart from '../../StockChart';
import SectorPerformances from './SectorPerformances';

interface IFrontPageProps {
    chartSettings: IChartSettings;
}

// interface IFrontPageState {
// }

export default class FrontPage extends React.Component<IFrontPageProps> {

    constructor(props: IFrontPageProps) {
        super(props);
  }

    public render() {
        return (
            <div>
                <div>
                    <h1>Market Indicies</h1>
                    {
                        <div>
                            <h2>{'NASDAQ (^IXIC)'}</h2>
                            <StockChart ticker='^IXIC' settings={this.props.chartSettings} />
                            <h2>{'NYSE (^NYA)'}</h2>
                            <StockChart ticker='^NYA' settings={this.props.chartSettings} />
                            <h2>{'Dow Jones Industrial Average (^DJI)'}</h2>
                            <StockChart ticker='^DJI' settings={this.props.chartSettings} />
                            <h2>{'S&P 500 (SPY)'}</h2>
                            <StockChart ticker='SPY' settings={this.props.chartSettings} />
                        </div>
                    }
                </div>
                <SectorPerformances />
            </div>
        );
    }
}
