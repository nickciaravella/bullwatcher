import { observer } from 'mobx-react';
import * as React from 'react';
import { GoogleLogin } from 'react-google-login';

import { AuthContextStore } from 'src/models/auth-store';

export interface ILoginLogoutSectionProps {
    authContextStore: AuthContextStore;
}

@observer
export default class LoginLogoutSection extends React.Component<ILoginLogoutSectionProps> {

    constructor(props: ILoginLogoutSectionProps) {
        super(props);
    }

    public render() {
        const { authContextStore } = this.props;
        if (authContextStore.userContext) {
            return (
                <div>
                    <p>{authContextStore.userContext.friendlyName}</p>
                    <button onClick={this.onLogout}>Log out</button>
                </div>
            )
        }

        return (
            <div>
                <GoogleLogin
                    clientId="1039407810630-2fue85vl9bnfkc4b1nbpmq6t8ei005vd.apps.googleusercontent.com"
                    buttonText="Login with Google"
                    onSuccess={this.googleResponse}
                    onFailure={this.onFailure}
                />
            </div>
        );
    }

    private googleResponse = (googleResponse: any) => {
        this.props.authContextStore.saveUserContext({
            email: googleResponse.profileObj.email,
            friendlyName: googleResponse.profileObj.name,
            identityId: googleResponse.profileObj.googleId,
            identityProvider: "google",
        });
   };

    private onFailure = (error: any) => {
        console.log(error.error)
        console.log(error.description)
    }

    private onLogout = () => {
        this.props.authContextStore.removeUserContext();
    }
}