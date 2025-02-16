import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule,FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterUserService } from '../../services/register-user.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-registrar-usuarios',
  standalone: true,
  imports: [RouterModule,CommonModule,ReactiveFormsModule,NgxPaginationModule,FormsModule],
  templateUrl: './registrar-usuarios.component.html',
  styleUrl: './registrar-usuarios.component.css'
})
export class RegistrarUsuariosComponent {
  usuarios: any[] = [];
  page: number = 1; // Página inicial
  count = 1;
  form: FormGroup;
  searchText=''
  constructor(private fb: FormBuilder, private registrar : RegisterUserService) {

      this.form = this.fb.group({
        user: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        password: ['', [Validators.required]],
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/)]],
        role: ['',Validators.required]
      })
    }
    ngOnInit() {
      this.registrar.getUsuarios().subscribe(
        data=>{
          this.usuarios = data;
        },
        error => {
          console.error("Error al obtener datos:", error);
        } 
      )
    }
    onSubmit() {
      if (this.form.valid) {
        const hospitalId = this.registrar.getHospitalId();
        console.log(this.form.value, hospitalId);
        const nombre = this.form.value.name;
        const userName = this.form.value.user;
        const password = this.form.value.password;
        const role = this.form.value.role;

        this.registrar.registrar( hospitalId , nombre, userName, password, role).subscribe(
          response => {
            console.log("Registro exitoso:", response);
            this.form.reset()
          },
          error => {
            console.error("Error en el registro:", error);
          }
        );

       
      } else {
        console.log("invalido")
      }
    }
    update(hosptalId: string){
      console.log(hosptalId);
    }

    logout(){
      localStorage.removeItem('token');
    }
    get filteredUsuarios() {
      return this.usuarios.filter(usuario => {
        return usuario.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
               usuario.userName.toLowerCase().includes(this.searchText.toLowerCase());
      });
    }
}
