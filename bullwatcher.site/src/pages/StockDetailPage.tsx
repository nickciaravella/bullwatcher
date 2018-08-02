import { observer } from 'mobx-react';
import * as React from 'react';

import { IChartSettings } from 'src/models/chart-settings'
import { INews } from 'src/models/news';
import { IStockMetadata, StockMetadataStore } from 'src/models/stock-metadata';
import StockChart from 'src/StockChart';
import { Iex } from '../services/iex';


interface IStockDetailPageProps {
    ticker: string;
    chartSettings: IChartSettings;
    stockMetadataStore: StockMetadataStore
}

interface IStockDetailPageState {
    ticker: string;
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
            this.state = {
            news: [],
            ticker: this.props.ticker,
        };
            this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
            this._loadNews();
        }
      }

    public render() {
        const stockMetadata: IStockMetadata = this.props.stockMetadataStore.stockMetadatas.get(this.props.ticker);
        return (
            <div>
                {   stockMetadata &&
                    <h1>{stockMetadata.companyName}</h1>
                }
                {   stockMetadata &&
                    <h3>{stockMetadata.sector}</h3>
                }
                <StockChart ticker={this.state.ticker} settings={this.props.chartSettings} />
                {
                    this._renderNewsSection()
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

    private _setupPropsAndState() {
        this.state = {
            news: [],
            ticker: this.props.ticker,
        };

        this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
        this._loadNews();
    }

    private _loadNews() {
        new Iex().getNews(this.state.ticker).then((news: INews[]) => {
            this.setState((prevState: IStockDetailPageState) => {
                return {
                    news,
                    ticker: prevState.ticker,
                }
            })
        })
    }
}
