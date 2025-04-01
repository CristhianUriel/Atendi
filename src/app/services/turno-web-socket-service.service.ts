import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { ApiUrlService } from './api-url.service';
@Injectable({
  providedIn: 'root'
})
export class TurnoWebSocketServiceService  {
  private socket: any;

  private turnosGlobalesSubject = new BehaviorSubject<any[]>([]); // Usamos un BehaviorSubject para emitir los turnos
  turnosGlobales$ = this.turnosGlobalesSubject.asObservable(); // Creamos un Observable para ser suscrito en el componente
  
  private turnosDepartamentoSubject = new BehaviorSubject<any[]>([]);
  turnosDepartamento$ = this.turnosDepartamentoSubject.asObservable();
  private departamentoIdActual: string | null = null; 
  private reconnectInterval: any; // Para manejar el intervalo de reconexión
  private isReconnecting: boolean = false; // Estado para evitar reconexiones simultáneas

  constructor(private apiUrlService: ApiUrlService
  ) {}

  conectarGlobal(token2: string) {
    console.log("Iniciando WebSocket...");

    this.socket = webSocket({
      url: `${this.apiUrlService.getApiUrlWs()}/api/turnos/stream/global`,
      deserializer: (e: MessageEvent) => e.data,  // Desactivar la deserialización automática
      openObserver: {
        next: () => {
          console.log('Conexión WebSocket abierta');
          this.socket?.next({ token: `Bearer ${token2}` });
          
        },
      },
      closeObserver: {
        next: () => {
          console.log('Conexión WebSocket cerrada');
          this.handleReconnection();
        },
      },
    });

    this.socket.subscribe({
      next: (turno: string) => {
        try {
          // El turno ya es una cadena de texto, lo procesamos como tal
          console.log('Nuevo turno recibido:', turno);

          // Parsear el turno usando la función parseTurno
          const turnoParsed = this.parseTurno(turno);

          // Actualizar el estado de los turnos
          this.turnosGlobalesSubject.next([...this.turnosGlobalesSubject.value, turnoParsed]);
        } catch (error) {
          console.error('Error al procesar el mensaje WebSocket:', error, turno);
        }
      },
      error: (error: Error) => {
        console.error('Error en WebSocket:', error);
      },
    });
  }
  // Función para manejar la reconexión
  handleReconnection() {
    if (!this.isReconnecting) {
      this.isReconnecting = true;
      console.log('Intentando reconectar...');

      // Intentar reconectar después de un pequeño retraso (ej. 5 segundos)
      this.reconnectInterval = setTimeout(() => {
        console.log('Reintentando conexión WebSocket...');
        this.isReconnecting = false; // Restablecer el estado de reconexión
        this.conectarGlobal(localStorage.getItem('token') || ''); // Volver a intentar la conexión con el token
      }, 5000); // Intentar reconectar cada 5 segundos
    }
  }
  handleReconnectionDep() {
    if (!this.isReconnecting) {
      this.isReconnecting = true;
      console.log('Intentando reconectar...');

      // Intentar reconectar después de un pequeño retraso (ej. 5 segundos)
      this.reconnectInterval = setTimeout(() => {
        console.log('Reintentando conexión WebSocket...');
        this.isReconnecting = false; // Restablecer el estado de reconexión
        this.conectarPorDepartamento(localStorage.getItem('token') || ''); // Volver a intentar la conexión con el token
      }, 5000); // Intentar reconectar cada 5 segundos
    }
  }
  
  conectarPorDepartamento(token2: string) {
    console.log("Iniciando WebSocket...");

    let departamentoId: string | null = null;
    try {
      const decodedToken: any = jwtDecode(token2);
      departamentoId = decodedToken.departamentoId;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }

    if (!departamentoId) {
      console.error("No se pudo obtener el departamentoId del token");
      return;
    }

    // Si el departamento es diferente al actual, limpiar los turnos
    if (this.departamentoIdActual !== departamentoId) {
      console.log("Cambiando de departamento, limpiando turnos...");
      this.turnosDepartamentoSubject.next([]); // Limpiar turnos
      this.departamentoIdActual = departamentoId; // Actualizar el departamento actual
    }

    this.socket = webSocket({
      url: `${this.apiUrlService.getApiUrlWs()}/api/turnos/stream/departamento`,
      deserializer: (e: MessageEvent) => e.data,
      openObserver: {
        next: () => {
          console.log(`Conexión WebSocket abierta para el departamento ${departamentoId}`);
          this.socket?.next({ token: `Bearer ${token2}`, departamentoId: departamentoId });
        },
      },
      closeObserver: {
        next: () => {
          console.log(`Conexión WebSocket cerrada para el departamento ${departamentoId}`);
          this.handleReconnectionDep();
        },
      },
    });

    this.socket.subscribe({
      next: (turno: string) => {
        try {
          console.log('Nuevo turno recibido:', turno);
          const turnoParsed = this.parseTurno(turno);

          // Solo agregar el turno si es del departamento actual
          if (turnoParsed.departamentoId === departamentoId) {
            this.turnosDepartamentoSubject.next([...this.turnosDepartamentoSubject.value, turnoParsed]);
          }
        } catch (error) {
          console.error('Error al procesar el mensaje WebSocket:', error, turno);
        }
      },
      error: (error: Error) => {
        console.error('Error en WebSocket:', error);
      },
    });
  }


  // Función para parsear el formato personalizado del turno
  parseTurno(turno: string): any {
    // Usamos una expresión regular para extraer los valores del texto
    const turnoMatch = turno.match(/TurnoDTO\(id=(.*?),\s*numeroTurno=(.*?),\s*hospitalId=(.*?),\s*departamentoId=(.*?),\s*tipoOperacionId=(.*?),\s*tipoOperacionNombre=(.*?),\s*atendidoPor=(.*?),\s*estado=(.*?),\s*horaCreacion=(.*?),\s*horaAtencion=(.*?)\)/);
    if (turnoMatch) {
      return {
        id: turnoMatch[1],
        numeroTurno: turnoMatch[2],
        hospitalId: turnoMatch[3],
        departamentoId: turnoMatch[4],
        tipoOperacionId: turnoMatch[5],
        tipoOperacionNombre: turnoMatch[6],
        atendidoPor:turnoMatch[7],
        estado: turnoMatch[8],
        horaCreacion: turnoMatch[9],
        horaAtencion: turnoMatch[10] || null
      };
    } else {
      console.error('Formato de turno no válido:', turno);
      return {};
    }
  }
// Desconectar WebSocket Global
desconectarGlobal() {
  console.log('Desconectando WebSocket Global...');

  if (this.socket) {
    this.socket.unsubscribe(); // Desuscribirse del WebSocket
    this.socket.complete(); // Cerrar el WebSocket correctamente
    this.socket = null; // Eliminar referencia
  }

  this.turnosGlobalesSubject.next([]); // Limpiar los turnos globales

  if (this.reconnectInterval) {
    clearTimeout(this.reconnectInterval);
    this.reconnectInterval = null;
  }

  console.log('WebSocket Global desconectado.');
}

// Desconectar WebSocket Departamento
desconectarDepartamento() {
  console.log('Desconectando WebSocket Departamento...');

  if (this.socket) {
    this.socket.unsubscribe(); // Desuscribirse del WebSocket
    this.socket.complete(); // Cerrar el WebSocket correctamente
    this.socket = null; // Eliminar referencia
  }

  this.departamentoIdActual = null; 
  this.turnosDepartamentoSubject.next([]); // Limpiar los turnos del departamento

  if (this.reconnectInterval) {
    clearTimeout(this.reconnectInterval);
    this.reconnectInterval = null;
  }

  console.log('WebSocket Departamento desconectado.');
}

// Desconectar ambos WebSockets
desconectar() {
  console.log('Desconectando ambos WebSockets...');
  this.desconectarGlobal();
  this.desconectarDepartamento();
}

}  