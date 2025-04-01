import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ButtonCustomComponent } from '../../custom/button-custom/button-custom.component';
import { CommonModule } from '@angular/common';
import { RecepcionService } from '../../services/recepcion.service';
import { TurnoWebSocketServiceService } from '../../services/turno-web-socket-service.service';
import { AtencionService } from '../../services/atencion.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-atencion',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,ButtonCustomComponent,ReactiveFormsModule,FormsModule],
  templateUrl: './atencion.component.html',
  styleUrl: './atencion.component.css'
})
export class AtencionComponent {
  turnos: any[] = [];
  turnoAtendiendo: any = null;
  page: number = 1;
  estadoProceso: string = 'no_concluido'; 
  
  constructor(
    private turnoService: TurnoWebSocketServiceService,
    private atencionService: AtencionService,
    private alerta: AlertService
  ) {}
  
  ngOnInit() {
       // Recupera el turno atendido desde localStorage al cargar la página
       const turnoGuardado = localStorage.getItem('turnoAtendiendo');
       if (turnoGuardado) {
         this.turnoAtendiendo = JSON.parse(turnoGuardado);
       }
    const token = localStorage.getItem('token');
  
    if (token) {
      this.turnoService.conectarPorDepartamento(token);
    }
  
    this.turnoService.turnosDepartamento$.subscribe(turnos => {
      // Filtra los turnos pendientes y los eliminados
      const turnosPendientes = turnos.filter(turno => turno.estado === 'pendiente');
      const turnosEliminados = turnos.filter(turno => turno.estado === 'eliminado');

      // Extrae los IDs de los turnos eliminados
      const idsEliminados = turnosEliminados.map(turno => turno.id);

      // Filtra los turnos pendientes para excluir los que tengan el mismo ID que un turno eliminado
      const turnosPendientesActualizados = turnosPendientes.filter(turno => !idsEliminados.includes(turno.id));

      // Actualiza los turnos, pero evita duplicados al verificar que no estén ya en la lista
      this.turnos = [
        ...this.turnos.filter(turno => turno.estado === 'pendiente' && !idsEliminados.includes(turno.id)), // Mantén los turnos pendientes no eliminados
        ...turnosPendientesActualizados.filter(turno => !this.turnos.some(t => t.id === turno.id)) // Añade solo los nuevos turnos que no estén ya en la lista
      ];
    });
  }

  tomarTurno(id: string) {
    this.atencionService.tomarTurno(id).subscribe(
      (response) => {
        console.log('Turno tomado:', response);
        // Al tomar el turno, lo mostramos en la sección "Atendiendo"
        this.turnoAtendiendo = response;
        // Guardar el turno atendido en localStorage para persistirlo al recargar la página
        localStorage.setItem('turnoAtendiendo', JSON.stringify(response));
        // También puedes actualizar la lista de turnos para reflejar que ese turno ya fue tomado
        this.turnos = this.turnos.filter(turno => turno.id !== id);
      },
      (error) => {
        console.error('Error al tomar el turno:', error);
      }
    );
  }

  terminarProceso(id: string) {
    // Aquí podrías agregar la lógica para actualizar el proceso con el estado y finalizarlo
    console.log(`Proceso terminado. Estado: ${this.estadoProceso}`);
    // Limpiar el turno atendido tanto en la variable como en el localStorage
    this.atencionService.terminarTurno(id,this.estadoProceso).subscribe(response=>{
      console.log("turno finalizado",response)
      this.alerta.showSuccess("Turno finalizado correctamente");
    },error=>{
      console.log("Error", error)
      this.alerta.showSuccess("Algo salio mal al finalizar correctamente el turno");
    })
    this.turnoAtendiendo = null;
    localStorage.removeItem('turnoAtendiendo');  // Eliminar el turno guardado
    this.estadoProceso = 'no_concluido';  // Resetear estado
  }


  ngOnDestroy(){
    console.log('Cerrando conexión WebSocket en Home');
    this.turnoService.desconectarDepartamento();
  }
}
