import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RegisterUserService {
  private apiUri = 'http://localhost:8080/api';
  constructor(private http: HttpClient) { 

  }

  registrar(hospitalId: string,nombre: string, userName: string, password:string, rol:string){
     // 🔍 Verifica si los datos son correctos
      
        const url = `${this.apiUri}/usuarios`;
      
        const headers = new HttpHeaders({
          'Content-Type': 'application/json', // Asegura que los datos se envíen como JSON
          
        })
      
        const body = JSON.stringify({hospitalId , nombre, userName, password, rol }); // Convierte los datos a JSON
        console.log("Datos recibidos del formulario: ", body);
        console.log("Datos recibidos del formulario: ", url);
        return this.http.post(url, body,{headers});
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
   
    const url = `${this.apiUri}/usuarios`;
    return this.http.get<any[]>(url)
  }
}
