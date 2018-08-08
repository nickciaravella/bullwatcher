import { observable } from 'mobx';

import { IAuthContext } from './auth-context'


export class AuthContextStore {
    @observable public authContext?: IAuthContext;

    public loadAuthContext() {
        const existingAuth: string = localStorage.getItem('userContext');
        if (existingAuth) {
            this.authContext = JSON.parse(existingAuth);
        }
    }

    public saveAuthContext(context: IAuthContext) {
        this.authContext = context;
        localStorage.setItem('userContext', JSON.stringify(context));
    }

    public removeAuthContext() {
        this.authContext = null;
        localStorage.removeItem('userContext');
    }
}