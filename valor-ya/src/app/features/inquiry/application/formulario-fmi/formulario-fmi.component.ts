import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PredioService } from '../../../../core/services/predio.service';

@Component({
  selector: 'app-formulario-fmi',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-fmi.component.html',
  styleUrls: ['./formulario-fmi.component.css'],
})
export class FormularioFmiComponent {
  zona: string = '';
  matricula: string = '';
  private predioService = inject(PredioService);

  zonas = [
    { value: '50C', label: '50C-Bogota Zona Centro' },
    { value: '50S', label: '50S-Bogotá Zona Sur' },
    { value: '50N', label: '50N-Bogotá Zona Norte' },
  ];

  constructor(private router: Router) {}

  onVolver(): void {
    this.router.navigate(['/valor-ya']);
  }

  onConsultar(): void {
    if (!this.zona || !this.matricula) return;

    this.predioService.consultarPorFMI(this.zona, this.matricula).subscribe({
      next: (predioData) => {
        this.router.navigate(['/valor-ya/process'], {
          state: { predioData },
        });
      },
    });
  }
}
