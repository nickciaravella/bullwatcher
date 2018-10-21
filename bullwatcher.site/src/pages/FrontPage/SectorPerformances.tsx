import * as React from 'react';

import { TimeWindow } from 'src/models/common';
import { ISectorPerformance } from 'src/models/sectors';
import { BullWatcher } from 'src/services/bullwatcher';


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
                <h1>Sector Performance</h1>
                <table className="table">
                   <thead className="thead-dark">
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
                    <td style={{ padding: '10px' }}>{s.sectorName}</td>
                    <td>{sectorMap[s.id][TimeWindow.ONE_WEEK] ? sectorMap[s.id][TimeWindow.ONE_WEEK].percentChange : '--'}</td>
                    <td>{sectorMap[s.id][TimeWindow.ONE_MONTH] ? sectorMap[s.id][TimeWindow.ONE_MONTH].percentChange : '--'}</td>
                    <td>{sectorMap[s.id][TimeWindow.THREE_MONTHS] ? sectorMap[s.id][TimeWindow.THREE_MONTHS].percentChange : '--'}</td>
                    <td>{sectorMap[s.id][TimeWindow.ONE_YEAR] ? sectorMap[s.id][TimeWindow.ONE_YEAR].percentChange : '--'}</td>
                    <td>{sectorMap[s.id][TimeWindow.THREE_YEARS] ? sectorMap[s.id][TimeWindow.THREE_YEARS].percentChange : '--'}</td>
                    <td>{sectorMap[s.id][TimeWindow.FIVE_YEARS] ? sectorMap[s.id][TimeWindow.FIVE_YEARS].percentChange : '--'}</td>
                </tr>
            ))
            doneSectors.push(s.id);
        }

        return rows;
    }

    private loadData = async () => {
        const sectorPerformances: ISectorPerformance[] = await this.service.getSectorPerformances();
        this.setState({
            sectors: sectorPerformances
        })
    }
}