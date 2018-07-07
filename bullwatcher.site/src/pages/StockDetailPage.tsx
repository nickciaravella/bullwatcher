import { observer } from 'mobx-react';
import * as React from 'react';

import { IChartSettings } from '../models/chart-settings'
import { IStockMetadata, StockMetadataStore } from '../models/stock-metadata';
import StockChart from '../StockChart';


interface IStockDetailPageProps {
    ticker: string;
    chartSettings: IChartSettings;
    stockMetadataStore: StockMetadataStore
}

interface IStockDetailPageState {
    ticker: string;
}

@observer
export default class StockDetailPage extends React.Component<IStockDetailPageProps, IStockDetailPageState> {


    constructor(props: IStockDetailPageProps) {
        super(props);
        this.state = {ticker: this.props.ticker};
        this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
    }

    public componentDidUpdate (prevProps: IStockDetailPageProps) {
        if (prevProps.ticker !== this.props.ticker) {
            this.setState({ticker: this.props.ticker });
            this.props.stockMetadataStore.fetchDailyDataAsync(this.props.ticker);
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
            </div>
        );
    }
}
