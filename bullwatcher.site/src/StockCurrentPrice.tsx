import * as React from 'react';
import { IStockCurrentPrice } from 'src/models/stock-current';
import { currencyString, percentageString} from 'src/utils'

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
        return (
            <div>
                <p>Current Price: {currencyString(currentPrice.currentPrice)} </p>
                <p>Current Price Updated: {currentPrice.currentPriceDateTime.toLocaleString()}</p>
                <p>Todays Change: {percentageString(todaysPercentChange)}  ( {currencyString(todaysChange)} )</p>
            </div>
        );
    }
}