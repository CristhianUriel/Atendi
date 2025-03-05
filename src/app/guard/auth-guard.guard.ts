import { CanActivateFn } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { inject, Inject } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthServiceService)
  const requiredRole = route.data['role'];  // Obtén el rol requerido de las rutas
  const tokenIsExpired = auth.isTokenExpired();

  if(tokenIsExpired){
    window.location.href = '/login';
    return false;
  }
  const userRole = auth.getUserRole();  // Obtén el rol del usuario desde el token

  // Verifica si el rol del usuario existe y si coincide con el rol requerido
  if (!userRole || userRole !== requiredRole) {
    // Si no tiene acceso, redirige al login o alguna otra ruta
    window.location.href = '/login';  // Redirige al login
    return false;  // Bloquea el acceso a la ruta
  }

  // Si el rol es el correcto, permite el acceso
  return true;
};
