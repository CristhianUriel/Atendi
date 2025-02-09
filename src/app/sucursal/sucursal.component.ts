import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule,FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sucursal.component.html',
  styleUrl: './sucursal.component.css'
})
export class SucursalComponent {
formAdmin: FormGroup;
formSucur : FormGroup;
  constructor(private fb: FormBuilder) {
      this.formAdmin = this.fb.group({
        user: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        password: ['', [Validators.required]],
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/)]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
      })

      this.formSucur = this.fb.group({
        sucursal : ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/) ] ],
        direccion: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9À-ÿ\u00f1\u00d1\s#.,-]+$/)]],
        telefonoSucur: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
      })
    }
    onSubmit() {
      if (this.formAdmin.valid) {
        console.log(this.formAdmin.value);
      } else {
        console.log("invalido")
      }
    }
    regisSucur(){
      if (this.formSucur.valid) {
        console.log(this.formSucur.value);
      } else {
        console.log("invalido")
      }
    }
}
