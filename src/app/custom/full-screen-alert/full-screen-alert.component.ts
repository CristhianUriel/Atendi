import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-full-screen-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './full-screen-alert.component.html',
  styleUrl: './full-screen-alert.component.css'
})
export class FullScreenAlertComponent implements OnInit {
  @Input() alertMessage: string = '';
  @Input() showAlert: boolean = false;

  constructor() { }

  ngOnInit(): void {
    if (this.showAlert) {
      // Cerrar la alerta después de 3 segundos
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    }
  }
}
