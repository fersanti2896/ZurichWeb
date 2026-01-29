import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AuthService } from '../../auth/services/auth.service';
import { AuthState } from '../state/auth.state';
import { SetAuth, ClearAuth } from '../state/auth.actions';
import { RefreshTokenRequest } from '../../auth/interfaces/auth.interface';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private store: Store,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.store.selectSnapshot(AuthState.token);

        if (token) {
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
            });
        }

        return next.handle(req).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    const refreshToken = localStorage.getItem('refresh_token');

                    if (!refreshToken) {
                        this.store.dispatch(new ClearAuth());
                        this.router.navigate(['/auth/login']);
                        return throwError(() => new Error('No refresh token found'));
                    }

                    const requestBody: RefreshTokenRequest = { refreshToken };

                    return this.authService.refreshAccessToken(requestBody).pipe(
                        switchMap((response) => {
                            if (!response?.result?.token) {
                                this.store.dispatch(new ClearAuth());
                                this.router.navigate(['/auth/login']);
                                return throwError(() => new Error('Invalid refresh response'));
                            }

                            const permissions = AuthState.getPermsFromJwt(response.result.token);
                            const user = { ...response.result, permissions };

                            localStorage.setItem('refresh_token', response.result.refreshToken);

                            this.store.dispatch(new SetAuth(response.result.token, response.result.refreshToken, user));

                            const retry = req.clone({
                                setHeaders: { Authorization: `Bearer ${response.result.token}` },
                            });

                            return next.handle(retry);
                        }),
                        catchError((refreshError) => {
                            this.store.dispatch(new ClearAuth());
                            this.router.navigate(['/auth/login']);
                            return throwError(() => refreshError);
                        })
                    );
                }

                return throwError(() => error);
            })
        );
    }
}
