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
            credits: {
                href: "http://www.bullwatcher.com",
                text: "bullwatcher.com",
            },
            navigator: {
                enabled: false
            },
            rangeSelector: {
                buttons: [{
                    count: 1,
                    text: '1m',
                    type: 'month',
                },{
                    count: 3,
                    text: '3m',
                    type: 'month'
                },{
                    count: 6,
                    text: '6m',
                    type: 'month'
                },{
                    count: 1,
                    text: '1y',
                    type: 'year'
                },{
                    count: 2,
                    text: '2y',
                    type: 'year'
                }],
                inputEnabled: false,
            },
            scrollbar: {
                enabled: false
            },
            series: [{
                data: this.getStockDailyPriceData(),
                name: 'Price',
                type: 'candlestick',
            }, {
                data: this.getStockDailyVolumeData(),
                name: 'Volume',
                type: 'column',
                yAxis: 1,
            }],
            title: {
                text: this.ticker
            },
            xAxis: {
                range: 90*24*36e5,
            },
            yAxis: [{
                height: '80%'
            }, {
                height: '20%',
                top: '80%'
            }]
        }
    }

    private getStockDailyPriceData(): number[][] {
        const dataArray: number[][] = []

        if (!this.store.stockDailyHistory) {
            return dataArray;
        }

        for (const stock of this.store.stockDailyHistory.data) {
            dataArray.push([
                stock.date.valueOf(),
                stock.open,
                stock.high,
                stock.low,
                stock.close
            ])
        }

        dataArray.sort((first: number[], second: number[]) =>  first[0]-second[0])

         return dataArray;
    }

    private getStockDailyVolumeData(): number[][] {
        const dataArray: number[][] = []

        if (!this.store.stockDailyHistory) {
            return dataArray;
        }

        for (const stock of this.store.stockDailyHistory.data) {
            dataArray.push([
                stock.date.valueOf(),
                stock.volume,
            ])
        }

        dataArray.sort((first: number[], second: number[]) =>  first[0]-second[0])

         return dataArray;
    }
}