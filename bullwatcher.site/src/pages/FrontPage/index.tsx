import * as React from 'react';

import NewsList from 'src/components/NewsList';
import SectorPerformances from './SectorPerformances';
import StockBox from './StockBox';

import { IChartSettings } from 'src/models/chart-settings'
import { StockCurrentPriceStore } from 'src/models/stock-current-store';

interface IFrontPageProps {
    chartSettings: IChartSettings;
    stockCurrentPriceStore: StockCurrentPriceStore;
}

// interface IFrontPageState {
// }

export default class FrontPage extends React.Component<IFrontPageProps> {

    constructor(props: IFrontPageProps) {
        super(props);
    }

    public render() {
        const { stockCurrentPriceStore } = this.props;
        return (
            <div>
                <div>
                    <h1 className="p-3">Todays Market</h1>
                    <div className="d-flex justify-between flex-wrap" style={{ height: '750px'}}>
                        <div className="w-50 h-50 p-3">
                            <StockBox ticker="SPY"
                                    stockName="SPDR S&P 500 ETF Trust"
                                    stockCurrentPriceStore={stockCurrentPriceStore} />
                        </div>
                        <div className="w-50 h-50 p-3">
                            <StockBox ticker="DIA"
                                    stockName="SPDR Dow Jones Industrial Average ETF"
                                    stockCurrentPriceStore={stockCurrentPriceStore} />
                        </div>
                        <div className="w-50 h-50 p-3">
                            <StockBox ticker="VTI"
                                        stockName="Vanguard Total Stock Market ETF"
                                        stockCurrentPriceStore={stockCurrentPriceStore} />
                        </div>
                        <div className="w-50 h-50 p-3">
                            <StockBox ticker="QQQ"
                                    stockName="Invesco QQQ Trust"
                                    stockCurrentPriceStore={stockCurrentPriceStore} />
                        </div>
                    </div>
                </div>
                <div className="pl-3">
                    <h1 className="pt-5">Sector Trends</h1>
                    <SectorPerformances />
                </div>
                <div className="pt-5 pl-3">
                    <NewsList />
                </div>
            </div>
        );
    }
}
