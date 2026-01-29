import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { CancelPolicyRequest, CreatePolicyRequest, GetPolicysRequest, PolicyDTO, PolicyStatusesDTO, PolicyTypesDTO } from '../../interfaces/policy.interface';
import { ApiResponse } from '../../../auth/interfaces/auth.interface';
import { Observable } from 'rxjs';
import { ReplyResponse } from '../../interfaces/reply.interface';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  allPolicys(request: GetPolicysRequest): Observable<ApiResponse<PolicyDTO[]>> {
    return this.http.post<ApiResponse<PolicyDTO[]>>(`${this.api}/Policy/AllPolicys`, request ?? {} );
  }

  createPolicy(request: CreatePolicyRequest): Observable<ApiResponse<ReplyResponse>> {
    return this.http.post<ApiResponse<ReplyResponse>>(`${this.api}/Policy/CreatePolicy`, request ?? {} );
  }

  approveCancelPolicy(request: CancelPolicyRequest): Observable<ApiResponse<ReplyResponse>> {
    return this.http.post<ApiResponse<ReplyResponse>>(`${this.api}/Policy/ApproveCancelPolicy`, request ?? {} );
  }

  getPolicyTypes(): Observable<ApiResponse<PolicyTypesDTO[]>> {
    return this.http.get<ApiResponse<PolicyTypesDTO[]>>(`${this.api}/Catalogs/GetPolicyTypes`);
  }

  getPolicyStatus(): Observable<ApiResponse<PolicyStatusesDTO[]>> {
    return this.http.get<ApiResponse<PolicyStatusesDTO[]>>(`${this.api}/Catalogs/GetPolicyStatus`);
  }
}
