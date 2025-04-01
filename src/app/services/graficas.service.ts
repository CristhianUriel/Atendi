import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class GraficasService  {
 // private apiUri = environment.apiUri

  constructor(private http: HttpClient,private apiUrlService: ApiUrlService) {

  }
  getHospitalId(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.hospitalId; // Asumiendo que el rol está en el payload como 'role'
    }
    return '';
  }
  obtenerTurnosPorFecha(hospitalId: string,fechaInicio: string, fechaFin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlService.getApiUrl()}/api/reportes/fecha?hospitalId=${hospitalId}&inicio=${fechaInicio}&fin=${fechaFin}`);
  }
  obtenerTurnosPorUsers(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlService.getApiUrl()}/api/reportes/usuario?usuarioId=${usuarioId}`);
  }
  obtenerTurnosPorDepartamentos(hospitalId: string,departamentoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlService.getApiUrl()}/api/reportes/departamento?hospitalId=${hospitalId}&departamentoId=${departamentoId}`);

  }
  obtenerTurnosPorOperaciones(hospitalId: string,operacionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlService.getApiUrl()}/api/reportes/tipo-operacion?hospitalId=${hospitalId}&tipoOperacion=${operacionId}`);

  }
}
