import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../auth/interfaces/auth.interface';
import { ClientDTO, CreateClientRequest, GetClientsRequest, UpdateClientRequest } from '../../interfaces/client.interface';
import { Observable } from 'rxjs';
import { CPRequest, CPResponse, MunicipalityReponse, MunicipalityRequest, StatesResponse, TownReponse, TownRequest } from '../../interfaces/catalogs.interface';
import { ReplyResponse } from '../../interfaces/reply.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  allClients(filters: GetClientsRequest): Observable<ApiResponse<ClientDTO[]>> {
    return this.http.post<ApiResponse<ClientDTO[]>>(`${this.api}/Client/AllClients`, filters ?? {});
  }

  createClient(data: CreateClientRequest): Observable<ApiResponse<ReplyResponse>> {
    return this.http.post<ApiResponse<ReplyResponse>>(`${this.api}/Client/CreateClient`, data ?? {});
  }

  updateClient(data: UpdateClientRequest): Observable<ApiResponse<ReplyResponse>> {
    return this.http.post<ApiResponse<ReplyResponse>>(`${this.api}/Client/UpdateClient`, data ?? {});
  }

  deleteClient(clientId: number): Observable<ApiResponse<ReplyResponse>> {
    return this.http.delete<ApiResponse<ReplyResponse>>(`${this.api}/Client/DeleteClient`, { body: { clientId } });
  }

  getStates(): Observable<StatesResponse> {
    return this.http.get<StatesResponse>(`${ this.api }/Catalogs/GetStates`, {});
  }

  getMunicipalityByState( data: MunicipalityRequest ): Observable<MunicipalityReponse> {
    return this.http.post<MunicipalityReponse>(`${ this.api }/Catalogs/GetMunicipalityByState`, data ?? {});
  }

  getTownByStateAndMunicipality( data: TownRequest ): Observable<TownReponse> {
    return this.http.post<TownReponse>(`${ this.api }/Catalogs/GetTownByStateAndMunicipality`, data ?? {});
  }

  getCP( data: CPRequest ): Observable<CPResponse> {
    return this.http.post<CPResponse>(`${ this.api }/Catalogs/GetCP`, data ?? {});
  }
}
