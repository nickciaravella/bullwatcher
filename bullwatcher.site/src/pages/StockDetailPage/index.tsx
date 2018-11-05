import { observer } from 'mobx-react';
import * as React from 'react';
import * as styles from 'src/styles';

import StockStats from './StockStats';

import ChartSettingsPicker from 'src/ChartSettingsPicker'
import NewsList from 'src/components/NewsList';
import { ChartSettingsStore } from 'src/models/chart-settings'
import { INews } from 'src/models/news';
import { ISectorPerformance } from 'src/models/sectors';
import { IStockCurrentPrice } from 'src/models/stock-current';
import { IStockMetadata, StockMetadataStore } from 'src/models/stock-metadata';
import { IStockRanking } from 'src/models/stock-rankings';
import { BullWatcher } from 'src/services/bullwatcher';
import StockChart from 'src/StockChart';
import StockCurrentPrice from 'src/StockCurrentPrice';
import StockSectorComparison from './StockSectorComparison';

interface IStockDetailPageProps {
    ticker: string;
    chartSettingsStore: ChartSettingsStore;
    stockMetadataStore: StockMetadataStore;
}

interface IStockDetailPageState {
    sectorPerformances: ISectorPerformance[];
    price?: IStockCurrentPrice;
    rankings: IStockRanking[];
    news: INews[];
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
        const { chartSettingsStore, stockMetadataStore, ticker } = this.props;
        const { price, rankings, sectorPerformances } = this.state;
        const stockMetadata: IStockMetadata = stockMetadataStore.stockMetadatas.get(ticker);

        const companyName: string = stockMetadata ? stockMetadata.companyName : "";
        const sectorName: string = stockMetadata && stockMetadata.sector !== "Unknown" ? `(${stockMetadata.sector})` : "";
        return (
            <div className="pt-3">
                <div className="d-flex flex-row justify-content-between align-items-end">
                    <div className="d-flex flex-column pb-1">
                        <div>
                            <span className="text-25 pr-3">{ticker.toUpperCase()}</span>
                            <span className={styles.classNames("text-15", styles.textColorSecondary)}>{sectorName}</span>
                            <div>
                                <span className="text-color-sec text-125">{companyName}</span>
                            </div>
                        </div>
                    </div>
                    { price &&
                        <div>
                            <StockCurrentPrice currentPrice={price} />
                        </div>
                    }
                </div>
                {
                    this.state.price && stockMetadata &&
                    <div>
                        <StockChart ticker={ticker} settings={chartSettingsStore.chartSettings} />
                        <div className="pt-3">
                            <ChartSettingsPicker chartSettingsStore={chartSettingsStore} />
                        </div>
                        <div className="d-flex flex-row justify-content-between">
                            <div className="w-50 mr-5 mt-5">
                                <h4 className="text-left">Price Details</h4>
                                <StockStats stockMetadata={stockMetadata} currentPrice={price} />
                            </div>
                            { rankings.length > 0 && sectorPerformances.length > 0 &&
                                <div className="w-50 mr-5 mt-5">
                                    <h4 className="text-left">Sector Comparison</h4>
                                    <StockSectorComparison stockMetadata={stockMetadata}
                                                           rankings={rankings}
                                                           sectorPerformances={sectorPerformances} />
                                </div>
                            }
                        </div>
                    <div>
                        <NewsList ticker={this.props.ticker} />
                    </div>
                </div>
            }
            </div>
        );
    }

    private async _setupPropsAndState() {
        this.state = {
            news: [],
            rankings: [],
            sectorPerformances: [],
        };

        this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
        const price: IStockCurrentPrice = await new BullWatcher().getStockCurrentPrice(this.props.ticker);
        const news: INews[] = await new BullWatcher().getNews(this.props.ticker);
        const rankings: IStockRanking[] = await new BullWatcher().getSingleStockRankings(this.props.ticker);
        const sectorPerformances: ISectorPerformance[] = await new BullWatcher().getSectorPerformances();
        this.setState((prevState: IStockDetailPageState) => { return {
            news,
            price,
            rankings,
            sectorPerformances,
            ticker: this.props.ticker
        }})
    }
}
