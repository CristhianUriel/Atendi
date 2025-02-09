import { Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RecepcionistaComponent } from './recepcionista/recepcionista/recepcionista.component';
import { DashboardComponent } from './administracion/dashboard/dashboard.component';
import { RegistrarUsuariosComponent } from './administracion/registrar-usuarios/registrar-usuarios.component';
import { SucursalComponent } from './sucursal/sucursal.component';

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
        path:'recepcionista', component: RecepcionistaComponent
    },
    {
        path:'dashboard', component: DashboardComponent
    },
    {
        path:'registrar', component: RegistrarUsuariosComponent
    },
    {
        path:'sucursal', component:SucursalComponent
    },
    { path: '**', component: HomeComponent },
];
