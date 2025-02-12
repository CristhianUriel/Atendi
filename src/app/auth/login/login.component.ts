import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';

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
    const  username = this.form.value.user;
    const  password= this.form.value.password;
    console.log("datos ", this.form.value);
    this.authService.login(username, password, this.HospitalId).subscribe({
      next: (response) => {
        console.log('Respuesta completa del backend:', response);
        
        if (!response || !response.token) {
          console.error('No se recibió un token en la respuesta del servidor.');
          return;
        }
    
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en el login:', err);
      }
    });
    
    
    } else {
      console.log("formulario invalido")
    }
  }
}

