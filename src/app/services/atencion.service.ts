import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class AtencionService {
  //private apiUri = environment.apiUri
  
  constructor( private http : HttpClient,private apiUrlService: ApiUrlService) { }

  tomarTurno(id: string): Observable<any> {
    const url = `${this.apiUrlService.getApiUrl()}/api/turnos/${id}/tomar`;
    return this.http.put(url, {});  // Utilizando PUT en vez de POST
  }

  terminarTurno(id: string, estado: string): Observable<any>{
    
    const url = `${this.apiUrlService.getApiUrl()}/api/turnos/${id}/finalizar?estadoFinal=${estado}`;
    return this.http.put(url, {});
  }
}
