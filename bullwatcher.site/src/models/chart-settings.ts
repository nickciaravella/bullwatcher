import { IObservableArray, observable } from 'mobx';

export interface IChartSettings {
    chartType: ChartType;
    timeRange: TimeRange;
    valueInterval: ValueInterval;
    indicators: IObservableArray<Indicator>
}

export enum ChartType {
    Line,
    Candlestick
}

export enum TimeRange {
    TwoWeeks,
    OneMonth,
    ThreeMonths,
    SixMonths,
    OneYear,
    TwoYears
}

export enum ValueInterval {
    Daily,
    Weekly,
    Monthly
}

export enum Indicator {
    Volume,
    LongMovingAverage,
    MediumMovingAverage,
    ShortMovingAverage
}

export class ChartSettingsStore {
    @observable public chartSettings: IChartSettings;

    public fetchChartSettings(): void {
        const foundSettings: string = localStorage.getItem('chartSettings');
        if (foundSettings) {
            this.chartSettings = JSON.parse(foundSettings);
        } else {
            this.chartSettings = {
                chartType: ChartType.Candlestick,
                indicators: observable.array([Indicator.Volume]),
                timeRange: TimeRange.ThreeMonths,
                valueInterval: ValueInterval.Daily,
            }
        }
    }

    public saveChartSettings(): void {
        localStorage.setItem('chartSettings', JSON.stringify(this.chartSettings))
    }
}
