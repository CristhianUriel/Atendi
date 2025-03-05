import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Departamento, Ventanillas } from '../models/models';
import { ventanillasPorId } from '../models/models';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RegisterProcessService {
  private apiUri = environment.apiUri;
  constructor(private http: HttpClient) { }
 
  registrar(operaciones: string){
    const url = `${this.apiUri}/operaciones`;
    const  nombre = operaciones
    return this.http.post(url,nombre)
  }

  registrarVentanilla(ventanillas: Ventanillas){
    const url = `${this.apiUri}/ventanillas-catalogo`;
    console.log(ventanillas);
    
    return this.http.post(url, ventanillas);
  }
  registrarDepartamento(departamentoData: Departamento){
    const url = `${this.apiUri}/departamentos`;
    console.log(departamentoData);
    
    return this.http.post(url, departamentoData);
  }
  getProcesos(): Observable<any[]>{
   
    const url = `${this.apiUri}/operaciones`;
    return this.http.get<any[]>(url)
  }
  getVentanilla(): Observable<any[]>{
   
    const url = `${this.apiUri}/ventanillas-catalogo`;
    return this.http.get<any[]>(url)
  }
  getDepartamentos(): Observable<any[]>{
    const url = `${this.apiUri}/departamentos`;
    return this.http.get<any[]>(url)
  }
   getVentanillasPorDepartamento(ventanillasIds: string[]): Observable<ventanillasPorId[]> {
      return this.http.post<ventanillasPorId[]>(`${this.apiUri}/ventanillas-catalogo/ventanillas-ids`, ventanillasIds);
    }
  deleteDep(id: string){
    const url = `${this.apiUri}/departamentos/${id}`;
    return this.http.delete(url)
  }
  deletePro(id: string){
    const url = `${this.apiUri}/operaciones/${id}`;
    console.log(url)
    return this.http.delete(url)
  }
  deleteVen(id: string){
    const url = `${this.apiUri}/ventanillas-catalogo/${id}`;
    console.log(url)
    return this.http.delete(url)
  }
  actualizarProceso(id: string, proceso: any): Observable<any> {
    
    return this.http.put(`${this.apiUri}/operaciones/${id}`, proceso);
  }
  actualizarVentanilla(id: string, ventanilla: Ventanillas): Observable<any> {
    console.log(ventanilla);  // Asegúrate de que los datos son correctos
    return this.http.put(`${this.apiUri}/ventanillas-catalogo/${id}`, ventanilla);
  }
  
 
}