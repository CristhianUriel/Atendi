import { Routes, CanActivateFn } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RecepcionistaComponent } from './recepcionista/recepcionista/recepcionista.component';
import { DashboardComponent } from './administracion/dashboard/dashboard.component';
import { RegistrarUsuariosComponent } from './administracion/registrar-usuarios/registrar-usuarios.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { authGuardGuard } from './guard/auth-guard.guard';

export const routes: Routes = [
    {
        path: '', component: HomeComponent
    },
    
    {
        path: 'home' , component: HomeComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path:'recepcionista', component: RecepcionistaComponent,
        canActivate: [authGuardGuard],
        data: {role: 'recepcionista'}
    },
    {
        path:'dashboard', component: DashboardComponent,
        canActivate: [authGuardGuard],
        data: {role: 'administrador'}
    },
    {
        path:'registrar', component: RegistrarUsuariosComponent,
        canActivate: [authGuardGuard],
        data: {role: 'administrador'}
    },
    {
        path:'departamentos', component:SucursalComponent,
        canActivate: [authGuardGuard],
        data: {role: 'administrador'}
    },
    { path: '**', component: HomeComponent },
];
