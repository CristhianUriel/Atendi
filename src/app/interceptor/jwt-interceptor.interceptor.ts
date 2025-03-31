import { HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthServiceService } from '../services/auth-service.service';
import { Observable, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
export const jwtInterceptorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);
    // Verifica si la URL es una conexión SSE (EventSource) y no aplica el interceptor
    if (req.url.includes('/api/turnos/tomados/stream') && req.method === 'GET') {
      return next(req); // Sin modificaciones, pasa la solicitud como está
    }
  
  const excludedUrls = [
    'http://localhost:8080/api/auth/login',
    
  ]; // Rutas excluidas

  // Verifica si la solicitud es para el login
  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req); // Sin cambios, sigue con la solicitud
  }

  // Obtener el token de localStorage o donde lo tengas almacenado
  const token = localStorage.getItem('token');

  // Si hay un token, clonar la solicitud y agregar el header Authorization
  if (token) {
    if (authService.isTokenExpired()) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return throwError(() => new Error('Token caducado'));
    }
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq); // Retorna la solicitud modificada
  }

  // Si no hay token, continuar con la solicitud original
  return next(req); 
};
