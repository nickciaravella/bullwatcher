import * as React from 'react';
import { IStockCurrentPrice } from 'src/models/stock-current';

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

        const formatter = Intl.NumberFormat('en-us', {
            currency: 'USD',
            minimumFractionDigits: 2,
            style: 'currency',
        });

        const todaysChange = Math.round((currentPrice.currentPrice - currentPrice.lastClose) * 100) / 100
        const todaysPercentChange = Math.round(todaysChange/currentPrice.currentPrice * 10000) / 100
        return (
            <div>
                <p>Current Price: {formatter.format(currentPrice.currentPrice)} </p>
                <p>Current Price Updated: {currentPrice.currentPriceDateTime.toLocaleString()}</p>
                <p>Todays Change: {todaysPercentChange.toFixed(2)}%  ( {formatter.format(todaysChange)} )</p>
            </div>
        );
    }
}