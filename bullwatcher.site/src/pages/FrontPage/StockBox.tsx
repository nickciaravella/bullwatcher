import * as React from 'react';
import * as styles from 'src/styles'

import { IStockCurrentPrice } from 'src/models/stock-current';
import { StockCurrentPriceStore } from 'src/models/stock-current-store';
import downArrow from 'src/resources/down_arrow.png';
import {
    bgColorForStockPriceChange,
    calculatePercentChange,
    currencyString,
     percentageString } from 'src/utils';

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
            <div className={styles.classNames("card d-flex flex-column justify-content-end h-100 w-100 text-left", styles.textColorPrimary, bgColor)}
                 style={{backgroundImage: `url(${downArrow})`, backgroundRepeat: "no-repeat", backgroundPosition: "right", backgroundSize: "contain", backgroundBlendMode: "lighten", backgroundColor: bgColor}}>
                <p className="text-2 ml-4 mt-5 mb-0">{ticker}</p>
                {
                    stockName &&
                    <p className="ml-4 mb-4">{stockName.toUpperCase()}</p>
                }
                {
                    currentPrice &&
                    <div>
                        <p className="text-2 ml-4 mb-0">{currencyString(currentPrice.currentPrice)}</p>
                        <p className="ml-4 mb-4">
                            {percentChange} ({dollarChange})
                        </p>
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