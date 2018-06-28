import * as React from 'react';

import { observer } from 'mobx-react';
import { ChartSettingsStore, ChartType, TimeRange, ValueInterval } from './models/chart-settings';

interface IChartSettingsPickerProps {
    chartSettingsStore: ChartSettingsStore
}

@observer
export default class ChartSettingsPicker extends React.Component<IChartSettingsPickerProps, any> {

    constructor(props: IChartSettingsPickerProps) {
        super(props);
   }

     public render() {
        return (
            <div>
                <form>
                    <label>Chart Style</label>
                    <select value={this.props.chartSettingsStore.chartSettings.chartType} onChange={this.handleChartStyleChange}>
                        <option value={ChartType.Line}>Line</option>
                        <option value={ChartType.Candlestick}>Candlestick</option>
                        <option value={ChartType.Area}>Area</option>
                    </select>
                    <label>Time Range</label>
                    <select>
                        <option value={TimeRange.TwoWeeks}>2 weeks</option>
                        <option value={TimeRange.OneMonth}>1 month</option>
                        <option value={TimeRange.ThreeMonths}>3 months</option>
                        <option value={TimeRange.SixMonths}>6 months</option>
                        <option value={TimeRange.OneYear}>1 year</option>
                        <option value={TimeRange.TwoYears}>2 years</option>
                    </select>
                    <label>Interval</label>
                    <select>
                        <option value={ValueInterval.Daily}>Daily</option>
                        <option value={ValueInterval.Weekly}>Weekly</option>
                    </select>
                </form>
            </div>
       );
    }

    private handleChartStyleChange = (event:  React.FormEvent<HTMLSelectElement>) => {
        this.props.chartSettingsStore.chartSettings.chartType = +event.currentTarget.value;
    }
}
