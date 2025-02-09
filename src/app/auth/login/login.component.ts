import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      user: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required]]
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

