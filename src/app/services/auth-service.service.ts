import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUri = environment.apiUri
  constructor(private http : HttpClient) {

   }
   login(userName: string, password: string, hospitalId: string): Observable<any> {
    console.log('Enviando credenciales:', { userName, password, hospitalId }); // 🔍 Verifica si los datos son correctos
  
    const url = `${this.apiUri}/auth/login`;
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Asegura que los datos se envíen como JSON
      'Hospital-Id': hospitalId,

    });
  console.log("estos son los headers" + headers.get('Hospital-Id'));
    const body = JSON.stringify({ userName, password }); // Convierte los datos a JSON
  
    return this.http.post(url, body, { headers, });
  }

   getToken(): string | null {
    return localStorage.getItem('token');
   }
   getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.role; // Asumiendo que el rol está en el payload como 'role'
    }
    return null;
  }
  getIsExpired(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.exp; // Asumiendo que el rol está en el payload como 'role'
    }
    return null;
  }
  isTokenExpired(): boolean{
    const exp = this.getIsExpired();
    if (exp) {
      return Number(exp) * 1000 < Date.now();
    }
    return true
  }

}
