import * as React from 'react';
import StockChart from '../StockChart';

interface IStockDetailPageProps {
    match: {params: {id: string}};
}

interface IStockDetailPageState {
    ticker: string;
}

export default class App extends React.Component<IStockDetailPageProps, IStockDetailPageState> {

    constructor(props: {match: any}) {
        super(props);
        this.state = {ticker: props.match.params.id};
    }

    public componentDidUpdate (prevProps: {match:any}) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.setState({ticker: this.props.match.params.id });
        }
      }

    public render() {
        return (
            <div className="App">
               <div style={{ margin: '100px' }}>
                   <StockChart ticker={this.state.ticker} />
                </div>
            </div>
        );
    }
}
