import * as React from 'react';
import { IStockCurrentPrice } from 'src/models/stock-current';
import { BullWatcher } from 'src/services/bullwatcher'


export interface IStockCurrentPriceProps {
    ticker: string;
}

export interface IStockCurrentPriceState {
    currentPrice?: IStockCurrentPrice;
}

export default class StockCurrentPrice extends React.Component<IStockCurrentPriceProps, IStockCurrentPriceState> {

    private bullwatcherService: BullWatcher;

    constructor(props: any) {
        super(props);

        this.state = {
            currentPrice: null
        }

        this.bullwatcherService = new BullWatcher();
        this.loadStockCurrentPrice();
    }

    public componentDidUpdate (prevProps: IStockCurrentPriceProps) {
        if (this.props.ticker !== prevProps.ticker) {
            this.loadStockCurrentPrice();
        }
    }

    public render() {
        const { currentPrice } = this.state;

        if (!currentPrice) {
            return null;
        }

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

    private async loadStockCurrentPrice(): Promise<void> {
        const { ticker } = this.props;
        const currentPrice: IStockCurrentPrice = await this.bullwatcherService.getStockCurrentPrice(ticker);
        this.setState({
            currentPrice
        });
    }
}