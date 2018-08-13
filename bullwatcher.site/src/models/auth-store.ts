import { observable } from 'mobx';

import { BullWatcher } from 'src/services/bullwatcher';
import { IAuthContext, IUserContext } from './auth-context'


export class AuthContextStore {
    @observable public userContext?: IUserContext;

    public loadUserContext() {
        const existingContext: string = localStorage.getItem('userContext');
        if (existingContext) {
            this.userContext = JSON.parse(existingContext);
        }
    }

    public saveUserContext(context: IAuthContext) {
        new BullWatcher().login(context)
            .then(userContext => {
                this.userContext = userContext;
                localStorage.setItem('userContext', JSON.stringify(userContext));
            })
   }

    public removeUserContext() {
        this.userContext = null;
        localStorage.removeItem('userContext');
    }
}