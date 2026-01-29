import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';

import { AuthState } from '../../shared/state/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthGuestGuard implements CanActivate {
    constructor(private store: Store, private router: Router) { }

    canActivate(): boolean | UrlTree {
        const token = this.store.selectSnapshot(AuthState.token);
        const refresh = localStorage.getItem('refresh_token');
        return (token || refresh) ? this.router.parseUrl('/dashboard') : true;
    }
}
