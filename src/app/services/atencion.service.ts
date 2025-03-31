import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtencionService {
  private apiUri = environment.apiUri
  
  constructor( private http : HttpClient) { }

  tomarTurno(id: string): Observable<any> {
    const url = `${this.apiUri}/turnos/${id}/tomar`;
    return this.http.put(url, {});  // Utilizando PUT en vez de POST
  }

  terminarTurno(id: string, estado: string): Observable<any>{
    
    const url = `${this.apiUri}/turnos/${id}/finalizar?estadoFinal=${estado}`;
    return this.http.put(url, {});
  }
}
