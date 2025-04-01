import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { ventanillasPorId, Users } from '../models/models';
import { environment } from '../../environments/environment';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterUserService {
  //private apiUri = environment.apiUri;
  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService

  ) { 

  }

  registrar(hospitalId: string, user: Users){
     // 🔍 Verifica si los datos son correctos
      
        const url = `${this.apiUrlService.getApiUrl()}/api/usuarios`;
      
        const headers = new HttpHeaders({
          'Content-Type': 'application/json', // Asegura que los datos se envíen como JSON
          
        })
        const body = JSON.stringify({hospitalId , user }); // Convierte los datos a JSON
        console.log("Datos recibidos del formulario: ", body);
        console.log("Datos recibidos del formulario: ", url);
        return this.http.post(url, user,{headers});
  }
  getHospitalId(): string  {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken: any = jwtDecode(token);
        return decodedToken?.hospitalId; // Asumiendo que el rol está en el payload como 'role'
      }
      return '';
    }

  getUsuarios(): Observable<any[]>{
   
    const url = `${this.apiUrlService.getApiUrl()}/api/usuarios`;
    return this.http.get<any[]>(url)
  }

  getDepartamentos(): Observable<any[]>{
    const url = `${this.apiUrlService.getApiUrl()}/api/departamentos`;
    return this.http.get<any[]>(url)
  }
  getVentanillas(): Observable<any[]>{
    const url = `${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo`;
    return this.http.get<any[]>(url)
  }
  

  // Obtener un departamento por su ID
  obtenerDepartamentoPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlService.getApiUrl()}/api/departamentos/${id}`);
  }
  getVentanillasPorDepartamento(ventanillasIds: string[]): Observable<ventanillasPorId[]> {
    return this.http.post<ventanillasPorId[]>(`${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo/ventanillas-ids`, ventanillasIds);
  }
  deleteUser(id: string){
    const url = `${this.apiUrlService.getApiUrl()}/api/usuarios/${id}`;
    return this.http.delete(url)
  }
  consultarVentanilla(ventanillasIds: string[]): Observable<ventanillasPorId[]> {
    return this.http.post<ventanillasPorId[]>(`${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo/ventanillas-ids`, ventanillasIds);
  }
  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrlService.getApiUrl()}/api/usuarios/${id}`, datos);
  }
}
