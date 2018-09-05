import { observer } from 'mobx-react';
import * as React from 'react';

import { IChartSettings } from 'src/models/chart-settings'
import { TimeWindow } from 'src/models/common';
import { INews } from 'src/models/news';
import { IStockCurrentPrice } from 'src/models/stock-current';
import { IStockMetadata, StockMetadataStore } from 'src/models/stock-metadata';
import { IStockRanking } from 'src/models/stock-rankings';
import { BullWatcher } from 'src/services/bullwatcher';
import { Iex } from 'src/services/iex';
import StockChart from 'src/StockChart';
import StockCurrentPrice from 'src/StockCurrentPrice';
import { currencyString, numberWithIllions, percentageString } from 'src/utils'


interface IStockDetailPageProps {
    ticker: string;
    chartSettings: IChartSettings;
    stockMetadataStore: StockMetadataStore
}

interface IStockDetailPageState {
    ticker: string;
    price?: IStockCurrentPrice;
    rankings: IStockRanking[];
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
                            <li>Market Cap: {numberWithIllions(stockMetadata.marketCap)}</li>
                            <li>Volume: {numberWithIllions(price.volume)}</li>
                            <li>Open: {currencyString(price.open)}</li>
                            <li>High: {currencyString(price.high)}</li>
                            <li>Low: {currencyString(price.low)}</li>
                        </ul>
                        { this.state.rankings.length > 0 &&
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
                                    <td>{stockMetadata.companyName}</td>
                                    <td>{this.getRankingForTimeWindow(TimeWindow.ONE_WEEK)}</td>
                                    <td>{this.getRankingForTimeWindow(TimeWindow.ONE_MONTH)}</td>
                                    <td>{this.getRankingForTimeWindow(TimeWindow.THREE_MONTHS)}</td>
                                    <td>{this.getRankingForTimeWindow(TimeWindow.ONE_YEAR)}</td>
                                    <td>{this.getRankingForTimeWindow(TimeWindow.THREE_YEARS)}</td>
                                </tr>
                                <tr>
                                    <td>{stockMetadata.sector}</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                </tr>
                            </table>
                        }
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
            rankings: [],
            ticker: this.props.ticker,
        };

        this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
        const price: IStockCurrentPrice = await new BullWatcher().getStockCurrentPrice(this.state.ticker);
        const news: INews[] = await new Iex().getNews(this.state.ticker);
        const rankings: IStockRanking[] = await new BullWatcher().getSingleStockRankings(this.state.ticker);
        this.setState((prevState: IStockDetailPageState) => { return {
            news,
            price,
            rankings,
            ticker: this.props.ticker
        }})
    }

    private getRankingForTimeWindow(timeWindow: TimeWindow): string {
        const ranking = this.state.rankings.find(r => r.timeWindow === timeWindow);
        if (!ranking) {
            return '--';
        }
        return percentageString(ranking.value);
    }
}
