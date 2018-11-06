import * as React from 'react';
import * as styles from 'src/styles';

import { IStockCurrentPrice } from 'src/models/stock-current';
import { IStockMetadata, marketCapCategory } from 'src/models/stock-metadata';
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
            <table className={styles.classNames(styles.table, styles.border, styles.bgColorChart)}>
                <tbody>
                    <tr>
                        <td className={styles.textRight}>Market Cap</td>
                        <td className={styles.textLeft}>{ marketCapCategory(stockMetadata.marketCap) } ({numberWithIllions(stockMetadata.marketCap)})</td>
                    </tr>
                    <tr>
                        <td className={styles.textRight}>Volume</td>
                        <td className={styles.textLeft}>{ numberWithIllions(currentPrice.volume) }</td>
                    </tr>
                    <tr>
                        <td className={styles.textRight}>Open</td>
                        <td className={styles.textLeft}>{ currencyString(currentPrice.open) }</td>
                    </tr>
                    <tr>
                        <td className={styles.textRight}>High</td>
                        <td className={styles.textLeft}>{ currencyString(currentPrice.high) }</td>
                    </tr>
                    <tr>
                        <td className={styles.textRight}>Low</td>
                        <td className={styles.textLeft}>{ currencyString(currentPrice.low) }</td>
                    </tr>
                </tbody>
            </table>
        )
    }

}