import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable,map,catchError,throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class VideosService {

    // URL de tu API

  constructor(private http: HttpClient) { }
  getVideos(): Observable<string[]> {
    return this.http.get('http://localhost:8080/videos/names', { responseType: 'text' }).pipe(
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
    const url = `http://localhost:8080/videos/${VideoName}`;
    return this.http.delete(url, { responseType: 'text' });
  }
  
   // Método para subir un video
   subirVideo(formData: FormData): Observable<string> {
    const url = `http://localhost:8080/videos/upload`;
    return this.http.post(url, formData, { responseType: 'text'  });
  }
  
}
