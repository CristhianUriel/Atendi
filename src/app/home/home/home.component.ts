import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatListModule} from '@angular/material/list'
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatListModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
turnos: any[] =[];
}
