import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngxs/store';

import { AuthService } from '../../auth/services/auth.service';
import { AuthState } from '../state/auth.state';
import { RefreshTokenRequest } from '../../auth/interfaces/auth.interface';
import { SetAuth, ClearAuth } from '../state/auth.actions';

@Injectable({ providedIn: 'root' })
export class AppInitializerService {
    constructor(
        private authService: AuthService,
        private store: Store
    ) { }

    private clearSession(): void {
        this.store.dispatch(new ClearAuth());
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('refresh_token');
    }

    private isInvalidRefreshError(obj: any): boolean {
        const msg = obj?.error?.message || obj?.message || obj?.error || '';
        const code = obj?.error?.code ?? obj?.code;
        const m = (msg ?? '').toString().toLowerCase();

        return (
            code === 401 ||
            m.includes('refresh token invalido') ||
            m.includes('refresh token inválido') ||
            m.includes('refresh token expirado') ||
            m.includes('invalid refresh token') ||
            m.includes('expired refresh token')
        );
    }

    async initializeApp(): Promise<void> {
        const raw = localStorage.getItem('refresh_token');

        if (!raw || raw === 'undefined' || raw === 'null' || raw.trim() === '') {
            this.clearSession();
            return;
        }

        try {
            const body: RefreshTokenRequest = { refreshToken: raw };
            const res = await firstValueFrom(this.authService.refreshAccessToken(body));

            if (this.isInvalidRefreshError(res)) {
                this.clearSession();
                return;
            }

            if (res?.result?.token) {
                const permissions = AuthState.getPermsFromJwt(res.result.token);
                const user = { ...res.result, permissions };

                localStorage.setItem('refresh_token', res.result.refreshToken);

                this.store.dispatch(new SetAuth(res.result.token, res.result.refreshToken, user));
                return;
            }

            this.clearSession();
        } catch (err: any) {
            if (this.isInvalidRefreshError(err)) {
                this.clearSession();
                return;
            }
            console.error('Failed to refresh token on app init', err);
            this.clearSession();
        }
    }
}
