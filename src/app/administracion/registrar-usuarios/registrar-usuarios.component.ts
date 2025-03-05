import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterUserService } from '../../services/register-user.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Models, ventanillasPorId, Users } from '../../models/models';


@Component({
  selector: 'app-registrar-usuarios',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, NgxPaginationModule, FormsModule],
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
  searchText = ''
  constructor(private fb: FormBuilder, private registrar: RegisterUserService) {

    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/)]],
      userName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required]],
      rol: ['', Validators.required],
      departamentoId: ['', Validators.required],
      ventanillaId: ['', Validators.required],
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
         this.mostrarToast("Usuario registrado con exito");
          this.form.reset({nombre: '',
            userName: '',
            password: '',
            rol: '',            // O algún valor por defecto que desees
            departamentoId: '', // O algún valor por defecto que desees
            ventanillaId: '', })
        },
        error => {
          console.error("Error en el registro:", error);
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
      this.mostrarToast("✅ Usuario eliminado")
      this.cargarUsuarios()
    },error=>{
      this.mostrarToast("❌ Error en la eliminacion del departamento")
    })
  }
}
