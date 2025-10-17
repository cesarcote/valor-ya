import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  onCardClick(type: string): void {
    switch (type) {
      case 'direccion':
        this.router.navigate(['/valor-ya/direccion-catastral']);
        break;
      case 'chip':
        this.router.navigate(['/valor-ya/chip']);
        break;
      case 'folio':
        this.router.navigate(['/valor-ya/fmi']);
        break;
    }
  }
}
