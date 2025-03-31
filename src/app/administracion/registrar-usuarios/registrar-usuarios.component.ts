import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterUserService } from '../../services/register-user.service';
import { NgxPaginationModule } from 'ngx-pagination';
import {  ventanillasPorId, Users, UsersUpdate } from '../../models/models';
import { ButtonCustomComponent } from '../../custom/button-custom/button-custom.component';
import { AlertService } from '../../services/alert.service';
@Component({
  selector: 'app-registrar-usuarios',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, NgxPaginationModule, FormsModule,ButtonCustomComponent],
  templateUrl: './registrar-usuarios.component.html',
  styleUrl: './registrar-usuarios.component.css'
})
export class RegistrarUsuariosComponent {
  usuarios: any[] = [];
  departamentos: any[] = []
  showToast = false;
  toastMessage = ''
  ventanillasPorDepartamento: ventanillasPorId[] = [];
  page: number = 1; // Página inicial
  count = 1;
  form: FormGroup;
  formUpdate: FormGroup
  searchText = ''
  selectedUser: any= null
  constructor(private fb: FormBuilder, private registrar: RegisterUserService , private alert: AlertService) {

    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/)]],
      userName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required]],
      rol: ['', Validators.required],
      departamentoId: ['', ],
      ventanillaId: ['', ],
    })
    this.formUpdate = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/)]],
      userName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required]],
      rol: ['', Validators.required],
      departamentoId: ['', ],
      ventanillaId: ['', ],
    })
  }
  ngOnInit() {
    this.cargarUsuarios();
    this.registrar.getDepartamentos().subscribe(deps => {
      this.departamentos = deps.filter(dep => dep.nombre.toLowerCase() !== 'ti');
    });
   

  }

  cargarUsuarios(){
    this.registrar.getUsuarios().subscribe(
      data => {
        this.usuarios = data;
      },
      error => {
        console.error("Error al obtener datos:", error);
      }
    )
  }
  
 // Método que se ejecuta cuando se cambia el departamento
 onDepartamentoChange(event: any): void {
  const departamentoId = event.target.value; // Obtener el ID del departamento seleccionado
  console.log(departamentoId);
  this.obtenerVentanillas(departamentoId);
}

// Método para obtener las ventanillas asociadas a un departamento
// Método para obtener las ventanillas asociadas a un departamento
obtenerVentanillas(departamentoId: string) {
  this.registrar.obtenerDepartamentoPorId(departamentoId).subscribe(departamento => {
    const ventanillasIds: string[] = departamento.ventanillasIds; // Asegúrate de que ventanillasIds es un array de strings
    console.log(ventanillasIds); // Asegúrate de que ves un array de IDs

    this.registrar.getVentanillasPorDepartamento(ventanillasIds).subscribe(response => {
      console.log(response); // Aquí deberías ver un array de objetos ventanillasPorId
      this.ventanillasPorDepartamento = response; // Asignamos el array de objetos a la variable ventanillasPorDepartamento
    }, error => {
      console.error('Error al obtener ventanillas:', error);
    });
  });
}
consultarVentanilla(ventanilla:string){
this.consultarVentanilla(ventanilla)
}
mostrarToast(mensaje: string) {
  this.toastMessage = mensaje;
  this.showToast = true;

  // Ocultar después de 3 segundos
  setTimeout(() => {
    this.showToast = false;
  }, 3000);
}



  onSubmit() {
    if (this.form.valid) {
      const hospitalId = this.registrar.getHospitalId();
      const user: Users = { 
        ...this.form.value, // Desestructuramos los valores del formulario
        hospitalId: hospitalId // Agregamos el hospitalId
      };

      this.registrar.registrar(hospitalId, user).subscribe(
        response => {
          console.log("Registro exitoso:", response);
          // Mostrar el toast
         //this.mostrarToast("Usuario registrado con exito");
         this.alert.showSuccess("registro")
         const modal = document.getElementById('exampleModal') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
          this.form.reset({nombre: '',
            userName: '',
            password: '',
            rol: '',            // O algún valor por defecto que desees
            departamentoId: '', // O algún valor por defecto que desees
            ventanillaId: '', })
        },
        error => {
          console.log("Registro exitoso:", error);
          this.alert.showError('Ocurrio un problema al registrar al usuario');
        }
      );


    } else {
      console.log("invalido")
    }
  }
  update(hosptalId: string) {
    console.log(hosptalId);
  }

  logout() {
    localStorage.removeItem('token');
  }
  get filteredUsuarios() {
    return this.usuarios.filter(usuario => {
      return usuario.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
        usuario.userName.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }
  eliminarUser(id: string){
    this.registrar.deleteUser(id).subscribe(reponse=>{
      this.alert.showSuccess("Se ha eliminado el usuario")
      this.cargarUsuarios()
    },error=>{
      this.mostrarToast("❌ Error en la eliminacion del departamento")
    })
  }
  modalActualizarUsuario(usuario: any) {
    this.selectedUser = { ...usuario }; // Clonamos el objeto usuario para evitar modificar el original
  
    // Verifica si los datos existen antes de asignarlos al formulario
    this.formUpdate.setValue({
      nombre: usuario.nombre || '', 
      userName: usuario.userName || '',
      password: '', // Normalmente no se debe prellenar la contraseña
      rol: '',
      departamentoId: usuario.departamentoId || '',
      ventanillaId: usuario.ventanillaId || ''
    });
  }
  actualizarUsuario() {
    
    const usuario: UsersUpdate = this.formUpdate.value;
    const id = this.selectedUser.id;


    console.log('Enviando datos:', id, usuario);
    this.registrar.actualizarUsuario(id, usuario).subscribe(response=>{
      this.alert.showSuccess("Usuario actualizado");
      this.cargarUsuarios()
    }, err =>{
      this.alert.showError("Ocurrio un error")
    } ); 
  }

 

}
