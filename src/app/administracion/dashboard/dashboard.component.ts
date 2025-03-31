import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonCustomComponent } from '../../custom/button-custom/button-custom.component';
import { GraficasService } from '../../services/graficas.service';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, LineController, registerables } from 'chart.js';
Chart.register(...registerables);
//import { Departamento, Operaciones } from '../../models/models';
import { RegisterUserService } from '../../services/register-user.service';
import { CommonModule } from '@angular/common';
import { RegisterProcessService } from '../../services/register-process.service';

// Registrar explícitamente todos los controladores y elementos necesarios
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, LineController);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, ButtonCustomComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  formXFecha: FormGroup;
  formXUser: FormGroup;
  formXDep: FormGroup;
  formXOpe: FormGroup;
  hospitalId: string = '';
  graficoData: any;
  chartInstance: Chart | null = null;  // Guardamos la instancia del gráfico
  chartUser: Chart | null = null;

  /// Arrays de usuarios,departamentos y operaciones
  Usuarios: any[] = []
  Departamentos: any[] = []
  Operaciones: any[] = []

  constructor(private router: Router,
    private fb: FormBuilder,
    private graficos: GraficasService,
    private users: RegisterUserService,
    private depAndPro: RegisterProcessService
  ) {
    this.hospitalId = this.graficos.getHospitalId();

    // Inicializar el formulario
    this.formXFecha = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
    });

    this.formXUser = this.fb.group({
      usuarioId: ['', Validators.required],

    });

    this.formXDep = this.fb.group({
      departamentoId: ['', Validators.required],

    });

    this.formXOpe = this.fb.group({
      operacionId: ['', Validators.required],

    });
  }

  ngOnInit() {
    this.users.getUsuarios().subscribe(users => {
      this.Usuarios = users.filter(user => user.rol === 'ventanilla');
    });
    this.depAndPro.getDepartamentos().subscribe(deps => {
      this.Departamentos = deps.filter(dep => dep.nombre.toLowerCase() !== 'ti' && dep.nombre.toLowerCase() !== 'recepcion');
    });
    this.depAndPro. getProcesos().subscribe(ops => {
      this.Operaciones = ops
      console.log(this.Operaciones)
    });
  }

  ///Apartado para la grafica por fechas
  graficarPorFechas(): void {
    if (this.formXFecha.valid) {
      const { fechaInicio, fechaFin } = this.formXFecha.value;
      this.graficos.obtenerTurnosPorFecha(this.hospitalId, fechaInicio, fechaFin).subscribe((Turnos) => {
        this.generarGrafico(Turnos);
      });
    }
  }

  generarGrafico(turnos: any[]): void {
    const labels = this.obtenerFechasEntreRango(this.formXFecha.value.fechaInicio, this.formXFecha.value.fechaFin);
    const turnosConcluidos = new Array(labels.length).fill(0);
    const turnosNoConcluidos = new Array(labels.length).fill(0);

    turnos.forEach((turno) => {
      const fecha = new Date(turno.horaCreacion).toISOString().split('T')[0];
      const index = labels.indexOf(fecha);

      if (index >= 0) {
        if (turno.estado === 'concluido') {
          turnosConcluidos[index]++;
        } else {
          turnosNoConcluidos[index]++;
        }
      }
    });

    const ctx = (document.getElementById('myChart') as HTMLCanvasElement).getContext('2d');
    const canvasElement = document.getElementById('myChart') as HTMLCanvasElement;

    if (canvasElement) {
      // Agregar clase al canvas
      canvasElement.classList.add('shadow-hover');
      if (ctx) {
        // Destruir cualquier gráfico existente antes de crear uno nuevo
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Concluidos',
                data: turnosConcluidos,
                borderColor: 'green',
                fill: false,
              },
              {
                label: 'No Concluidos',
                data: turnosNoConcluidos,
                borderColor: 'red',
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,  // Habilita el redimensionamiento
            maintainAspectRatio: false,  // Permite que se ajuste al contenedor
            aspectRatio: 2,  // Controla la relación entre ancho y altura
          }
        });

      }
    }

  }

  obtenerFechasEntreRango(fechaInicio: string, fechaFin: string): string[] {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const fechas = [];

    while (start <= end) {
      fechas.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }

    return fechas;
  }
  ///Apartado para la grafica por usuario
  graficarPorUsers(): void {
    if (this.formXUser.valid) {
      const usuarioId = this.formXUser.value.usuarioId;
      console.log(usuarioId)
      this.graficos.obtenerTurnosPorUsers(usuarioId).subscribe((turnos) => {
        console.log(turnos)
        this.generarGraficoPorUsuarios(turnos);
      });
    }
  }

  generarGraficoPorUsuarios(turnos: any[]): void {
    // Definir un tipo para el objeto de fechas con los contadores
    interface TurnosPorFecha {
      [fecha: string]: {
        concluidos: number;
        noConcluidos: number;
      };
    }

    // Crear el objeto con la firma de índice
    const turnosPorFecha: TurnosPorFecha = {};

    turnos.forEach((turno) => {
      // Convertir la fecha de creación a formato "YYYY-MM-DD"
      const fecha = new Date(turno.horaCreacion).toISOString().split('T')[0];

      // Si la fecha no existe en el objeto, inicializamos las cuentas
      if (!turnosPorFecha[fecha]) {
        turnosPorFecha[fecha] = { concluidos: 0, noConcluidos: 0 };
      }

      // Contar los turnos concluidos y no concluidos por fecha
      if (turno.estado === 'concluido') {
        turnosPorFecha[fecha].concluidos++;
      } else {
        turnosPorFecha[fecha].noConcluidos++;
      }
    });

    // Obtener las fechas (labels) y los datos para los gráficos
    const fechas = Object.keys(turnosPorFecha);
    const turnosConcluidos = fechas.map(fecha => turnosPorFecha[fecha].concluidos);
    const turnosNoConcluidos = fechas.map(fecha => turnosPorFecha[fecha].noConcluidos);

    const ctx = (document.getElementById('myChartUser') as HTMLCanvasElement).getContext('2d');
    const canvasElement = document.getElementById('myChartUser') as HTMLCanvasElement;

    if (canvasElement) {
      // Agregar clase al canvas
      canvasElement.classList.add('shadow-hover');
      if (ctx) {
        // Destruir cualquier gráfico existente antes de crear uno nuevo
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
          type: 'bar', // Tipo de gráfico: barra
          data: {
            labels: fechas, // Etiquetas por cada fecha
            datasets: [
              {
                label: 'Concluidos',
                data: turnosConcluidos,
                backgroundColor: 'green',
                borderColor: 'green',
                borderWidth: 1
              },
              {
                label: 'No Concluidos',
                data: turnosNoConcluidos,
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Fecha'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Cantidad de Turnos'
                }
              }
            }
          }
        });
      }
    }

  }




  ///Apartado para la grafica por departamento
  graficarPorDepartamento(): void {
    if (this.formXDep.valid) {
      const departamentoId = this.formXDep.value.departamentoId; // Obtener hospitalId del formulario
      console.log(departamentoId,this.hospitalId)

      // Llamar al servicio con hospitalId
      this.graficos.obtenerTurnosPorDepartamentos(this.hospitalId,departamentoId).subscribe((turnos) => {
        console.log("tureno", turnos);
        this.generarGraficoPorDepartamentos(turnos);
      });
    }
  }

  generarGraficoPorDepartamentos(turnos: any[]): void {
    interface TurnosPorFecha {
      [fecha: string]: {
        concluidos: number;
        noConcluidos: number;
      };
    }

    const turnosPorFecha: TurnosPorFecha = {};

    turnos.forEach((turno) => {
      const fecha = new Date(turno.horaCreacion).toISOString().split('T')[0];

      if (!turnosPorFecha[fecha]) {
        turnosPorFecha[fecha] = { concluidos: 0, noConcluidos: 0 };
      }

      if (turno.estado === 'concluido') {
        turnosPorFecha[fecha].concluidos++;
      } else {
        turnosPorFecha[fecha].noConcluidos++;
      }
    });

    const fechas = Object.keys(turnosPorFecha);
    const turnosConcluidos = fechas.map(fecha => turnosPorFecha[fecha].concluidos);
    const turnosNoConcluidos = fechas.map(fecha => turnosPorFecha[fecha].noConcluidos);

    const canvasElement = document.getElementById('myChartDeps') as HTMLCanvasElement;
    const ctx = canvasElement.getContext('2d');

    if (canvasElement) {
      canvasElement.classList.add('shadow-hover');

      if (ctx) {
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: fechas,
            datasets: [
              {
                label: 'Concluidos',
                data: turnosConcluidos,
                backgroundColor: 'green',
                borderColor: 'green',
                borderWidth: 1
              },
              {
                label: 'No Concluidos',
                data: turnosNoConcluidos,
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Fecha'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Cantidad de Turnos'
                }
              }
            }
          }
        });
      }
    }
  }

  ///Apartado para la grafica por operaciones
  graficarPorOperaciones(): void {
    if (this.formXOpe.valid) {
      const operacionId = this.formXOpe.value.operacionId; // Obtener hospitalId del formulario
      console.log(this.hospitalId,operacionId)

      // Llamar al servicio con hospitalId
      this.graficos.obtenerTurnosPorOperaciones(this.hospitalId,operacionId).subscribe((turnos) => {
        console.log("tureno", turnos);
        this.generarGraficoPorOperaciones(turnos);
      });
    }
  }

  generarGraficoPorOperaciones(turnos: any[]): void {
    interface TurnosPorFecha {
      [fecha: string]: {
        concluidos: number;
        noConcluidos: number;
      };
    }

    const turnosPorFecha: TurnosPorFecha = {};

    turnos.forEach((turno) => {
      const fecha = new Date(turno.horaCreacion).toISOString().split('T')[0];

      if (!turnosPorFecha[fecha]) {
        turnosPorFecha[fecha] = { concluidos: 0, noConcluidos: 0 };
      }

      if (turno.estado === 'concluido') {
        turnosPorFecha[fecha].concluidos++;
      } else {
        turnosPorFecha[fecha].noConcluidos++;
      }
    });

    const fechas = Object.keys(turnosPorFecha);
    const turnosConcluidos = fechas.map(fecha => turnosPorFecha[fecha].concluidos);
    const turnosNoConcluidos = fechas.map(fecha => turnosPorFecha[fecha].noConcluidos);

    const canvasElement = document.getElementById('myChartOps') as HTMLCanvasElement;
    const ctx = canvasElement.getContext('2d');

    if (canvasElement) {
      canvasElement.classList.add('shadow-hover');

      if (ctx) {
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: fechas,
            datasets: [
              {
                label: 'Concluidos',
                data: turnosConcluidos,
                backgroundColor: 'green',
                borderColor: 'green',
                borderWidth: 1
              },
              {
                label: 'No Concluidos',
                data: turnosNoConcluidos,
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Fecha'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Cantidad de Turnos'
                }
              }
            }
          }
        });
      }
    }
  }
}
