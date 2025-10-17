import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PredioService } from '../../../../core/services/predio.service';

@Component({
  selector: 'app-formulario-chip',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-chip.component.html',
  styleUrls: ['./formulario-chip.component.css'],
})
export class FormularioChipComponent {
  chip: string = '';
  private predioService = inject(PredioService);

  constructor(private router: Router) {}

  onVolver(): void {
    this.router.navigate(['/valor-ya']);
  }

  onConsultar(): void {
    if (!this.chip) return;

    this.predioService.consultarPorChip(this.chip).subscribe({
      next: (predioData) => {
        this.router.navigate(['/valor-ya/process'], {
          state: { predioData },
        });
      },
    });
  }
}
