import { observer } from 'mobx-react';
import * as React from 'react';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts/highstock';
import * as HSIndicators from 'highcharts/indicators/indicators';
import { ChartType, IChartSettings, Indicator, TimeRange, ValueInterval } from './models/chart-settings';
import { StockHistoryStore } from './models/stock-history';

HSIndicators(Highcharts);

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
        const { chartType, indicators } = this.props.settings;
        const chartTypeStr = this.chartTypeFromEnum(chartType);

        return {
            chart: {
                borderColor: 'LightGrey',
                borderWidth: 1,
                height: '40%',
                spacing: [40,40,40,40]
            },
            credits: {
                href: "http://www.bullwatcher.com",
                text: "bullwatcher.com",
            },
            navigator: {
                enabled: false
            },
            plotOptions: {
                sma: {
                    marker: {
                        enabled: false
                    }
                }
            },
            rangeSelector: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            series: [{
                color: 'black',
                data: this.getStockDailyVolumeData(),
                dataGrouping: {
                    forced: true,
                    units: [
                        [this.getChartInterval(this.props.settings.valueInterval), [1]]
                    ]
                },
                name: 'Volume',
                type: 'column',
                visible: indicators.indexOf(Indicator.Volume) !== -1,
                yAxis: 1,
            }, {
                color: "Thistle",
                linkedTo: 'price',
                params: {
                    period: 10
                },
                type: 'sma',
                visible: indicators.indexOf(Indicator.ShortMovingAverage) !== -1
            }, {
                color: "PaleTurquoise",
                linkedTo: 'price',
                params: {
                    period: 50
                },
                type: 'sma',
                visible: indicators.indexOf(Indicator.MediumMovingAverage) !== -1
            }, {
                color: "PaleGoldenRod",
                linkedTo: 'price',
                params: {
                    period: 200
                },
                type: 'sma',
                visible: indicators.indexOf(Indicator.LongMovingAverage) !== -1
            }, {
                color: chartType === ChartType.Candlestick ? 'Crimson' : "black",
                data: this.getStockDailyPriceData(),
                dataGrouping: {
                    forced: true,
                    units: [
                        [this.getChartInterval(this.props.settings.valueInterval), [1]]
                    ]
                },
                id: 'price',
                name: 'Price',
                type: `${chartTypeStr}`,
                upColor: 'MediumSeaGreen',
                yAxis: 0
            }],
            xAxis: {
                range: this.getChartRange(this.props.settings.timeRange),
            },
            yAxis: [{
                crosshair: true,
                height: '80%',
                offset: 30
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

         return dataArray;
    }

    private chartTypeFromEnum(typeEnum: ChartType): string {
        switch (typeEnum) {
            case ChartType.Line: return 'line';
            case ChartType.Candlestick: return 'candlestick';
        }
        return '';
    }

    private getChartRange(range: TimeRange): number {
        const oneDay: number = 24 * 36e5;
        switch (range) {
            case TimeRange.TwoWeeks:    return oneDay * 14;
            case TimeRange.OneMonth:    return oneDay * 30;
            case TimeRange.ThreeMonths: return oneDay * 30 * 3;
            case TimeRange.SixMonths:   return oneDay * 30 * 6;
            case TimeRange.OneYear:     return oneDay * 30 * 12;
            case TimeRange.TwoYears:    return oneDay * 30 * 12 * 2;
        }
        return 0;
    }

    private getChartInterval(interval: ValueInterval): string {
        switch (interval) {
            case ValueInterval.Daily: return 'day';
            case ValueInterval.Weekly: return 'week';
            case ValueInterval.Monthly: return 'month';
       }
       return '';
    }
}