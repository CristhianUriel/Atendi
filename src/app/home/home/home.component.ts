import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { TurnoWebSocketServiceService } from '../../services/turno-web-socket-service.service';
import { NotificacionTurnoService } from '../../services/notificacion-turno.service';
import { VideosService } from '../../services/videos.service';
import { SocketIoConfig, SocketIoModule, Socket } from 'ngx-socket-io';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription,map,startWith,bufferTime } from 'rxjs';
import { FullScreenAlertComponent } from '../../custom/full-screen-alert/full-screen-alert.component';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SocketIoModule, FullScreenAlertComponent, NgxPaginationModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  turnos: any[] = [];
  page: number = 1;
  videoUrl: SafeUrl | null = null;
  alertMessage: string = '';  // Mensaje del alert
  showAlert: boolean = false;  // Controlar si mostrar el alert
  turnoTomado: any = null; // Turno que se está atendiendo
  turnoSubscription: Subscription = new Subscription(); // Para almacenar la suscripción
  cargando: boolean = true
  idsEliminados: Set<string> = new Set();

  constructor(
    private turnoService: TurnoWebSocketServiceService,
    private notificacion: NotificacionTurnoService,
    private videoService: VideosService,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef) { }

  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  videoIndex = 0;
  baseUrl = "http://localhost:8080/videos/stream/"; // Endpoint del backend
  currentVideoUrl = this.baseUrl + this.videoIndex;

  ngAfterViewInit() {
    this.loadVideo();
  }


  ngOnInit(): void {


    const token = localStorage.getItem('token');
    if (token) {
      // Llamar al método de conexión SSE con el token
      this.notificacion.conectarTurnosTomados();
      this.turnoService.conectarGlobal(token);
      
      this.turnoService.turnosGlobales$.pipe(
        map((turnos: any[]) => { // Aquí especificamos que 'turnos' es un array de 'TurnoDTO'
          // Filtrar los turnos eliminados y agregarlos a un set para su posterior verificación
          const idsEliminados = new Set(
            turnos.filter(turno => turno.estado === 'eliminado').map(turno => turno.id)
          );
      
          // Filtrar los turnos pendientes, excluyendo aquellos cuyo id esté en el set de eliminados
          const turnosFiltrados = turnos.filter(turno => 
            turno.estado === 'pendiente' && !idsEliminados.has(turno.id)
          );
      
          return { turnosFiltrados, idsEliminados };
        })
      ).subscribe(({ turnosFiltrados, idsEliminados }) => {
        // Mostrar spinner solo si estamos procesando los turnos
        this.cargando = true;
      
        // Usamos un setTimeout para simular un breve proceso de actualización, de modo que el spinner se vea un poco más
        setTimeout(() => {
          // Ahora aseguramos que solo se muestren los turnos pendientes luego de que se hayan procesado los eliminados
          this.idsEliminados = idsEliminados;
          this.turnos = turnosFiltrados; // Asignamos los turnos filtrados a la vista
          this.cargando = false; // Ocultamos el spinner después de actualizar
        }, 500);
      });
      
      // Suscribirse a los turnos tomados (IMPORTANTE: Reactivar la suscripción)
      this.turnoSubscription = this.notificacion.getTurnoTomadoObservable().subscribe(turno => {
        console.log("📩 Turno tomado recibido:", turno);
        this.recibirTurnoTomado(turno); // Lógica para recibir y manejar el turno tomado
      });
      
      
      // Suscribirse a los turnos tomados (IMPORTANTE: Reactivar la suscripción)
      this.turnoSubscription = this.notificacion.getTurnoTomadoObservable().subscribe(turno => {
        console.log("📩 Turno tomado recibido:", turno);
        this.recibirTurnoTomado(turno);
      });
      
      

      // Suscribirse a los turnos tomados (IMPORTANTE: Reactivar la suscripción)
      this.turnoSubscription = this.notificacion.getTurnoTomadoObservable().subscribe(turno => {
        console.log("📩 Turno tomado recibido:", turno);
        this.recibirTurnoTomado(turno);
      });
    } else {
      console.error('Token no encontrado en localStorage');
    }
  }

  loadVideo() {
    fetch(this.currentVideoUrl, {
      headers: {
        "Range": "bytes=0-" // Asegurar que el navegador pide el video en chunks
      }
    })
      .then(response => {
        // Verifica si la respuesta fue exitosa (código 2xx) o no
        if (!response.ok) {
          // Si la respuesta es 404 o cualquier otra respuesta de error
          if (response.status === 404) {
            console.warn("⚠ No hay más videos, reiniciando...");
            this.videoIndex = 0;  // Reinicia el índice al primer video
            this.currentVideoUrl = this.baseUrl + this.videoIndex; // Actualiza la URL
            this.loadVideo();
            return;  // Detiene la ejecución y evita continuar con la promesa
          } else {
            console.error(`❌ Error en la carga del video, status: ${response.status}`);
            return;  // Detiene la ejecución si hay otro error
          }
        }
        return response.blob();  // Esto devuelve un Blob o undefined
      })
      .then(blob => {
        if (blob) {  // Verifica si el blob es válido (no es undefined)
          const videoUrl = URL.createObjectURL(blob);
          this.videoPlayer.nativeElement.src = videoUrl;
          this.videoPlayer.nativeElement.load();
          this.videoPlayer.nativeElement.play();
        } else {
          console.error("❌ Error: El blob está vacío o no es válido.");
        }
      })
      .catch(error => console.error("❌ Error cargando el video:", error));
  }


  loadNextVideo() {
    console.log("⏭ Cambiando al siguiente video...");
    this.videoIndex++;
    this.currentVideoUrl = this.baseUrl + this.videoIndex;
    this.loadVideo();
  }
  // Método que se llama cuando un turno es tomado
  recibirTurnoTomado(turno: any) {
    console.log('Turno recibido en HomeComponent:', turno);
    this.showAlertMessage(turno);  // Mostrar el alert con los datos del turno
 // Actualizar la lista de turnos eliminados en base a la lógica de turnos tomados
 this.idsEliminados.add(turno.id);
  }

  showAlertMessage(turno: any) {
    this.alertMessage = `Turno ${turno.numeroTurno} - ${turno.tipoOperacionNombre} tomado por ${turno.atendidoPor}.`;
    this.showAlert = true;

    // Forzar la actualización de la vista para asegurar que se refleje el cambio
    this.cdRef.detectChanges();

    // Mostrar el mensaje durante 3 segundos y luego ocultarlo
    setTimeout(() => {
      this.showAlert = false;
      this.cdRef.detectChanges();  // Forzar actualización de la vista cuando se oculta el mensaje
    }, 3000);
  }

  // Eliminar el turno de la lista de turnos
  removeTurnoFromList(turno: any) {
    this.turnos = this.turnos.filter(t => t.id !== turno.id);
  }
  logout() {
    console.log('🔴 Cerrando sesión...');

    // Cerrar conexiones correctamente
    this.ngOnDestroy();

    // Limpiar localStorage
    localStorage.removeItem('token');

    // Esperar un poco antes de redirigir para asegurar que SSE se cierra
    setTimeout(() => {
      window.location.href = "/login";  // Redirigir al login
    }, 500);
  }

  ngOnDestroy() {
    console.log('🔌 Desconectando SSE y WebSockets...');

    // Cerrar WebSocket
    this.turnoService.desconectarGlobal();

    // Cerrar conexión SSE (con nueva protección)
    this.notificacion.desconectar();

    // Cancelar suscripción
    this.turnoSubscription.unsubscribe();
  }


}
