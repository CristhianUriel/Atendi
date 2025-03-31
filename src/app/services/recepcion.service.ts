import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpParams} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { OperacionesPorId, crearTurno } from '../models/models';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RecepcionService {
  private apiUri = environment.apiUri
  constructor(private http: HttpClient) { }
  getDepartamentos(): Observable<any[]> {
    const url = `${this.apiUri}/departamentos`;
    return this.http.get<any[]>(url)
  }
  obtenerDepartamentoPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUri}/departamentos/${id}`);
  }
  getOperacionesPorDepartamento(operacionesIds: string[]): Observable<OperacionesPorId[]> {
    return this.http.post<OperacionesPorId[]>(`${this.apiUri}/operaciones/operaciones-ids`, operacionesIds);
  }
  generarTurno(turnoData: crearTurno): Observable<any> {
    return this.http.post<any>(`${this.apiUri}/turnos`, turnoData);
  }
  getHospitalId(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.hospitalId; // Asumiendo que el rol está en el payload como 'role'
    }
    return '';
  }
  getImpresoras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/impresion/impresoras`);
  }
 // Método para imprimir el turno
 imprimirTurno(id: string, impresora: string) {
  const body = {
    turnoId: id,
    impresora: impresora // No es necesario codificar si lo envías en el cuerpo
  };

  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
 
  });

  // Realiza una solicitud POST
  return this.http.post(`${this.apiUri}/impresion/tickets`, body, { headers,  responseType: 'text' as 'json' });
}

}
