import { Routes, CanActivateFn } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RecepcionistaComponent } from './recepcionista/recepcionista/recepcionista.component';
import { DashboardComponent } from './administracion/dashboard/dashboard.component';
import { RegistrarUsuariosComponent } from './administracion/registrar-usuarios/registrar-usuarios.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { authGuardGuard } from './guard/auth-guard.guard';
import { AtencionComponent } from './atencion/atencion/atencion.component';

export const routes: Routes = [
    {
        path: '', component: LoginComponent
    },
    
    {
        path: 'home' , component: HomeComponent,
        canActivate:[authGuardGuard],
        data:{role: 'MostrarTurnos'}
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path:'recepcionista', component: RecepcionistaComponent,
        canActivate: [authGuardGuard],
        data: {role: 'recepcion'}
    },
    {
        path:'dashboard', component: DashboardComponent,
        canActivate: [authGuardGuard],
        data: {role: 'ADMINISTRADOR'}
    },
    {
        path:'registrar', component: RegistrarUsuariosComponent,
        canActivate: [authGuardGuard],
        data: {role: 'ADMINISTRADOR'}
    },
    {
        path:'departamentos', component:SucursalComponent,
        canActivate: [authGuardGuard],
        data: {role: 'ADMINISTRADOR'}
    },{
        path: 'ventanilla', component:AtencionComponent,
        canActivate: [authGuardGuard],
        data: {role: 'ventanilla'}
    },
    { path: '**', component: LoginComponent },
];
