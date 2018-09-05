import { observer } from 'mobx-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { IChartSettings } from 'src/models/chart-settings'
import { TimeWindow } from 'src/models/common';
import { IStockRanking } from 'src/models/stock-rankings';
import { BullWatcher } from 'src/services/bullwatcher';
import StockChart from 'src/StockChart';
import { percentageString } from 'src/utils'

interface IRankingsPageProps {
    chartSettings: IChartSettings;
}

interface IRankingsPageState {
    startIndex: number;
    pageSize: number;
    minimumMarketCapFilter: number;
    rankings: IStockRanking[];
    sectorsFilter: string[];
    timeWindow: TimeWindow;
}

@observer
export default class RankingsPage extends React.Component<IRankingsPageProps, IRankingsPageState> {

    private bullwatcherService: BullWatcher;

    constructor(props: IRankingsPageProps) {
        super(props);
        this.bullwatcherService = new BullWatcher();
        this.state = {
            minimumMarketCapFilter: 0,
            pageSize: 10,
            rankings: [],
            sectorsFilter: [],
            startIndex: 0,
            timeWindow: "2y" as TimeWindow,
        }
        this.loadRankings()
    }

    public render() {
        const totalStocks = this.state.rankings ? this.state.rankings.length : 0;
        const showNext = totalStocks > this.state.startIndex + this.state.pageSize;
        const showPrevious = this.state.startIndex !== 0;
        return (
            <div>
                {this.renderFilters()}
                {this.renderStockCharts()}
                { this.state.rankings.length > 0 && <p>Showing stocks {this.state.startIndex + 1}-{Math.min(this.state.startIndex + this.state.pageSize, totalStocks)} of {totalStocks}</p> }
                { showPrevious && <button onClick={this.previousPage}>Previous</button> }
                { showNext && <button onClick={this.nextPage}>Next</button> }
            </div>
        )
    }

    private renderFilters() {
        return (
            <div>
                <form>
                <label>Time Window</label>
                    <select value={this.state.timeWindow} onChange={this.handleTimeWindowChanged}>
                        <option value={"2w"}>2 weeks</option>
                        <option value={"1m"}>1 month</option>
                        <option value={"3m"}>3 months</option>
                        <option value={"6m"}>6 months</option>
                        <option value={"1y"}>1 year</option>
                        <option value={"2y"}>2 years</option>
                    </select>
                    <label>Minimum Market Cap</label>
                    <select value={this.state.minimumMarketCapFilter} onChange={this.handleMinimumMarketCapFilterChanged}>
                        <option value={0}>None</option>
                        <option value={1000000000}>1 billion</option>
                        <option value={10000000000}>10 billion</option>
                        <option value={50000000000}>50 million</option>
                        <option value={100000000000}>100 billion</option>
                        <option value={500000000000}>500 billion</option>
                    </select>
                </form>
            </div>
        );
    }

    private renderStockCharts() {
        const stockCharts: JSX.Element[] = []
        for (let i = this.state.startIndex; i < this.state.startIndex + this.state.pageSize; ++i) {
            if (i >= this.state.rankings.length) {
                break;
            }
            const ranking = this.state.rankings[i];
            stockCharts.push((
                <div key={ranking.ticker}>
                    <ul>
                        <li><Link to={`stocks/${ranking.ticker}`} target="_blank">{ranking.ticker}</Link></li>
                        <li>Rank: {ranking.rank}</li>
                        <li>Percent change: {percentageString(ranking.value)}</li>
                    </ul>
                    <StockChart ticker={ranking.ticker} settings={this.props.chartSettings} />
                </div>
            ))
        }
        return stockCharts;
    }

    private handleMinimumMarketCapFilterChanged = (event: React.FormEvent<HTMLSelectElement>) => {
        const newMinimum: number = +event.currentTarget.value;
        this.setState((prevState) => {
            return {
                minimumMarketCapFilter: newMinimum,
                pageSize: prevState.pageSize,
                rankings: prevState.rankings,
                sectorsFilter: prevState.sectorsFilter,
                startIndex: prevState.startIndex,
                timeWindow: prevState.timeWindow
            }
        }, this.loadRankings);
    }

    private handleTimeWindowChanged = (event: React.FormEvent<HTMLSelectElement>) => {
        const newTimeWindow: TimeWindow = event.currentTarget.value as TimeWindow;
        this.setState((prevState) => {
            return {
                minimumMarketCapFilter: prevState.minimumMarketCapFilter,
                pageSize: prevState.pageSize,
                rankings: prevState.rankings,
                sectorsFilter: prevState.sectorsFilter,
                startIndex: prevState.startIndex,
                timeWindow: newTimeWindow
            }
        }, this.loadRankings);
    }

    private loadRankings = async () => {
        const rankings: IStockRanking[] = await this.bullwatcherService.getStockRankings(
            this.state.timeWindow,
            this.state.minimumMarketCapFilter);

        this.setState((prevState) => {
            return {
                minimumMarketCapFilter: prevState.minimumMarketCapFilter,
                pageSize: prevState.pageSize,
                rankings,
                sectorsFilter: prevState.sectorsFilter,
                startIndex: prevState.startIndex,
                timeWindow: prevState.timeWindow
            }
        });
    }

    private previousPage = () => {
        this.setState((prevState: IRankingsPageState) => {
            const newState: IRankingsPageState = JSON.parse(JSON.stringify(prevState));
            newState.startIndex = Math.max(0, prevState.startIndex - prevState.pageSize);
            return newState;
        });
        window.scrollTo(0,0);
    }

    private nextPage = () => {
        this.setState((prevState: IRankingsPageState) => {
            const newState: IRankingsPageState = JSON.parse(JSON.stringify(prevState));
            newState.startIndex = prevState.startIndex + prevState.pageSize;
            return newState;
        });
        window.scrollTo(0,0);
    }
}
