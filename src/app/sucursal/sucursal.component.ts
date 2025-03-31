import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, FormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { RegisterProcessService } from '../services/register-process.service';
import { Ventanillas, Departamento } from '../models/models';
import { ButtonCustomComponent } from '../custom/button-custom/button-custom.component';
import { AlertService } from '../services/alert.service';
import { VideosService } from '../services/videos.service';
@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxPaginationModule, FormsModule, ButtonCustomComponent],
  templateUrl: './sucursal.component.html',
  styleUrl: './sucursal.component.css'
})
export class SucursalComponent {
  //fromularios
  departamentoForm: FormGroup;
  departamentoForm2: FormGroup;
  procesosForm: FormGroup;
  procesosForm2: FormGroup;
  ventanillaForm: FormGroup;
  ventanillaForm2: FormGroup;
  videoform: FormGroup;
  //datos de la tabla
  procesos: any[] = [];
  ventanillas: any[] = [];
  departamentos: any[] = [];
  videos: any[] = [];
  //mensajes personalizados
  showToast = false;
  toastMessage = ''
  //numeración de paginas
  page: number = 1;
  pagev: number = 1; // Página inicial
  pageD: number = 1;
  pageVid: number = 1
  //filtro del buscador
  searchTextP = ''
  searchTextV = ''
  searchTextD = ''
  searachTextVid= ''
  //modales para actualizar
  selectedProceso: any = null;
  selectedVentanilla: any = null;
  selectedDepartamento: any = null;
  archivoSeleccionado: File | null = null;
  constructor(private fb: FormBuilder,
    private Process: RegisterProcessService,
    private alert: AlertService,
    private video: VideosService
  ) {

    this.procesosForm = this.fb.group({
      nombre: ['', Validators.required],
    });
    this.procesosForm2 = this.fb.group({
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
    // Inicializar el formulario
    this.videoform = this.fb.group({
      file: [null, Validators.required], // Se asegura de que el archivo es requerido
    });
    
    

    // Formulario de actualización (con el campo 'activo')
    this.ventanillaForm2 = this.fb.group({
      nombre: ['', Validators.required],
      activo: [false]  // Incluimos el campo 'activo' para la actualización
    });
    this.departamentoForm2 = this.fb.group({
      nombre: ['', Validators.required],
      operacionesIds: this.fb.array([]),
      ventanillasIds: this.fb.array([]),
    });

  }

  ngOnInit() {
    this.cargarProcesos();
    this.cargarVentanillas();
    this.cargarDepartamentos();
    this.cargarVideos();
  }
  cargarVideos() {
    this.video.getVideos().subscribe(
      data => {
        console.log(data);
        this.videos = data.map((nombre, index) => ({
          id: index + 1, // Asignamos un ID para cada video
          nombre: nombre
        }));
      }
    );
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
  get filteredVideos() {
    return this.videos.filter(videos => {
      return videos.nombre.toLowerCase().includes(this.searchTextD.toLowerCase())
    })
  }
  enviarFormulario(): void {
    if (this.procesosForm.valid) {
      const nombre = this.procesosForm.value
      console.log(nombre);
      this.Process.registrar(nombre).subscribe(
        response => {
          console.log("✅ Registro exitoso:", response);
          this.alert.showSuccess("Registro exitoso: Se han creado los procesos")
          this.procesosForm.reset(); // 🔄 Limpiar el formulario después de registrar
          const modal = document.getElementById('exampleModal2') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
          this.cargarProcesos();
        },
        error => {
          console.error("❌ Error en el registro:", error);
          this.alert.showError("Error en el registro: Algo salio mal al crear los procesos")
        }
      );
    }
  }
  eliminarPro(id: string) {
    this.Process.deletePro(id).subscribe(response => {
      this.alert.showSuccess("Proceso eliminado")
      this.cargarProcesos()
    }, error => {
      this.alert.showError("Error en la eliminacion");
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
        this.alert.showSuccess("Registro exitoso se ha creado la ventanilla");
        this.ventanillaForm.reset();
        const modal = document.getElementById('exampleModal3') as HTMLElement;
        if (modal) {
          (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
        }
        this.cargarVentanillas()
      },
        error => {
          console.error("❌ Error en el registro:", error);
          this.alert.showError("Error en el registro de la ventanilla");
        }
      )
    } else {
      console.log("formulario invalido")
    }
  }
  eliminarVe(id: string) {
    this.Process.deleteVen(id).subscribe(response => {
      this.alert.showSuccess("Ventanilla eliminada")
      this.cargarVentanillas()
    }, error => {
      this.alert.showError("Error en la eliminacion de la ventanilla");
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
    // Si estamos dentro del contexto del formulario, usa los valores del formulario
    if (this.departamentoForm2) {
      const formArray = this.departamentoForm2.get('operacionesIds') as FormArray;
      return formArray.value.includes(procesoId);  // Verifica si el ID de la operación está seleccionado
    }

    // Si no estamos en el formulario, usamos los valores del departamento seleccionado
    return this.selectedDepartamento?.operacionesIds?.includes(procesoId) || false;
  }

  isVentanillaSelected(ventanillaId: string): boolean {
    // Si estamos dentro del contexto del formulario, usa los valores del formulario
    if (this.departamentoForm2) {
      const formArray = this.departamentoForm2.get('ventanillasIds') as FormArray;
      return formArray.value.includes(ventanillaId);  // Verifica si el ID de la ventanilla está seleccionado
    }

    // Si no estamos en el formulario, usamos los valores del departamento seleccionado
    return this.selectedDepartamento?.ventanillasIds?.includes(ventanillaId) || false;
  }


  crearDepartamento() {
    if (this.departamentoForm.valid) {
      const departamentoData: Departamento = this.departamentoForm.value;

      this.Process.registrarDepartamento(departamentoData).subscribe(
        response => {
          this.alert.showSuccess("Departamento creado correctamente");

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
          this.alert.showSuccess(" Error en la creación del departamento");
        }
      );
    } else {
      console.log("Formulario inválido");
    }
  }

  eliminarDe(id: string) {

    this.Process.deleteDep(id).subscribe(reponse => {

      this.alert.showSuccess(" Departamento eliminado  correctamete");
      this.cargarDepartamentos()
    }, error => {
      this.alert.showError("Error en la eliminacion del departamento")
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
    this.procesosForm2.setValue({
      nombre: proceso.nombre
    });
  }

  actualizarProceso() {
    if (this.selectedProceso) {
      const datosActualizados = this.procesosForm.value; // Obtiene los valores del formulario

      this.Process.actualizarProceso(this.selectedProceso.id, datosActualizados)
        .subscribe(response => {
          this.alert.showSuccess("Proceso actualizado correctamete");

          // Cerrar el modal manualmente
          const modal = document.getElementById('exampleModalUpdate1') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }

          this.cargarProcesos(); // Recargar la lista de procesos actualizados
        }, error => {
          console.error("❌ Error al actualizar:", error);
          this.alert.showError("Error al actualizar el proceso");
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
          this.alert.showSuccess("✅ Ventanilla actualizada correctamete");

          // Cerrar el modal manualmente
          const modal = document.getElementById('exampleModalUpdate2') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }

          this.cargarVentanillas(); // Recargar la lista de ventanillas actualizadas
        }, error => {
          console.error("❌ Error al actualizar:", error);
          this.alert.showError(" Error al actualizar la ventanilla");
        });
    }
  }
  modalActualizarDepartamentos(departamento: any): void {
    // Inicializa el formulario
    this.selectedDepartamento = { ...departamento };
    this.departamentoForm2.patchValue({
      nombre: departamento.nombre
    });

    // Asegúrate de vaciar los FormArray antes de llenarlos con los nuevos datos
    const operacionesControl = this.departamentoForm2.get('operacionesIds') as FormArray;
    const ventanillasControl = this.departamentoForm2.get('ventanillasIds') as FormArray;

    // Limpiar el FormArray antes de agregar los nuevos valores
    while (operacionesControl.length) {
      operacionesControl.removeAt(0);
    }
    while (ventanillasControl.length) {
      ventanillasControl.removeAt(0);
    }

    // Rellenar el FormArray con los valores seleccionados
    departamento.operacionesIds.forEach((id: string) => {
      operacionesControl.push(this.fb.control(id));
    });
    departamento.ventanillasIds.forEach((id: string) => {
      ventanillasControl.push(this.fb.control(id));
    });
  }



  actualizarDepartamentos(): void {
    const departamento: Departamento = this.departamentoForm2.value; // Recoge los datos del formulario

    const id = this.selectedDepartamento.id // Reemplaza con el ID del departamento que deseas actualizar
    console.log(id, departamento)
    // Llamar al servicio para actualizar el departamento
    this.Process.actualizarDepartamento(id, departamento)
      .subscribe(
        response => {
          console.log('Departamento actualizado', response);
          this.cargarDepartamentos();
          this.alert.showSuccess("Departamento actualizado");
          // Puedes realizar más acciones como cerrar el modal o mostrar un mensaje

          // Cerrar el modal manualmente
          const modal = document.getElementById('exampleModalUpdate3') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
        },
        error => {
          this.alert.showError("Ha ocurrido un error al intentar actualizar el departamento")
          console.error('Error al actualizar el departamento', error);
        }
      );
  }
  onCheckboxChangeForUpdate(event: any, arrayName: string) {
    const formArray = this.departamentoForm2.get(arrayName) as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      const index = formArray.controls.findIndex(control => control.value === event.target.value);
      if (index !== -1) {
        formArray.removeAt(index);
      }
    }
  }

  seleccionarArchivo(event: any) {
    const archivo = event.target.files[0]; // Obtenemos el primer archivo
  
    if (archivo) {
      console.log('Archivo seleccionado:', archivo);
      console.log('Nombre:', archivo.name);
      console.log('Tipo:', archivo.type);
      console.log('Tamaño:', archivo.size);
  
      // Validar que sea un archivo de video
      if (archivo.type.startsWith('video/')) {
        this.archivoSeleccionado = archivo;
      } else {
        console.error('El archivo seleccionado no es un video válido.');
        this.archivoSeleccionado = null;
      }
    } else {
      console.error('No se ha seleccionado un archivo válido.');
      this.archivoSeleccionado = null;
    }
  }
  
  subirVideo() {
    if (!this.archivoSeleccionado) {
      console.error('No se ha seleccionado ningún archivo.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.archivoSeleccionado, this.archivoSeleccionado.name);
  
    // Llamada al servicio para subir el video
    this.video.subirVideo(formData).subscribe(
      (response) => {
        console.log('Video subido correctamente', response);
        this.alert.showSuccess("Video subido con exito");
        this.cargarVideos()
      },
      (error) => {
        this.alert.showError("Ocurrio un problema al subir el video");
      }
    );
  }
  
  
  
  eliminarVideo(nombre : string){
    const videoName = nombre;

    this.video.eliminarVideos(videoName).subscribe(response =>{
      this.alert.showSuccess("Video eliminado");
      this.cargarVideos()
    }, err => {
      this.alert.showError("Ocurrio un problema al eliminar el video")
    })
  }
}
