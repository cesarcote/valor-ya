import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PredioService } from '../../../../core/services/predio.service';

@Component({
  selector: 'app-formulario-direccion-catastral',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-direccion-catastral.component.html',
  styleUrls: ['./formulario-direccion-catastral.component.css'],
})
export class FormularioDireccionCatastralComponent {
  direccion: string = '';
  private predioService = inject(PredioService);

  constructor(private router: Router) {}

  onVolver(): void {
    this.router.navigate(['/valor-ya']);
  }

  onConsultar(): void {
    if (!this.direccion) return;

    this.predioService.consultarPorDireccion(this.direccion).subscribe({
      next: (predioData) => {
        this.router.navigate(['/valor-ya/process'], {
          state: { predioData },
        });
      },
    });
  }
}
