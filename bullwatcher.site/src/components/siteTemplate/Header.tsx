import * as React from "react";
import './Header.css'

import LoginLogoutSection from "src/components/siteTemplate/LoginLogoutSection";
import logo from 'src/logo.svg';
import { AuthContextStore } from "src/models/auth-store";

export interface IHeaderProps {
    authContextStore: AuthContextStore;
}

export default class Header extends React.Component<IHeaderProps, any> {

    public render() {
        const { authContextStore } = this.props;
        return (
            <header className="Header">
                <div className="Header-content">
                    <div className="Header-logo-and-title">
                        <img src={logo} className="Header-logo" alt="logo" />
                        <h1 className="Header-title">Bull Watcher</h1>
                    </div>
                    <LoginLogoutSection authContextStore={authContextStore} />
                </div>
            </header>
        )
    }
}
