import * as React from 'react';
import { ChartSettingsStore, ChartType, ValueInterval } from './models/chart-settings';

interface IChartSettingsPickerProps {
    chartSettingsStore: ChartSettingsStore
}

export default class ChartSettingsPicker extends React.Component<IChartSettingsPickerProps, any> {

    constructor(props: IChartSettingsPickerProps) {
        super(props);
   }

     public render() {
        return (
            <div>
                <form>
                    <label>Chart Style</label>
                    <select>
                        <option value={ChartType.Line}>Line</option>
                        <option value={ChartType.Candlestick}>Candlestick</option>
                        <option value={ChartType.Area}>Area</option>
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
}
