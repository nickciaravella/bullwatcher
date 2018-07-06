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
        this.chartSettings = {
            chartType: ChartType.Candlestick,
            indicators: observable.array([Indicator.Volume]),
            timeRange: TimeRange.ThreeMonths,
            valueInterval: ValueInterval.Daily,
        }
    }
}
