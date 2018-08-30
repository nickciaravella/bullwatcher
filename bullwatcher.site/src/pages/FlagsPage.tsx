import * as React from 'react';
import { AuthContextStore } from 'src/models/auth-store';
import { IChartSettings } from 'src/models/chart-settings'
import { IDailyPatternList, IPatternStock, IUserPatternVote } from 'src/models/stock-patterns';
import { BullWatcher } from 'src/services/bullwatcher';
import StockChart from 'src/StockChart';

interface IFlagsPageProps {
    authContextStore: AuthContextStore;
    chartSettings: IChartSettings;
    date?: string;
}

interface IFlagsPageState {
    patternList?: IDailyPatternList,
    userVotes?: IUserPatternVote[],
    startIndex: number,
    pageSize: number,
}

export default class FlagsPage extends React.Component<IFlagsPageProps, IFlagsPageState> {

    constructor(props: IFlagsPageProps) {
        super(props);
        this.state = {
            pageSize: 10,
            patternList: null,
            startIndex: 0
        }

        this._loadFlags();
    }

    public render() {
        const totalStocks = this.state.patternList ? this.state.patternList.patternStocks.length : 0;
        const showNext = totalStocks > this.state.startIndex + this.state.pageSize;
        const showPrevious = this.state.startIndex !== 0;
        return (
            <div>
                <h1>Flags</h1>
                { this.state.patternList && this._renderDate(this.state.patternList.date) }
                <hr />
                { this.state.patternList && this._renderStocksList(this.state.patternList.patternStocks.slice(this.state.startIndex, this.state.startIndex + this.state.pageSize)) }
                { this.state.patternList && <p>Showing flags {this.state.startIndex + 1}-{Math.min(this.state.startIndex + this.state.pageSize, totalStocks)} of {totalStocks}</p> }
                { showPrevious && <button onClick={this.previousPage}>Previous</button> }
                { showNext && <button onClick={this.nextPage}>Next</button> }
            </div>
        );
    }

    private _renderDate(date?: Date) {
        if (date) {
            // toLocaleDateString will assume the date is in UTC. It is not since its user provided.
            const adjustedDate: Date = new Date(date.getTime() + date.getTimezoneOffset()*60000);
            return (<h2>{adjustedDate.toLocaleDateString()}</h2>);
        } else {
            return null;
        }
    }

    private _renderStocksList(stocks: IPatternStock[]) {
        if (stocks.length === 0) {
            return (
                <p>We didn't find any flags :(</p>
            );
        }

        const votesByTicker: any = {}
        for (const vote of this.state.userVotes) {
            votesByTicker[vote.ticker] = vote.value;
        }

        const divs = [];
        for (const stock of stocks) {
            const upVote = () => this.voteClicked(stock.stockMetadata.ticker, 1, votesByTicker[stock.stockMetadata.ticker]);
            const downVote = () => this.voteClicked(stock.stockMetadata.ticker, -1, votesByTicker[stock.stockMetadata.ticker]);
            divs.push((
                <div key={stock.stockMetadata.ticker} style={{paddingBottom: '50px'}}>
                    <h2>{stock.stockMetadata.companyName}</h2>
                    <h3>({stock.stockMetadata.ticker})</h3>
                    <p>{stock.votes}</p>
                    { stock.stockMetadata.ticker in votesByTicker && <p>You voted: {votesByTicker[stock.stockMetadata.ticker]} </p>}
                    <button onClick={upVote}>+</button>
                    <button onClick={downVote}>-</button>
                    <StockChart ticker={stock.stockMetadata.ticker} settings={this.props.chartSettings} />
                </div>
            ))
        }
        return divs;
    }

    private async _loadFlags() {
        const service = new BullWatcher();

        const patternList = await service.getPatterns(this.props.date);

        let userVotes: IUserPatternVote[] = null;
        if (this.props.authContextStore.userContext !== null) {
            userVotes = await service.getUserPatternVotes(this.props.authContextStore.userContext.userId, patternList.date);
        }

        this.setState({
            patternList,
            userVotes
        })
    }

    private async voteClicked(ticker: string, value: number, currentVote?: number) {
        if (this.props.authContextStore.userContext === null) {
            // In the future, advertise for login
            return;
        }
        if (this.state.patternList === null) {
            return;
        }

        await new BullWatcher().voteOnPattern(
            this.props.authContextStore.userContext.userId,
            this.state.patternList.date,
            ticker,
            currentVote === value ? 0 : value
        );

        await this._loadFlags()
    }

    private previousPage = () => {
        this.setState((prevState) => { return {
            pageSize: prevState.pageSize,
            patternList: prevState.patternList,
            startIndex: Math.max(0, prevState.startIndex - prevState.pageSize),
            userVotes: prevState.userVotes,
        }})
        window.scrollTo(0,0);
    }

    private nextPage = () => {
        this.setState((prevState) => { return {
            pageSize: prevState.pageSize,
            patternList: prevState.patternList,
            startIndex: prevState.startIndex + prevState.pageSize,
            userVotes: prevState.userVotes,
        }})
        window.scrollTo(0,0);
    }
}
