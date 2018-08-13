export interface IAuthContext {
    identityProvider: string;
    identityId: string;
    email: string;
    friendlyName: string;
}

export interface IUserContext {
    userId: string;
    email: string;
    friendlyName: string;
}