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

        let textColor = "";
        if (todaysChange > 0) {
            textColor = "text-success";
        } else if (todaysChange < 0) {
            textColor = "text-danger";
        }

        return (
            <div className={textColor}>
                <span className="text-25 pr-3">{currencyString(currentPrice.currentPrice)}</span>
                {/* <p>Current Price Updated: {currentPrice.currentPriceDateTime.toLocaleString()}</p> */}
                <span className="text-15">{percentageString(todaysPercentChange)}  ({currencyString(todaysChange)})</span>
            </div>
        );
    }
}