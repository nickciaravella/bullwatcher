import * as React from 'react';

interface ISearchBoxState {
    query: string
}

export default class SearchBox extends React.Component<any, ISearchBoxState> {

    constructor(props: any) {
        super(props);

        this.state = {
            query: ''
        };
    }

     public render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    placeholder="Enter ticker"
                    onChange={this.handleInputChange}
                />
                <p>{this.state.query}</p>
            </form>
        );
    }

    private handleInputChange = (event: React.ChangeEvent) => {
        this.setState({
            query: (event.target as HTMLInputElement).value
        });
    }

    private handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Querying for: " + this.state.query);
    }
}