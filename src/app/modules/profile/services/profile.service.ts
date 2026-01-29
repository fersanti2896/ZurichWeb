import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../auth/interfaces/auth.interface';
import { ClientDTO, UpdateMyProfileRequest } from '../../interfaces/client.interface';
import { ReplyResponse } from '../../interfaces/reply.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyClientProfile(): Observable<ApiResponse<ClientDTO>> {
    return this.http.get<ApiResponse<ClientDTO>>(`${this.api}/Client/MyClientProfile`);
  }

  updateMyProfile(data: UpdateMyProfileRequest) {
    return this.http.post<ApiResponse<ReplyResponse>>(`${this.api}/Client/UpdateMyProfile`, data ?? {});
  }
}
