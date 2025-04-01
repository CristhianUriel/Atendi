import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { ApiUrlService } from './api-url.service';
@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

 // private apiUri = environment.apiUri
  constructor(private http: HttpClient,private apiUrlService: ApiUrlService) {

  }
  login(userName: string, password: string, hospitalId: string): Observable<any> {
    console.log('Enviando credenciales:', { userName, password, hospitalId }); // 🔍 Verifica si los datos son correctos

    const url = `${this.apiUrlService.getApiUrl()}/api/auth/login`;

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
  // Decodificar el JWT y extraer el departamentoId
  getDepartamentoId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1]; // Obtener solo el payload
      const payload = JSON.parse(atob(payloadBase64)); // Decodificar Base64
      return payload.departamentoId || null; // Extraer departamentoId
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
  getIsExpired(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.exp; // Asumiendo que el rol está en el payload como 'role'
    }
    return null;
  }
  isTokenExpired(): boolean {
    const exp = this.getIsExpired();
    if (exp) {
      return Number(exp) * 1000 < Date.now();
    }
    return true
  }

}
