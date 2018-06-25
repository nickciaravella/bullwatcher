import { observer } from 'mobx-react';
import * as React from 'react';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts/highstock';
import { StockHistoryStore } from './models/stock-history';

interface IStockChartProps {
    ticker: string;
}

@observer
export default class StockChart extends React.Component<IStockChartProps, any> {

    private store: StockHistoryStore;
    private ticker: string;

    constructor(props: any) {
        super(props);

        this.store = new StockHistoryStore();
        this.ticker = props.ticker;

        this.store.fetchDailyDataAsync(this.ticker);
    }

    public render() {
        return (
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={this.getChartOptions()}
            />
        );
    }

    private getChartOptions(): any {
        return {
            navigator: {
                enabled: false
            },
            rangeSelector: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            series: [{
                data: this.getStockDailyPriceData(),
                name: 'Close'
            }],
            title: {
                text: this.ticker
            },
        }
    }

    private getStockDailyPriceData(): number[][] {
        const dataArray: number[][] = []

        if (!this.store.stockDailyHistory) {
            return dataArray;
        }

        for (const stock of this.store.stockDailyHistory.data) {
            dataArray.push([stock.date.valueOf(), stock.close])
        }

        return dataArray;
    }
}
