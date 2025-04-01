import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Departamento, Ventanillas } from '../models/models';
import { ventanillasPorId } from '../models/models';
import { environment } from '../../environments/environment';
import { ApiUrlService } from './api-url.service';
@Injectable({
  providedIn: 'root'
})
export class RegisterProcessService {
 // private apiUri = environment.apiUri;
  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService
  ) { }
 
  registrar(operaciones: string){
    const url = `${this.apiUrlService.getApiUrl()}/api/operaciones`;
    const  nombre = operaciones
    return this.http.post(url,nombre)
  }

  registrarVentanilla(ventanillas: Ventanillas){
    const url = `${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo`;
    console.log(ventanillas);
    
    return this.http.post(url, ventanillas);
  }
  registrarDepartamento(departamentoData: Departamento){
    const url = `${this.apiUrlService.getApiUrl()}/api/departamentos`;
    console.log(departamentoData);
    
    return this.http.post(url, departamentoData);
  }
  getProcesos(): Observable<any[]>{
   
    const url = `${this.apiUrlService.getApiUrl()}/api/operaciones`;
    return this.http.get<any[]>(url)
  }
  getVentanilla(): Observable<any[]>{
   
    const url = `${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo`;
    return this.http.get<any[]>(url)
  }
  getDepartamentos(): Observable<any[]>{
    const url = `${this.apiUrlService.getApiUrl()}/api/departamentos`;
    return this.http.get<any[]>(url)
  }
   getVentanillasPorDepartamento(ventanillasIds: string[]): Observable<ventanillasPorId[]> {
      return this.http.post<ventanillasPorId[]>(`${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo/ventanillas-ids`, ventanillasIds);
    }
  deleteDep(id: string){
    const url = `${this.apiUrlService.getApiUrl()}/api/departamentos/${id}`;
    return this.http.delete(url)
  }
  deletePro(id: string){
    const url = `${this.apiUrlService.getApiUrl()}/api/operaciones/${id}`;
    console.log(url)
    return this.http.delete(url)
  }
  deleteVen(id: string){
    const url = `${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo/${id}`;
    console.log(url)
    return this.http.delete(url)
  }
  actualizarProceso(id: string, proceso: any): Observable<any> {
    
    return this.http.put(`${this.apiUrlService.getApiUrl()}/api/operaciones/${id}`, proceso);
  }
  actualizarVentanilla(id: string, ventanilla: Ventanillas): Observable<any> {
    console.log(ventanilla);  // Asegúrate de que los datos son correctos
    return this.http.put(`${this.apiUrlService.getApiUrl()}/api/ventanillas-catalogo/${id}`, ventanilla);
  }
  actualizarDepartamento(id: string, departamento: Departamento): Observable<any> {
    console.log(departamento);  // Asegúrate de que los datos son correctos
    return this.http.put(`${this.apiUrlService.getApiUrl()}/api/departamentos/${id}`, departamento);
  }
 
}