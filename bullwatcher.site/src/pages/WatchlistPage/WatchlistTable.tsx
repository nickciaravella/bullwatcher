import * as React from "react";
import { Link } from "react-router-dom";

import { IWatchlistItemInfo } from "src/pages/WatchlistPage/models";
import { calculatePercentChange, currencyString, percentageString } from "src/utils"

interface IWatchlistTableProps {
    deleteItemFunc: (ticker: string) => void;
    watchlistItems: IWatchlistItemInfo[];
}

export default class WatchlistTable extends React.Component<IWatchlistTableProps, any> {

    public render() {
        const { deleteItemFunc, watchlistItems } = this.props;
        if (watchlistItems.length === 0) {
            return null;
        }

        const tableRows: JSX.Element[] = [];
        for (const info of watchlistItems) {
            const ticker: string = info.item.stockMetadata.ticker;
            const deleteCallback = () => deleteItemFunc(info.item.stockMetadata.ticker);
            tableRows.push((
                <tr>
                    <td><Link to={`/stocks/${ticker}`} target="_blank">{ticker}</Link></td>
                    <td>{info.item.stockMetadata.companyName}</td>
                    <td>{currencyString(info.price.currentPrice)}</td>
                    <td>{percentageString(calculatePercentChange(info.price.currentPrice, info.price.lastClose))}</td>
                    <td><button onClick={deleteCallback}>Remove</button></td>
                </tr>
            ))
        }

        return (
            <div>
                <table>
                    <tr>
                        <th>Symbol</th>
                        <th>Company</th>
                        <th>Price</th>
                        <th>Percent Change</th>
                    </tr>
                    { tableRows }
                </table>
            </div>
        );
    }
}
