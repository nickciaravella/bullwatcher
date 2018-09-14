import * as React from 'react';
import { Link } from 'react-router-dom';

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
            suggestionsList.push((
                <li key={stockMetadata.ticker}>
                    {stockMetadata.companyName} <Link to={`/stocks/${stockMetadata.ticker}`}>{stockMetadata.ticker}</Link>
                </li>
            ))
        }
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input
                        placeholder="Enter ticker"
                        onChange={this.handleInputChange}
                    />
                </form>
                <div>
                    {
                        this.state.suggestions.length > 0 &&
                        <ul>
                            {suggestionsList}
                        </ul>
                      }
                </div>
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
        console.log("Querying for: " + this.state.query);
        this.props.onSearchFunc(this.state.query);
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
