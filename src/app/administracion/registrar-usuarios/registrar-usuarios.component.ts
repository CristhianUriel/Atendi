import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule,FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registrar-usuarios',
  standalone: true,
  imports: [RouterModule,CommonModule,ReactiveFormsModule],
  templateUrl: './registrar-usuarios.component.html',
  styleUrl: './registrar-usuarios.component.css'
})
export class RegistrarUsuariosComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder) {
      this.form = this.fb.group({
        user: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        password: ['', [Validators.required]],
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/)]],
        role: ['',Validators.required]
      })
    }
    onSubmit() {
      if (this.form.valid) {
        console.log(this.form.value);
      } else {
        console.log("invalido")
      }
    }
}
