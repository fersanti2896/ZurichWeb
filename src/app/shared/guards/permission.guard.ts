import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
    constructor(private store: Store, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const required = route.data['permission'] as string | undefined;
        if (!required) return true;

        const perms = this.store.selectSnapshot(AuthState.permissions);
        if (perms.includes(required)) return true;

        this.router.navigate(['/dashboard']);
        return false;
    }
}
