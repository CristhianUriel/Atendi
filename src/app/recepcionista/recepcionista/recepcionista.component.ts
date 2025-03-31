import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { RecepcionService } from '../../services/recepcion.service';
import { ButtonCustomComponent } from '../../custom/button-custom/button-custom.component';
import { crearTurno } from '../../models/models';
import { AlertService } from '../../services/alert.service';
@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [MatGridListModule, CommonModule, ButtonCustomComponent,],
  templateUrl: './recepcionista.component.html',
  styleUrl: './recepcionista.component.css'
})
export class RecepcionistaComponent {
  departamentos: any[] = [];
  OperacionesPorDepartamento: any[] = [];
  turno: any = null;
  departamentoSeleccionadoId: string = '';
  impresoras: any[] = []; // Array para almacenar las impresoras
  selectedImpresora: string = '';
  turnoImpreso: boolean = false;  // Bandera para verificar si el turno ha sido impreso

  constructor(private recepcion: RecepcionService, private alert: AlertService) {

  }
  ngOnInit() {
    const turnoGuardado = localStorage.getItem('turno');
    if (turnoGuardado) {
      this.turno = JSON.parse(turnoGuardado);
    }
    this.recepcion.getDepartamentos().subscribe(deps => {
      this.departamentos = deps.filter(dep => dep.nombre.toLowerCase() !== 'ti' && dep.nombre.toLowerCase() !== 'recepcion');
    });
    this.loadImpresoras();
  }
  // Método que se ejecuta cuando se cambia el departamento
  onDepartamentoChange(event: any): void {
    this.departamentoSeleccionadoId = event.target.value; // Obtener el ID del departamento seleccionado
    console.log(this.departamentoSeleccionadoId);
    this.obtenerOperaciones(this.departamentoSeleccionadoId);
  }

  // Método para obtener las operaciones
  obtenerOperaciones(departamentoId: string) {
    this.recepcion.obtenerDepartamentoPorId(departamentoId).subscribe(departamento => {
      const operacionesIds: string[] = departamento.operacionesIds; // Asegúrate de que ventanillasIds es un array de strings
      console.log("Array de  ids", operacionesIds); // Asegúrate de que ves un array de IDs

      this.recepcion.getOperacionesPorDepartamento(operacionesIds).subscribe(response => {
        console.log("Array de operaciones", response); // Aquí deberías ver un array de objetos ventanillasPorId
        this.OperacionesPorDepartamento = response; // Asignamos el array de objetos a la variable ventanillasPorDepartamento
      }, error => {
        console.error('Error al obtener ventanillas:', error);
      });
    });
  }
  // Generar turno al seleccionar operación
  onOperacionChange(event: any) {
      // Verificar si el turno ya ha sido impreso
  if (this.turnoImpreso) {
    this.alert.showError("Por favor imprime el ticket antes generar un turno nuevo");
        // 🔹 Reiniciar el select de departamentos y operaciones
  // 🔹 Reiniciar el select de departamentos
  const departamentoSelect = document.getElementById('departamento') as HTMLSelectElement;
  if (departamentoSelect) {
    departamentoSelect.value = ''; // Reinicia el valor del select
  }

  // Limpiar operaciones
  this.OperacionesPorDepartamento = [];
    return; // Bloquear la creación de un nuevo turno
  }
    const operacionId = event.target.value;
    console.log("data para ti", this.OperacionesPorDepartamento)
    const operacionSeleccionada = this.OperacionesPorDepartamento.find(op => op.id == operacionId);
    const hospitalId = this.recepcion.getHospitalId();
    if (!operacionSeleccionada) return;

    const turnoRequest: crearTurno = {
      hospitalId: hospitalId,
      departamentoId: this.departamentoSeleccionadoId, // Usamos el ID guardado del departamento
      tipoOperacion: operacionSeleccionada.id // ID de la operación seleccionada
    };

    console.log("datos para generar turno ", turnoRequest)
    this.recepcion.generarTurno(turnoRequest).subscribe(turnoGenerado => {
      this.turno = turnoGenerado;

      console.log("turno generado", this.turno);

      // Guardar el turno en localStorage para mantenerlo después de recargar
      localStorage.setItem('turno', JSON.stringify(this.turno));
      this.alert.showSuccess("Se genero el turno correctamente.");
      this.turnoImpreso = true;
    // 🔹 Reiniciar el select de departamentos y operaciones
  // 🔹 Reiniciar el select de departamentos
  const departamentoSelect = document.getElementById('departamento') as HTMLSelectElement;
  if (departamentoSelect) {
    departamentoSelect.value = ''; // Reinicia el valor del select
  }

  // Limpiar operaciones
  this.OperacionesPorDepartamento = [];
     
    }, error => {
      console.error('Error al generar turno:', error);
    });
  }
  loadImpresoras() {
    this.recepcion.getImpresoras().subscribe(
      (data) => {
        console.log("data",data)
        this.impresoras = data; // Asignar los datos obtenidos al array
      },
      (error) => {
        console.error('Error al obtener impresoras', error);
      }
    );
  }
  onImpresoraChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedImpresora = selectElement.value;
    console.log(this.selectedImpresora)
  }
  // Imprimir turno
  imprimirTurno() {
    if (this.turno) {
      const contenido = `
        <html>
        <head>
          <title>Imprimir Ticket</title>
          <style>
            @page { 
              size: A7; /* Configurar tamaño de hoja A7 */
              margin: 0; /* Eliminar márgenes */
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              text-align: center;
              margin: 5px;
              padding: 5px;
            }
            .ticket {
              width: 74mm; 
              height: 105mm;
              text-align: center;
              border: 1px solid black;
              padding: 10px;
            }
            h2 {
              font-size: 14px;
              margin-bottom: 5px;
            }
            p {
              font-size: 12px;
              margin: 3px 0;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => { window.close(); }, 1000);">
          <div class="ticket">
            <h3>Ticket de Turno</h3>
            <hr>
            <p><strong>Número:</strong> ${this.turno.numeroTurno}</p>
            <p><strong>Departamento:</strong> ${this.turno.departamentoId}</p>
            <hr>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <p>Hora: ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
        </html>
      `;

      const ventanaImpresion = window.open('', '_blank');
      if (ventanaImpresion) {
        ventanaImpresion.document.write(contenido);
        ventanaImpresion.document.close();

        // Esperar a que se cargue completamente antes de imprimir
        ventanaImpresion.onload = () => {
          ventanaImpresion.print();
          setTimeout(() => {
            ventanaImpresion.close();
          }, 1000);
        };
      }
    };

  }
  imprimirTurno2(id: string) {
    if (this.selectedImpresora) {
      this.recepcion.imprimirTurno(id, this.selectedImpresora).subscribe(
        response => {
          console.log('Respuesta de impresión:', response);
          // Aquí puedes manejar la respuesta si es necesario (como mostrar un mensaje de éxito)
          this.alert.showSuccess("El ticket se ha impreso correctamente");
           // Marcar el turno como impreso
        this.turnoImpreso = false; // Cambiar la bandera a true al imprimir correctamente
        // Borrar turno de localStorage después de una impresión exitosa
        localStorage.removeItem('turno');
        const modal = document.getElementById('exampleModal') as HTMLElement;
          if (modal) {
            (modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement)?.click();
          }
        this.turno = null; // Limpiar la variable turno en la aplicación
        },
        error => {
          console.error('Error al imprimir el turno:', error);
          this.alert.showError("Ocurrio un error al imprimir el ticket revise la impresora");
          // Borrar turno de localStorage después de una impresión exitosa
          this.turnoImpreso = false;
        }
      );
    } else {
      console.log('Por favor, seleccione una impresora.');
    }
  }
  
}
