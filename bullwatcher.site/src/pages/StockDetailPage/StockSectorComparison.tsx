import * as React from 'react'

import { TimeWindow } from 'src/models/common'
import { ISectorPerformance } from 'src/models/sectors';
import { IStockMetadata } from 'src/models/stock-metadata';
import { IStockRanking } from 'src/models/stock-rankings';
import { percentageString } from 'src/utils'


interface IStockSectorComparisonProps {
    rankings: IStockRanking[];
    sectorPerformances: ISectorPerformance[];
    stockMetadata: IStockMetadata;
}

export default class StockSectorComparison extends React.Component<IStockSectorComparisonProps, any> {
    public render() {
        const { stockMetadata } = this.props;
        return (
            <table className="table border">
                <thead className="thead-light">
                    <tr>
                        <th/>
                        <th>1 week</th>
                        <th>1 month</th>
                        <th>3 months</th>
                        <th>1 year</th>
                        <th>3 years</th>
                    </tr>
                </thead>
                <tr>
                    <td>{stockMetadata.companyName}</td>
                    <td>{this.getRankingForTimeWindow(TimeWindow.ONE_WEEK)}</td>
                    <td>{this.getRankingForTimeWindow(TimeWindow.ONE_MONTH)}</td>
                    <td>{this.getRankingForTimeWindow(TimeWindow.THREE_MONTHS)}</td>
                    <td>{this.getRankingForTimeWindow(TimeWindow.ONE_YEAR)}</td>
                    <td>{this.getRankingForTimeWindow(TimeWindow.THREE_YEARS)}</td>
                </tr>
                <tr>
                    <td>{this.getSectorNameForId(stockMetadata.sector)}</td>
                    <td>{this.getSectorPerformanceForTimeWindow(stockMetadata.sector, TimeWindow.ONE_WEEK)}</td>
                    <td>{this.getSectorPerformanceForTimeWindow(stockMetadata.sector, TimeWindow.ONE_MONTH)}</td>
                    <td>{this.getSectorPerformanceForTimeWindow(stockMetadata.sector, TimeWindow.THREE_MONTHS)}</td>
                    <td>{this.getSectorPerformanceForTimeWindow(stockMetadata.sector, TimeWindow.ONE_YEAR)}</td>
                    <td>{this.getSectorPerformanceForTimeWindow(stockMetadata.sector, TimeWindow.THREE_YEARS)}</td>
                </tr>
            </table>
        )
    }

    private getRankingForTimeWindow(timeWindow: TimeWindow): string {
        const ranking = this.props.rankings.find(r => r.timeWindow === timeWindow);
        if (!ranking) {
            return '--';
        }
        return percentageString(ranking.value);
    }

    private getSectorNameForId(sector: string): string {
        const performance = this.props.sectorPerformances.find(p => p.id === sector);
        if (!performance) {
            return "Unknown";
        }
        return performance.sectorName;
    }

    private getSectorPerformanceForTimeWindow(sector: string, timeWindow: TimeWindow): string {
        const performance = this.props.sectorPerformances.find(p => p.id === sector && p.timeWindow === timeWindow);
        if (!performance) {
            return '--';
        }
        return percentageString(performance.percentChange);
    }
}