import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, FormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { RegisterProcessService } from '../services/register-process.service';
import { Ventanillas, Departamento } from '../models/models';
@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxPaginationModule, FormsModule],
  templateUrl: './sucursal.component.html',
  styleUrl: './sucursal.component.css'
})
export class SucursalComponent {
  //fromularios
  departamentoForm: FormGroup;
  procesosForm: FormGroup;
  ventanillaForm: FormGroup;
  ventanillaForm2 :FormGroup;
  //datos de la tabla
  procesos: any[] = [];
  ventanillas: any[] = [];
  departamentos: any[] = [];
  //mensajes personalizados
  showToast = false;
  toastMessage = ''
  //numeración de paginas
  page: number = 1;
  pagev: number = 1; // Página inicial
  pageD: number = 1;
  //filtro del buscador
  searchTextP = ''
  searchTextV = ''
  searchTextD = ''
  selectedProceso: any = null;
  selectedVentanilla: any = null;
  constructor(private fb: FormBuilder, private Process: RegisterProcessService) {

    this.procesosForm = this.fb.group({
      nombre: ['', Validators.required],
    });
    this.ventanillaForm = this.fb.group({
      nombre: ['', Validators.required],
    });
    this.departamentoForm = this.fb.group({
      nombre: ['', Validators.required],
      operacionesIds: this.fb.array([]),
      ventanillasIds: this.fb.array([])  // Array para ventanillas seleccionadas
    });
    
    // Formulario de actualización (con el campo 'activo')
this.ventanillaForm2 = this.fb.group({
  nombre: ['', Validators.required],
  activo: [false]  // Incluimos el campo 'activo' para la actualización
});
  }

  ngOnInit() {
    this.cargarProcesos();
    this.cargarVentanillas();
    this.cargarDepartamentos();
  }
  // Método para cargar los datos de los procesos
  cargarProcesos() {
    this.Process.getProcesos().subscribe(
      data => {
        this.procesos = data;  // Asigna los datos recibidos a la variable 'procesos'
        this.procesos = data;  // Asigna también a 'filteredProcesos' si estás usando un filtro
      },
      error => {
        console.error("Error al obtener los datos:", error);
      }
    );
  }
  // Método para actualizar la información de los procesos
  actualizarDatos() {
    this.cargarProcesos();  // Vuelve a cargar los datos
  }
  cargarVentanillas() {
    this.Process.getVentanilla().subscribe(
      data => {
        this.ventanillas = data;  // Asigna los datos recibidos a la variable 'procesos'
        this.ventanillas = data;  // Asigna también a 'filteredProcesos' si estás usando un filtro
      },
      error => {
        console.error("Error al obtener los datos:", error);
      }
    );
  }

  // Método para actualizar la información de los procesos
  actualizarDatosV() {
    this.cargarVentanillas();  // Vuelve a cargar los datos
  }
  cargarDepartamentos() {
    this.Process.getDepartamentos().subscribe(
      data => {
        this.departamentos = data.filter(departamento => departamento.nombre.toLowerCase() !== 'ti');
        this.departamentos.forEach(departamento => {
          const ids: string[] = departamento.ventanillasIds;
          if (ids && ids.length) {
            this.Process.getVentanillasPorDepartamento(ids).subscribe(
              response => {
                // Asigna la respuesta a una propiedad del departamento
                departamento.ventanillas = response;
              },
              error => {
                this.mostrarToast("❌ Error al cargar las ventanillas");
                departamento.ventanillas = [];
              }
            );
          } else {
            departamento.ventanillas = [];
          }
        });
      },
      error => {
        console.log(error);
        this.mostrarToast("❌ Error al cargar departamentos");
      }
    );
  }
  getNombresVentanillas(departamento: any): string {
    if (departamento.ventanillas && departamento.ventanillas.length > 0) {
      return departamento.ventanillas.map((v: any) => v.nombre).join(', ');
    }
    return 'Sin ventanillas';
  }
  actualizarDatosD() {
    this.cargarDepartamentos();  // Vuelve a cargar los datos
  }
  get filteredProcesos() {
    return this.procesos.filter(procesos => {
      return procesos.nombre.toLowerCase().includes(this.searchTextP.toLowerCase())
    });
  }
  get filteredVentanillas() {
    return this.ventanillas.filter(ventanillas => {
      return ventanillas.nombre.toLowerCase().includes(this.searchTextV.toLowerCase())
    });
  }
  get filteredDepartamento() {
    return this.departamentos.filter(departamentos => {
      return departamentos.nombre.toLowerCase().includes(this.searchTextD.toLowerCase())
    })
  }
  enviarFormulario(): void {
    if (this.procesosForm.valid) {
      const nombre = this.procesosForm.value
      console.log(nombre);
      this.Process.registrar(nombre).subscribe(
        response => {
          console.log("✅ Registro exitoso:", response);
          this.mostrarToast("✅ Registro exitoso: Se han creado los procesos")
          this.procesosForm.reset(); // 🔄 Limpiar el formulario después de registrar
          const modal = document.getElementById('exampleModal2') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
          this.cargarProcesos();
        },
        error => {
          console.error("❌ Error en el registro:", error);
          this.mostrarToast("❌ Error en el registro: Algo salio mal al crear los procesos")
        }
      );
    }
  }
  eliminarPro(id: string) {
    this.Process.deletePro(id).subscribe(response => {
      this.mostrarToast("✅ Proceso eliminado")
      this.cargarProcesos()
    }, error => {
      this.mostrarToast("❌ Error en la eliminacion");
    }
    )
  }
  registrarVentanillas() {
    if (this.ventanillaForm.valid) {
      const ventanilla: Ventanillas = {
        nombre: this.ventanillaForm.value.nombre,
        activo: true
      }
      console.log(ventanilla);
      this.Process.registrarVentanilla(ventanilla).subscribe(response => {
        console.log("✅ Registro exitoso:", response);
        this.mostrarToast("✅ Registro exitoso se ha creado la ventanilla");
        this.ventanillaForm.reset();
        const modal = document.getElementById('exampleModal3') as HTMLElement;
        if (modal) {
          (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
        }
        this.cargarVentanillas()
      },
        error => {
          console.error("❌ Error en el registro:", error);
          this.mostrarToast("❌ Error en el registro de la ventanilla");
        }
      )
    } else {
      console.log("formulario invalido")
    }
  }
  eliminarVe(id: string) {
    this.Process.deleteVen(id).subscribe(response => {
      this.mostrarToast("✅ Ventanilla eliminada")
      this.cargarVentanillas()
    }, error => {
      this.mostrarToast("❌ Error en la eliminacion");
    }
    )
  }
  // Manejar cambios en los checkboxes
  onCheckboxChange(event: any, arrayName: string) {
    const formArray = this.departamentoForm.get(arrayName) as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      const index = formArray.controls.findIndex(control => control.value === event.target.value);
      if (index !== -1) {
        formArray.removeAt(index);
      }
    }
  }
  isOperacionSelected(procesoId: string): boolean {
    const formArray = this.departamentoForm.get('operacionesIds') as FormArray;
    return formArray.value.includes(procesoId);
  }
  isVentanillaSelected(ventanillaId: string): boolean {
    const formArray = this.departamentoForm.get('ventanillasIds') as FormArray;
    return formArray.value.includes(ventanillaId);
  }

  crearDepartamento() {
    if (this.departamentoForm.valid) {
      const departamentoData: Departamento = this.departamentoForm.value;

      this.Process.registrarDepartamento(departamentoData).subscribe(
        response => {
          this.mostrarToast("✅ Departamento creado");

          // Resetear el formulario:
          this.departamentoForm.reset({
            nombre: '',
            operacionesIds: [],
            ventanillasIds: []
          });

          // Limpiar manualmente los FormArray:
          (this.departamentoForm.get('operacionesIds') as FormArray).clear();
          (this.departamentoForm.get('ventanillasIds') as FormArray).clear();

          const modal = document.getElementById('exampleModal') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
          this.cargarDepartamentos();
        },
        error => {
          console.error("❌ Error en la creación:", error);
          this.mostrarToast("❌ Error en la creación");
        }
      );
    } else {
      console.log("Formulario inválido");
    }
  }

  eliminarDe(id: string) {

    this.Process.deleteDep(id).subscribe(reponse => {
      this.mostrarToast("✅ Departamento eliminado")
      this.cargarDepartamentos()
    }, error => {
      this.mostrarToast("❌ Error en la eliminacion del departamento")
    })
  }
  mostrarToast(mensaje: string) {
    this.toastMessage = mensaje;
    this.showToast = true;

    // Ocultar después de 3 segundos
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
  ModalActualizarProceso(proceso: any) {
    this.selectedProceso = { ...proceso }; // Clonamos el proceso para evitar modificarlo directamente
  
    // Rellenar el formulario con los datos del proceso seleccionado
    this.procesosForm.setValue({
      nombre: proceso.nombre
    });
  }

  actualizarProceso() {
    if (this.selectedProceso) {
      const datosActualizados = this.procesosForm.value; // Obtiene los valores del formulario
  
      this.Process.actualizarProceso(this.selectedProceso.id, datosActualizados)
        .subscribe(response => {
          this.mostrarToast("✅ Proceso actualizado correctamente");
  
          // Cerrar el modal manualmente
          const modal = document.getElementById('exampleModalUpdate1') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
  
          this.cargarProcesos(); // Recargar la lista de procesos actualizados
        }, error => {
          console.error("❌ Error al actualizar:", error);
          this.mostrarToast("❌ Error al actualizar el proceso");
        });
    }
  }
  
  modalActualizarVentanilla(ventanilla: any) {
    this.selectedVentanilla = { ...ventanilla }; // Clonamos la ventanilla para evitar modificarla directamente
  
    // Rellenar el formulario con los datos del proceso seleccionado
    this.ventanillaForm2.setValue({
      nombre: ventanilla.nombre,
      activo: ventanilla.activo // Establecer el valor de 'activo' en el formulario
    });
  }
  

  actualizarVentanilla() {
    if (this.selectedVentanilla) {
      const datosActualizados: Ventanillas = {
        nombre: this.ventanillaForm2.value.nombre,
        activo: this.ventanillaForm2.value.activo
      };
  
      console.log('Datos a actualizar:', datosActualizados);  // Verifica los datos aquí.
  
      this.Process.actualizarVentanilla(this.selectedVentanilla.id, datosActualizados)
        .subscribe(response => {
          this.mostrarToast("✅ Ventanilla actualizada correctamente");
  
          // Cerrar el modal manualmente
          const modal = document.getElementById('exampleModalUpdate2') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
  
          this.cargarVentanillas(); // Recargar la lista de ventanillas actualizadas
        }, error => {
          console.error("❌ Error al actualizar:", error);
          this.mostrarToast("❌ Error al actualizar la ventanilla");
        });
    }
  }
  
}
