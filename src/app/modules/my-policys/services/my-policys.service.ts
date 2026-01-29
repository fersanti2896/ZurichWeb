import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../auth/interfaces/auth.interface';
import { PolicyDTO } from '../../interfaces/policy.interface';
import { ReplyResponse } from '../../interfaces/reply.interface';

@Injectable({
  providedIn: 'root'
})
export class MyPolicysService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  myPolicys(): Observable<ApiResponse<PolicyDTO[]>> {
    return this.http.get<ApiResponse<PolicyDTO[]>>(`${this.api}/Policy/MyPolicys`);
  }

  requestCancelPolicy(policyId: number): Observable<ApiResponse<ReplyResponse>> {
    return this.http.post<ApiResponse<ReplyResponse>>(`${this.api}/Policy/RequestCancelPolicy`, { policyId } );
  }
}
