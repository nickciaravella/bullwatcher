import * as React from 'react';
import * as styles from 'src/styles';

import { IStockCurrentPrice } from 'src/models/stock-current';
import { calculatePercentChange, currencyString, percentageString, textColorForStockPriceChange } from 'src/utils'

export interface IStockCurrentPriceProps {
    currentPrice: IStockCurrentPrice;
}

// export interface IStockCurrentPriceState {
// }

export default class StockCurrentPrice extends React.Component<IStockCurrentPriceProps> {

    constructor(props: any) {
        super(props);
    }

    // public componentDidUpdate (prevProps: IStockCurrentPriceProps) {
    //     if (this.props.ticker !== prevProps.ticker) {
    //         this.loadStockCurrentPrice();
    //     }
    // }

    public render() {
        const { currentPrice } = this.props;
        const todaysChange = currentPrice.currentPrice - currentPrice.lastClose;
        const todaysPercentChange = todaysChange / currentPrice.currentPrice * 100;

        const showAfterHours: boolean = currentPrice.afterHoursDateTime &&
            currentPrice.afterHoursPrice &&
            currentPrice.afterHoursDateTime > currentPrice.currentPriceDateTime &&
            currentPrice.afterHoursPrice !== currentPrice.currentPrice

        let afterHoursPrice: string = null;
        let afterHoursPercentChange: string = null;
        let afterHoursTextColor: string = null;
        if (showAfterHours) {
            afterHoursPrice = currencyString(currentPrice.afterHoursPrice)
            afterHoursPercentChange = percentageString(
                calculatePercentChange(currentPrice.afterHoursPrice, currentPrice.currentPrice)
            )
            afterHoursTextColor = textColorForStockPriceChange(currentPrice.afterHoursPrice, currentPrice.currentPrice);
        }

        const textColor = textColorForStockPriceChange(currentPrice.currentPrice, currentPrice.lastClose);
        const options: Intl.DateTimeFormatOptions = {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            month: "short",
        }
        return (
            <div className={textColor}>
                <span className="text-25 pr-3">{currencyString(currentPrice.currentPrice)}</span>
                <span className="text-15">({percentageString(todaysPercentChange)})</span>
                {
                    showAfterHours &&
                    <div className={styles.classNames(styles.textSize125, styles.textRight, styles.textColorSecondary)}>
                        <span>{"After hours: "}</span>
                        <span className={afterHoursTextColor}> {afterHoursPrice} ({afterHoursPercentChange})</span>
                    </div>
                }
                {
                    !showAfterHours &&
                    <div className={styles.classNames(styles.textSize125, styles.textColorSecondary, styles.textRight)}>
                        <span>{"Last updated: "}</span>
                        <span>{currentPrice.currentPriceDateTime.toLocaleString("en-us", options)}</span>
                    </div>
                }
            </div>
        );
    }
}