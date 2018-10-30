import { observer } from 'mobx-react';
import * as React from 'react';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts/highstock';
import * as HSIndicators from 'highcharts/indicators/indicators';
import { ChartType, IChartSettings, Indicator, TimeRange, ValueInterval } from './models/chart-settings';
import { StockHistoryStore } from './models/stock-history-store';

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
        const { chartType, indicators, timeRange } = this.props.settings;
        const chartTypeStr = this.chartTypeFromEnum(chartType);
        const labelColor = "#eee";

        const [data, minY, maxY] = this.getStockDailyPriceData(chartType, timeRange)
        return {
            chart: {
                backgroundColor: "#101010",
                borderColor: 'LightGrey',
                borderWidth: 1,
                height: '50%',
                spacing: [40,40,40,40],

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
                color: 'Gray',
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
                color: "DarkSlateBlue",
                linkedTo: 'price',
                params: {
                    period: 10
                },
                type: 'sma',
                visible: indicators.indexOf(Indicator.ShortMovingAverage) !== -1
            }, {
                color: "Maroon",
                linkedTo: 'price',
                params: {
                    period: 50
                },
                type: 'sma',
                visible: indicators.indexOf(Indicator.MediumMovingAverage) !== -1
            }, {
                color: "DarkOliveGreen",
                linkedTo: 'price',
                params: {
                    period: 200
                },
                type: 'sma',
                visible: indicators.indexOf(Indicator.LongMovingAverage) !== -1
            }, {
                color: chartType === ChartType.Candlestick ? 'Crimson' : "black",
                data,
                dataGrouping: {
                    forced: true,
                    units: [
                        [this.getChartInterval(this.props.settings.valueInterval), [1]]
                    ]
                },
                id: 'price',
                lineColor: chartType === ChartType.Candlestick ? "#888" : "white" ,
                name: 'Price',
                type: `${chartTypeStr}`,
                upColor: 'MediumSeaGreen',
                yAxis: 0
            }],
            xAxis: {
                labels: {
                    style: {
                        color: labelColor
                    },
                },
                range: this.getChartRange(timeRange),
            },
            yAxis: [{
                crosshair: true,
                gridLineColor: '#555',
                height: '80%',
                labels: {
                    style: {
                        color: labelColor
                    },
                },
                max: maxY,
                maxPadding: 0,
                min: minY,
                offset: 30
            }, {
                gridLineColor: '#555',
                height: '20%',
                labels: {
                    style: {
                        color: labelColor
                    },
                },
                top: '80%',
            }]
        }
    }

    private getStockDailyPriceData(chartType: ChartType, timeRange: TimeRange): [number[][], number, number] {
        const dataArray: number[][] = []

        if (!this.store.stockDailyHistory) {
            return [dataArray, 0, 0];
        }

        const minDate: Date = new Date();
        minDate.setDate(minDate.getDate() - this.getDaysForTimeRange(timeRange))
        let minYValue = 999999999;
        let maxYValue = 0;

        for (const stock of this.store.stockDailyHistory.data) {
            let data: any[] = []

            if (stock.date.valueOf() > minDate.valueOf()) {
                if (stock.high > maxYValue) {
                     maxYValue = stock.high;
                }
                if (stock.low < minYValue) {
                    minYValue = stock.low;
                }
            }

            switch (chartType) {
                case ChartType.Candlestick:
                    data = [ stock.date.valueOf(), stock.open, stock.high, stock.low, stock.close ]
                    break;
                case ChartType.Line:
                    data = [ stock.date.valueOf(), stock.close ]
            }
            dataArray.push(data)
        }

         return [dataArray, minYValue, maxYValue];
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

    private getDaysForTimeRange(range: TimeRange): number {
        switch (range) {
            case TimeRange.TwoWeeks:    return 14;
            case TimeRange.OneMonth:    return 30;
            case TimeRange.ThreeMonths: return 30 * 3;
            case TimeRange.SixMonths:   return 30 * 6;
            case TimeRange.OneYear:     return 365;
            case TimeRange.TwoYears:    return 365 * 2;
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