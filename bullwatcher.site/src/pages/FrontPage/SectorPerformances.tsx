import * as React from 'react';

import { TimeWindow } from 'src/models/common';
import { ISectorPerformance } from 'src/models/sectors';
import { BullWatcher } from 'src/services/bullwatcher';
import { percentageString } from 'src/utils'


interface ISectorPerformancesState {
    sectors: ISectorPerformance[]
}

// interface IStockPerformancesProps {
// }

export default class SectorPerformances extends React.Component<any, ISectorPerformancesState> {
    private service: BullWatcher;

    constructor(props: any) {
        super(props);
        this.state = {
            sectors: []
        }
        this.service = new BullWatcher();
        this.loadData();
    }

    public render() {
        if (this.state.sectors.length === 0) {
            return null;
        }
        return (
            <div>
                <table className="table">
                   <thead className="thead-light">
                        <tr>
                            <th>Sector</th>
                            <th>1 week</th>
                            <th>1 month</th>
                            <th>3 months</th>
                            <th>1 year</th>
                            <th>3 years</th>
                            <th>5 years</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.sectors.length > 0 && this.getSectorRows()
                        }
                    </tbody>

                </table>
            </div>
    )}

    private getSectorRows() {
        const sectorMap = {}
        for (const sector of this.state.sectors) {
            if (!(sector.id in sectorMap)) {
                sectorMap[sector.id] = {}
            }
            sectorMap[sector.id][sector.timeWindow] = sector;
        }

        const rows = []
        const doneSectors: string[] = [];
        for (const s of this.state.sectors) {
            if (doneSectors.find((id) => id === s.id)) {
                continue;
            }
            rows.push((
                <tr key={s.id}>
                    <td className="text-left">{s.sectorName}</td>
                    {this.getSectorRow(sectorMap[s.id][TimeWindow.ONE_WEEK])}
                    {this.getSectorRow(sectorMap[s.id][TimeWindow.ONE_MONTH])}
                    {this.getSectorRow(sectorMap[s.id][TimeWindow.THREE_MONTHS])}
                    {this.getSectorRow(sectorMap[s.id][TimeWindow.ONE_YEAR])}
                    {this.getSectorRow(sectorMap[s.id][TimeWindow.THREE_YEARS])}
                    {this.getSectorRow(sectorMap[s.id][TimeWindow.FIVE_YEARS])}
                </tr>
            ))
            doneSectors.push(s.id);
        }

        return rows;
    }

    private getSectorRow(sectorPerf?: ISectorPerformance) {
        if (!sectorPerf) {
            return (<td />)
        }

        let bgColor = "bg-light";
        let textColor = "text-dark";
        if (sectorPerf.percentChange > 0) {
            bgColor = "bg-success";
            textColor = "text-light";
        } else if (sectorPerf.percentChange < 0) {
            bgColor = "bg-danger";
            textColor = "text-light";
        }
        return (<td className={`${bgColor} ${textColor}`}>{percentageString(sectorPerf.percentChange)}</td>)
    }

    private loadData = async () => {
        const sectorPerformances: ISectorPerformance[] = await this.service.getSectorPerformances();
        this.setState({
            sectors: sectorPerformances
        })
    }
}