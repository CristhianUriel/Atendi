import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup

  HospitalId: string = '67aab2f8ca81b3d38f5b4e3f';

  constructor(private fb: FormBuilder, private authService: AuthServiceService, private router: Router) {
    this.form = this.fb.group({
      user: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required]]
    })
  }
  onSubmit() {
    if (this.form.valid) {
      const username = this.form.value.user;
      const password = this.form.value.password;

      this.authService.login(username, password, this.HospitalId).subscribe({
        next: (response) => {
          if (!response || !response.token) {
            console.error('No se recibió un token en la respuesta del servidor.');
            return;
          }

          localStorage.setItem('token', response.token);

          try {
            const decodedToken: any = jwtDecode(response.token);
            const userRole = decodedToken?.role;
            console.log('Token decodificado:', decodedToken);

            // 🔀 Redirigir según el rol
            switch (userRole) {
              case 'ADMINISTRADOR':
                this.router.navigate(['/dashboard']);
                break;
              case 'recepcion':
                this.router.navigate(['/recepcionista']);
                break;
              default:
                this.router.navigate(['/home']); // Si no tiene un rol válido
                break;
            }

          } catch (error) {
            console.error('Error al decodificar el token:', error);
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          console.error('Error en el login:', err);
        }
      });

    } else {
      console.log('Formulario inválido');
    }
  }
  
}

