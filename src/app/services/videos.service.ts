import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable,map,catchError,throwError } from 'rxjs';
import { ApiUrlService } from './api-url.service';
@Injectable({
  providedIn: 'root'
})
export class VideosService {

   
  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService
  ) { }
  getVideos(): Observable<string[]> {
    return this.http.get(`${this.apiUrlService.getApiUrl()}/videos/names`, { responseType: 'text' }).pipe(
      map(response => {
        try {
          return JSON.parse(response); // Si la respuesta es un JSON válido, lo devuelve directamente
        } catch (error) {
          console.warn('La respuesta no es un JSON válido, convirtiendo manualmente...');
          return response.split("\n").map(v => v.trim()); // Intenta separar por líneas o algún delimitador
        }
      }),
      catchError(error => {
        console.error('Error al obtener los videos:', error);
        return throwError(() => new Error('No se pudieron obtener los videos'));
      })
    );
  }
   // Método para eliminar un video por su ID
   eliminarVideos(VideoName: string): Observable<string> {
    const url = `${this.apiUrlService.getApiUrl()}/videos/${VideoName}`;
    return this.http.delete(url, { responseType: 'text' });
  }
  
   // Método para subir un video
   subirVideo(formData: FormData): Observable<string> {
    const url = `${this.apiUrlService.getApiUrl()}/videos/upload`;
    return this.http.post(url, formData, { responseType: 'text'  });
  }
  
}
