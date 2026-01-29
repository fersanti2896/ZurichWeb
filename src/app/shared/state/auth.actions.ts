import { AuthUser } from './auth.model';

export class SetAuth {
    static readonly type = '[Auth] Set Auth';
    constructor(public token: string, public refreshToken: string, public user: AuthUser) { }
}

export class SetTokenOnly {
    static readonly type = '[Auth] Set Token Only';
    constructor(public token: string) { }
}

export class ClearAuth {
    static readonly type = '[Auth] Clear';
}
