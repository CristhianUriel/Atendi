import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router){}
  logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
