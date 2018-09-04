import { observer } from 'mobx-react';
import * as React from 'react';

import { IChartSettings } from 'src/models/chart-settings'
import { INews } from 'src/models/news';
import { IStockMetadata, StockMetadataStore } from 'src/models/stock-metadata';
import { Iex } from 'src/services/iex';
import StockChart from 'src/StockChart';
import StockCurrentPrice from 'src/StockCurrentPrice';
import { IStockCurrentPrice } from '../../models/stock-current';
import { BullWatcher } from '../../services/bullwatcher';


interface IStockDetailPageProps {
    ticker: string;
    chartSettings: IChartSettings;
    stockMetadataStore: StockMetadataStore
}

interface IStockDetailPageState {
    ticker: string;
    price?: IStockCurrentPrice;
    news: INews[]
}

@observer
export default class StockDetailPage extends React.Component<IStockDetailPageProps, IStockDetailPageState> {


    constructor(props: IStockDetailPageProps) {
        super(props);
        this._setupPropsAndState();
    }

    public componentDidUpdate (prevProps: IStockDetailPageProps) {
        if (prevProps.ticker !== this.props.ticker) {
            this._setupPropsAndState();
        };
      }

    public render() {
        const { price } = this.state;
        const stockMetadata: IStockMetadata = this.props.stockMetadataStore.stockMetadatas.get(this.props.ticker);
        return (
            <div>
                {   stockMetadata &&
                    <h1>{stockMetadata.companyName}</h1>
                }
                {   stockMetadata &&
                    <h3>{stockMetadata.sector}</h3>
                }
                {
                    this.state.price && stockMetadata &&
                    <div>
                        <StockCurrentPrice currentPrice={this.state.price} />
                        <StockChart ticker={this.state.ticker} settings={this.props.chartSettings} />
                        <ul>
                            <li>Market Cap: {stockMetadata.marketCap}</li>
                            <li>Volume: {price.volume}</li>
                            <li>Open: {price.open}</li>
                            <li>High: {price.high}</li>
                            <li>Low: {price.low}</li>
                        </ul>
                        <table>
                            <tr>
                                <th/>
                                <th>1 week</th>
                                <th>1 month</th>
                                <th>3 months</th>
                                <th>1 year</th>
                                <th>3 years</th>
                            </tr>
                            <tr>
                                <td>{this.state.ticker}</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                            </tr>
                            <tr>
                                <td>Sector</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                            </tr>
                        </table>
                    {
                        this._renderNewsSection()
                    }
                </div>
            }
            </div>
        );
    }

    private _renderNewsSection() {
        if (this.state.news.length === 0) {
            return null;
        }
        return (
            <div>
                <h1>News</h1>
                { this._renderNewsArticles() }
            </div>
        )
    }

    private _renderNewsArticles() {
        return this.state.news.map((article: INews) =>
            (
                <div>
                    <a href={article.url} target='_blank'>{article.headline}</a>
                    <p>{article.source} | {article.date.toLocaleString()}</p>
                </div>
            )
        );
    }

    private async _setupPropsAndState() {
        this.state = {
            news: [],
            ticker: this.props.ticker,
        };

        this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
        const price: IStockCurrentPrice = await new BullWatcher().getStockCurrentPrice(this.state.ticker);
        const news: INews[] = await new Iex().getNews(this.state.ticker);
        this.setState((prevState: IStockDetailPageState) => { return {
            news,
            price,
            ticker: this.props.ticker
        }})
    }
}
