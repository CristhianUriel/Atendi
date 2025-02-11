import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule,FormGroup, FormBuilder, Validators,FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './sucursal.component.html',
  styleUrl: './sucursal.component.css'
})
export class SucursalComponent {

departamentoForm: FormGroup;
  constructor(private fb: FormBuilder) {
     
      this.departamentoForm = this.fb.group({
        nombre: ['', Validators.required], // Campo obligatorio para el nombre del departamento
        procesos: this.fb.array([]), // FormArray para los procesos
      });
    }
  


   // 📌 Método para obtener el FormArray correctamente
  get procesos(): FormArray {
    return this.departamentoForm.get('procesos') as FormArray;
  }

  // 📌 Método para agregar un nuevo proceso al FormArray
  agregarProceso(): void {
    this.procesos.push(this.fb.control('', Validators.required));
  }

  // 📌 Método para eliminar un proceso del FormArray
  eliminarProceso(index: number): void {
    this.procesos.removeAt(index);
  }

  // 📌 Método para enviar el formulario
  enviarFormulario(): void {
    if (this.departamentoForm.valid) {
      console.log('Formulario válido:', this.departamentoForm.value);
    }
  }
}
