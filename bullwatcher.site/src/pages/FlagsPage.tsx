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
    userVotes?: IUserPatternVote[]
}

export default class FlagsPage extends React.Component<IFlagsPageProps, IFlagsPageState> {

    constructor(props: IFlagsPageProps) {
        super(props);
        this.state = {
            patternList: null
        }

        this._loadFlags();
    }

    public render() {
        return (
            <div>
                <h1>Flags</h1>
                { this.state.patternList && this._renderDate(this.state.patternList.date) }
                <hr />
                { this.state.patternList && this._renderStocksList(this.state.patternList.patternStocks) }
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

        return stocks.map((stock: IPatternStock) => (
            <div key={stock.stockMetadata.ticker} style={{paddingBottom: '50px'}}>
                <h2>{stock.stockMetadata.companyName}</h2>
                <h3>({stock.stockMetadata.ticker})</h3>
                <p>{stock.votes}</p>
                { stock.stockMetadata.ticker in votesByTicker && <p>You voted: {votesByTicker[stock.stockMetadata.ticker]} </p>}
                <button>+</button>
                <button>-</button>
                <StockChart ticker={stock.stockMetadata.ticker} settings={this.props.chartSettings} />
            </div>
        ));
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
}
