import * as React from 'react';

import { IStockMetadata } from 'src/models/stock-metadata';
import { BullWatcher } from 'src/services/bullwatcher';

interface ISearchBoxProps {
    onSearchFunc: (ticker: string) => void;
}

interface ISearchBoxState {
    query: string,
    suggestions: IStockMetadata[]
}

export default class SearchBox extends React.Component<ISearchBoxProps, ISearchBoxState> {
    private searchBox: HTMLInputElement = null;

    constructor(props: ISearchBoxProps) {
        super(props);

        this.state = {
            query: '',
            suggestions: []
        };
    }

     public render() {
        const { suggestions } = this.state;
        const suggestionsList = [];
        for (const stockMetadata of suggestions) {
            const action = () => this.handleSuggestionClicked(stockMetadata.ticker);
            suggestionsList.push((
                <button type="button" className="list-group-item list-group-item-action" onClick={action}>{stockMetadata.companyName} ({stockMetadata.ticker})</button>
            ))
        }
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input
                        ref={el => this.searchBox = el}
                        placeholder="Enter ticker"
                        onChange={this.handleInputChange}
                    />
                    <ul className="list-group position-absolute text-left" style={{ zIndex: 100}}>
                        {suggestionsList}
                    </ul>
                </form>
            </div>
        );
    }

    private handleInputChange = (event: React.ChangeEvent) => {
        const newQuery: string = (event.target as HTMLInputElement).value;
        this.setState((prevState) => { return {
            query: newQuery,
            suggestions: newQuery.length === 0 ? [] : prevState.suggestions
        }});
        if (newQuery.length > 0) {
            this.loadSuggestions(newQuery);
        }
   }

    private handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        this.props.onSearchFunc(this.state.query);
        this.searchBox.value = "";
        this.setState((prevState: ISearchBoxState) => { return {
            query: "",
            suggestions: []
        }});
    }

    private handleSuggestionClicked = (ticker: string) => {
        this.props.onSearchFunc(ticker);
        this.searchBox.value = "";
        this.setState((prevState: ISearchBoxState) => { return {
            query: "",
            suggestions: []
        }});
    }

    private async loadSuggestions(query: string) {
        await delay(500);
        if (query === this.state.query) {
            const suggestions: IStockMetadata[] = await new BullWatcher().searchStockMetadata(query);
            this.setState((prevState) => {
                return {
                    query: prevState.query,
                    suggestions
                }
            });
        }
    }
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
