import * as React from 'react'

import { IStockCurrentPrice } from 'src/models/stock-current';
import { IStockMetadata } from 'src/models/stock-metadata';
import { currencyString, numberWithIllions } from 'src/utils'


interface IStockStatsProps {
    stockMetadata: IStockMetadata;
    currentPrice: IStockCurrentPrice;
}

export default class StockStats extends React.Component<IStockStatsProps, any> {
    constructor(props: IStockStatsProps) {
        super(props);
    }

    public render() {
        const { currentPrice, stockMetadata } = this.props;
        return (
            <table className="table border">
                <tbody>
                    <tr>
                        <td className="text-right">Market Cap</td>
                        <td className="text-left">{ numberWithIllions(stockMetadata.marketCap) }</td>
                    </tr>
                    <tr>
                        <td className="text-right">Volume</td>
                        <td className="text-left">{ numberWithIllions(currentPrice.volume) }</td>
                    </tr>
                    <tr>
                        <td className="text-right">Open</td>
                        <td className="text-left">{ currencyString(currentPrice.open) }</td>
                    </tr>
                    <tr>
                        <td className="text-right">High</td>
                        <td className="text-left">{ currencyString(currentPrice.high) }</td>
                    </tr>
                    <tr>
                        <td className="text-right">Low</td>
                        <td className="text-left">{ currencyString(currentPrice.low) }</td>
                    </tr>
                </tbody>
            </table>
        )
    }

}