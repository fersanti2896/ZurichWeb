import { State, Action, StateContext, Selector } from '@ngxs/store';

import { AuthStateModel } from './auth.model';
import { SetAuth, SetTokenOnly, ClearAuth } from './auth.actions';

function decodeJwtPayload(token: string): any | null {
    try {
        const part = token.split('.')[1];
        const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
        return null;
    }
}

@State<AuthStateModel>({
    name: 'auth',
    defaults: {
        token: null,
        refreshToken: null,
        user: null,
    },
})
export class AuthState {
    @Selector() static token(s: AuthStateModel) { return s.token; }
    @Selector() static refreshToken(s: AuthStateModel) { return s.refreshToken; }
    @Selector() static user(s: AuthStateModel) { return s.user; }
    @Selector() static isLoggedIn(s: AuthStateModel) { return !!s.token; }
    @Selector() static permissions(s: AuthStateModel) { return s.user?.permissions ?? []; }
    @Selector() static roleId(s: AuthStateModel) { return s.user?.roleId ?? 0; }

    @Action(SetAuth)
    setAuth(ctx: StateContext<AuthStateModel>, action: SetAuth) {
        ctx.patchState({
            token: action.token,
            refreshToken: action.refreshToken,
            user: action.user,
        });
    }

    @Action(SetTokenOnly)
    setTokenOnly(ctx: StateContext<AuthStateModel>, action: SetTokenOnly) {
        ctx.patchState({ token: action.token });
    }

    @Action(ClearAuth)
    clear(ctx: StateContext<AuthStateModel>) {
        ctx.setState({ token: null, refreshToken: null, user: null });
    }

    static getPermsFromJwt(token: string): string[] {
        const payload = decodeJwtPayload(token);
        const perm = payload?.perm;
        return Array.isArray(perm) ? perm : [];
    }
}
