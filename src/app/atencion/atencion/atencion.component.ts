import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ButtonCustomComponent } from '../../custom/button-custom/button-custom.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-atencion',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule],
  templateUrl: './atencion.component.html',
  styleUrl: './atencion.component.css'
})
export class AtencionComponent {

}
