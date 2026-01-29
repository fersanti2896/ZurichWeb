import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { ApiResponse, LoginDTO, LoginRequest, RefreshTokenRequest } from '../interfaces/auth.interface';
import { AuthState } from '../../shared/state/auth.state';
import { environment } from '../../enviroments/enviroment';
import { SetAuth, ClearAuth } from '../../shared/state/auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = environment.apiUrl;

    constructor(private http: HttpClient, private store: Store) { }

    login(data: LoginRequest): Observable<ApiResponse<LoginDTO>> {
        return this.http.post<ApiResponse<LoginDTO>>(`${this.api}/User/Login`, data).pipe(
            tap((response) => {
                if (!response?.result) return;

                const permissions = AuthState.getPermsFromJwt(response.result.token);

                const user = {
                    ...response.result,
                    permissions,
                };

                localStorage.setItem('refresh_token', response.result.refreshToken);
                this.store.dispatch(new SetAuth(response.result.token, response.result.refreshToken, user));
            })
        );
    }

    refreshAccessToken(data: RefreshTokenRequest): Observable<ApiResponse<LoginDTO>> {
        return this.http.post<ApiResponse<LoginDTO>>(`${this.api}/User/RefreshToken`, data);
    }

    logout() {
        localStorage.removeItem('refresh_token');
        this.store.dispatch(new ClearAuth());
    }
}
