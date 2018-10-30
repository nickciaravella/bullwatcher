import * as React from 'react'

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts/highstock';

import { TimeWindow } from 'src/models/common'
import { ISectorPerformance } from 'src/models/sectors';
import { IStockMetadata } from 'src/models/stock-metadata';
import { IStockRanking } from 'src/models/stock-rankings';
import { roundToTwoPlaces } from 'src/utils'

interface IStockSectorComparisonProps {
    rankings: IStockRanking[];
    sectorPerformances: ISectorPerformance[];
    stockMetadata: IStockMetadata;
}

export default class StockSectorComparison extends React.Component<IStockSectorComparisonProps, any> {
    private TIME_WINDOWS: TimeWindow[] = [
        TimeWindow.ONE_WEEK,
        TimeWindow.ONE_MONTH,
        TimeWindow.THREE_MONTHS,
        TimeWindow.ONE_YEAR,
        TimeWindow.THREE_YEARS
    ]

    public render() {
        const { stockMetadata } = this.props;
        const [minVal, maxVal] = this.getMaxAndMinPercentChange(stockMetadata.sector)
        const labelColor = "#eee";

        return (
            <HighchartsReact
                highcharts={Highcharts}
                options={{
                    chart: {
                        backgroundColor: "#101010",
                        borderColor: 'LightGrey',
                        borderWidth: 1,
                        spacing: [40,40,20,20],
                        type: 'column',
                    },
                    credits: {
                        href: "http://www.bullwatcher.com",
                        text: "bullwatcher.com",
                    },
                    legend: {
                        itemStyle: {
                            color: labelColor
                        },
                    },
                    series: [{
                        colors: ["Green","Green","Red","Red","Green"],
                        data: this.getStockData(stockMetadata.sector),
                        name: stockMetadata.ticker,
                    }, {
                        color: "DarkGray",
                        data: this.getSectorData(stockMetadata.sector),
                        name: this.getSectorNameForId(stockMetadata.sector),
                    }],
                    title:{
                        text: null,
                    },
                    xAxis: {
                        categories: ['1 week', '1 month', '3 months', '1 year', '3 years'],
                        labels: {
                            style: {
                                color: labelColor
                            },
                        },
                        title: {
                            text: null
                        },
                    },
                    yAxis: {
                        gridLineColor: '#555',
                        labels: {
                            overflow: 'justify',
                            style: {
                                color: labelColor,
                            },
                        },
                        max: maxVal,
                        min: minVal,
                        tickInterval: 5,
                        title: {
                            style: {
                                color: labelColor,
                            },
                            text: 'Percent Change',
                        },
                    },

                }}
            />
        )
    }

    private getStockData(sector: string): any[] {
        const data: any[] = []
        for (const timeWindow of this.TIME_WINDOWS) {
            const stockPercent: number = this.getRankingForTimeWindow(timeWindow);
            const sectorPercent: number = this.getSectorPerformanceForTimeWindow(sector, timeWindow);
            let color = "Green";
            if (stockPercent < sectorPercent) {
                color = "Red";
            }
            data.push({
                color,
                y: stockPercent,
            });
        }
        return data;
    }

    private getSectorData(sector: string): number[] {
        return this.TIME_WINDOWS.map(timeWindow => this.getSectorPerformanceForTimeWindow(sector, timeWindow))
    }

    private getRankingForTimeWindow(timeWindow: TimeWindow): number {
        const ranking = this.props.rankings.find(r => r.timeWindow === timeWindow);
        if (!ranking) {
            return 0;
        }
        return roundToTwoPlaces(ranking.value);
    }

    private getSectorNameForId(sector: string): string {
        const performance = this.props.sectorPerformances.find(p => p.id === sector);
        if (!performance) {
            return "Unknown";
        }
        return performance.sectorName;
    }

    private getSectorPerformanceForTimeWindow(sector: string, timeWindow: TimeWindow): number {
        const performance = this.props.sectorPerformances.find(p => p.id === sector && p.timeWindow === timeWindow);
        if (!performance) {
            return 0;
        }
        return roundToTwoPlaces(performance.percentChange);
    }

    private getMaxAndMinPercentChange(sector: string): [number, number] {
        const allPercents: number[] = []
        for (const timeWindow of this.TIME_WINDOWS) {
            allPercents.push(this.getSectorPerformanceForTimeWindow(sector, timeWindow))
            allPercents.push(this.getRankingForTimeWindow(timeWindow))
        }
        return [Math.min(...allPercents), Math.max(...allPercents)]
    }
}