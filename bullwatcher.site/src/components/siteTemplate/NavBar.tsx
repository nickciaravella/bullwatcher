import * as React from "react";
import { Link } from "react-router-dom";
import SearchBox from "src/SearchBox";


export interface INavBarProps {
    onTickerSearch: (ticker: string) => void;
}

export default class NavBar extends React.Component<INavBarProps, any> {

    public render() {
        const { onTickerSearch } = this.props;
        return (
            <div className="d-flex flex-row align-items-center pl-4 border bg-light">
                <SearchBox onSearchFunc={onTickerSearch} />
                <nav className="navbar d-flex flex-row justify-content-between navbar-expand-sm bg-light">
                    <ul className="nav  ml-3">
                        <li className="nav-item"><Link className="nav-link" to='/'>Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to='/patterns/flags'>Flags</Link></li>
                        <li className="nav-item"><Link className="nav-link" to='/rankings'>Rankings</Link></li>
                        <li className="nav-item"><Link className="nav-link" to='/watchlists'>Watchlists</Link></li>
                    </ul>
                </nav>
            </div>
        );
    }
}