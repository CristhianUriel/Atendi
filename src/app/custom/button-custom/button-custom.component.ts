import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-button-custom',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './button-custom.component.html',
  styleUrl: './button-custom.component.css'
})
export class ButtonCustomComponent {
  constructor(private router: Router){

  }
  logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
