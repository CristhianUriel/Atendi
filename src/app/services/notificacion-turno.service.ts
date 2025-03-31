import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionTurnoService {
  private eventSource!: EventSource;
  private turnoTomadoSubject = new Subject<any>();
  private isClosing = false; 
  private reconnectionAttempts = 0; // Contador de reintentos
  private maxReconnectionAttempts = 5; // Límite de intentos de reconexión

  constructor() {}

  conectarTurnosTomados() {
    if (this.eventSource) {
      console.warn("⚠ Cerrando conexión previa antes de abrir una nueva.");
      this.eventSource.close();
    }

    this.isClosing = false; 
    this.reconnectionAttempts = 0; // Reiniciar intentos

    const url = `http://localhost:8080/api/turnos/tomados/stream`;
    console.log("🔌 Iniciando conexión de turnos tomados...");

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log("✅ Conexión SSE establecida correctamente.");
      this.reconnectionAttempts = 0; // Reiniciar contador de intentos
    };

    this.eventSource.onmessage = (event) => {
      const turno = JSON.parse(event.data);
      console.log("📩 Nuevo turno tomado:", turno);
      this.turnoTomadoSubject.next(turno);
    };

    this.eventSource.onerror = (error) => {
      console.error("❌ Error en la conexión SSE:", error);
      
      this.eventSource.close();

      if (this.isClosing) {
        console.log("🛑 Cierre manual de SSE detectado, no se reconectará.");
        return;
      }

      this.reconnectionAttempts++;
      if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
        console.error("🚨 Se alcanzó el límite máximo de reconexiones. Deteniendo intentos.");
        return;
      }

      console.log(`🔄 Intentando reconectar en 3 segundos... Intento #${this.reconnectionAttempts}`);
      setTimeout(() => this.conectarTurnosTomados(), 3000);
    };
  }

  desconectar() {
    this.isClosing = true;
    if (this.eventSource) {
      console.log("🔌 Cerrando conexión SSE...");
      this.eventSource.close();
      this.eventSource = undefined!; // Liberar la referencia
    }
  }

  getTurnoTomadoObservable() {
    return this.turnoTomadoSubject.asObservable();
  }
}
