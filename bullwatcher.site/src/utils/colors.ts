import * as sytles from 'src/styles'

import {calculatePercentChange} from './math'

export function textColorForPercentChange(percentChange: number): string {
    if (percentChange > 0) {
        return sytles.textColorGreen;
    }
    else if (percentChange < 0) {
        return sytles.textColorRed;
    }
    else {
        return "";
    }
}

export function textColorForStockPriceChange(current: number, base: number): string {
    const percentChange: number = calculatePercentChange(current, base);
    return textColorForPercentChange(percentChange);
}

export function bgColorForPercentChange(percentChange: number): string {
    if (percentChange > 0) {
        return sytles.bgColorGreen;
    }
    else if (percentChange < 0) {
        return sytles.bgColorRed;
    }
    else {
        return "";
    }
}

export function bgColorForStockPriceChange(base: number, current: number): string {
    const percentChange: number = calculatePercentChange(current, base);
    return bgColorForPercentChange(percentChange);
}