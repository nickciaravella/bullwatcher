import { observer } from 'mobx-react';
import * as React from 'react';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts/highstock';
import { ChartType, IChartSettings } from './models/chart-settings';
import { StockHistoryStore } from './models/stock-history';

interface IStockChartProps {
    settings: IChartSettings;
    ticker: string;
}

@observer
export default class StockChart extends React.Component<IStockChartProps, any> {

    private store: StockHistoryStore;

    constructor(props: any) {
        super(props);

        this.store = new StockHistoryStore();
        this.store.fetchDailyDataAsync(this.props.ticker);
    }

    public componentDidUpdate (prevProps: IStockChartProps) {
        if (this.props.ticker !== prevProps.ticker) {
            this.store.fetchDailyDataAsync(this.props.ticker);
        }
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
        const { chartType } = this.props.settings;
        const chartTypeStr = this.chartTypeFromEnum(chartType);

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
                type: `${chartTypeStr}`,
            }, {
                data: this.getStockDailyVolumeData(),
                name: 'Volume',
                type: 'column',
                yAxis: 1,
            }],
            title: {
                text: this.props.ticker
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

    private chartTypeFromEnum(typeEnum: ChartType): string {
        switch (typeEnum) {
            case ChartType.Line: return 'line';
            case ChartType.Candlestick: return 'candlestick';
            case ChartType.Area: return 'area';
        }
        return '';
    }
}