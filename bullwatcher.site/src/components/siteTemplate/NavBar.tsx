import * as React from "react";
import { withRouter } from "react-router";
import { Link, RouteComponentProps } from "react-router-dom";
import SearchBox from "src/SearchBox";


export interface INavBarProps {
    onTickerSearch: (ticker: string) => void;
}

class NavBar extends React.Component<RouteComponentProps<INavBarProps> & INavBarProps, any> {

    public render() {
        const { location, onTickerSearch } = this.props;
        const params = new URLSearchParams(location.search);
        const isPreview: boolean = params.get('preview') &&  params.get('preview') === "true" ? true : false;
        return (
            <div className="pl-4 nav-bar-border bg-color-sec" >
                <div className="d-flex flex-row align-items-center" style={{ maxWidth: "1100px", margin: "auto"}}>
                    <SearchBox onSearchFunc={onTickerSearch} />
                    <nav className="navbar d-flex flex-row justify-content-between navbar-expand-sm bg-transparent">
                    {
                        isPreview &&
                        <ul className="nav ml-3">
                            <li className="nav-item"><Link className="nav-link" to='/'>OVERVIEW</Link></li>
                            <li className="nav-item"><Link className="nav-link" to='/patterns/flags'>Flags</Link></li>
                            <li className="nav-item"><Link className="nav-link" to='/rankings'>Rankings</Link></li>
                            <li className="nav-item"><Link className="nav-link" to='/watchlists'>Watchlists</Link></li>
                        </ul>
                    }
                    {
                        !isPreview &&
                        <ul className="nav  ml-3">
                            <li className="nav-item"><Link className="nav-link text-color-pri" to='/'>OVERVIEW</Link></li>
                        </ul>
                    }
                   </nav>
                </div>
            </div>
        );
    }
}

const NavBarWithRouter = withRouter(NavBar);
export default NavBarWithRouter;