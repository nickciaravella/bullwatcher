import * as React from 'react';
import * as styles from 'src/styles'

import { IStockCurrentPrice } from 'src/models/stock-current';
import { StockCurrentPriceStore } from 'src/models/stock-current-store';
import {
    bgColorForStockPriceChange,
    calculatePercentChange,
    currencyString,
     percentageString } from 'src/utils'

interface IStockBoxProps {
    ticker: string;
    stockName?: string;
    stockCurrentPriceStore: StockCurrentPriceStore
}

interface IStockBoxState {
    currentPrice?: IStockCurrentPrice;
}

export default class StockBox extends React.Component<IStockBoxProps, IStockBoxState> {
    public constructor(props: IStockBoxProps) {
        super(props);
        this.state = {
            currentPrice: null
        }
        this.loadCurrentPrice();
    }

    public render() {
        const { ticker, stockName } = this.props;
        const { currentPrice } = this.state;

        let bgColor: string = styles.bgColorPrimary;
        let percentChange: string = ""
        let dollarChange: string = ""
        if (currentPrice) {
            bgColor = bgColorForStockPriceChange(currentPrice.lastClose, currentPrice.currentPrice);
            const percent: number = calculatePercentChange(currentPrice.currentPrice, currentPrice.lastClose)
            percentChange = percentageString(percent);
            dollarChange = currencyString(currentPrice.currentPrice - currentPrice.lastClose);
        }

        return (
            <a href={`stocks/${ticker}`} style={{textDecoration: "none"}}>
            <div className={styles.classNames("card d-flex flex-column h-100 w-100 text-left border", styles.textColorPrimary, bgColor)}>
                <h1 className="ml-5 mt-5 mb-3">{ticker}</h1>
                {
                    stockName &&
                    <h5 className="ml-5 mb-5">{stockName}</h5>
                }
                {
                    currentPrice &&
                    <div>
                        <h3 className="ml-5">{currencyString(currentPrice.currentPrice)}</h3>
                        <h3 className="ml-5">
                            {percentChange} ({dollarChange})
                        </h3>
                    </div>
                }
            </div>
            </a>
        )
    }

    private async loadCurrentPrice() {
        const { stockCurrentPriceStore, ticker } = this.props;
        const price = await stockCurrentPriceStore.getStockCurrentPrice(ticker);
        this.setState({
            currentPrice: price
        })
    }
}