import * as React from 'react';
import * as styles from 'src/styles'

import { TimeWindow } from 'src/models/common';
import { ISectorPerformance } from 'src/models/sectors';
import { BullWatcher } from 'src/services/bullwatcher';
import { percentageString, textColorForPercentChange } from 'src/utils'


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
            <div className="pt-3 pb-4 bg-color-sec">
                <table className="table table-borderless ml-3">
                   <thead>
                        <tr>
                            <td className='pb-4'>SECTOR</td>
                            <td className='pb-4'>1 WEEK</td>
                            <td className='pb-4'>1 MONTH</td>
                            <td className='pb-4'>3 MONTHS</td>
                            <td className='pb-4'>1 YEAR</td>
                            <td className='pb-4'>3 YEARS</td>
                            <td className='pb-4'>5 YEARS</td>
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
                    <td className={styles.classNames(styles.textLeft, styles.textColorPrimary)}>
                        {s.sectorName.toUpperCase()}
                    </td>
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

        const textColor: string = textColorForPercentChange(sectorPerf.percentChange);
        return (
            <td className={styles.classNames(textColor)}>
                {percentageString(sectorPerf.percentChange)}
            </td>
        )
    }

    private loadData = async () => {
        const sectorPerformances: ISectorPerformance[] = await this.service.getSectorPerformances();
        this.setState({
            sectors: sectorPerformances.sort((a: ISectorPerformance, b: ISectorPerformance) => {
                const aUpper = a.sectorName.toUpperCase();
                const bUpper = b.sectorName.toUpperCase();
                return aUpper < bUpper ? -1 : 1;
            })
        })
    }
}