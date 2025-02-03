import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [MatGridListModule,CommonModule],
  templateUrl: './recepcionista.component.html',
  styleUrl: './recepcionista.component.css'
})
export class RecepcionistaComponent {

}
