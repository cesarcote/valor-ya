import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  InquiryStateService,
  TipoBusqueda,
} from '../../../../../core/services/inquiry-state.service';
import { PredioService } from '../../../../../core/services/predio.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { AlertComponent } from '../../../../../shared/components/alert/alert';

@Component({
  selector: 'app-form-chip',
  imports: [FormsModule, AlertComponent],
  templateUrl: './form-chip.html',
  styleUrls: ['./form-chip.css'],
})
export class FormChipComponent {
  private predioService = inject(PredioService);
  private stateService = inject(InquiryStateService);
  private loadingService = inject(LoadingService);

  chip = '';
  errorMessage = '';

  onConsultar(): void {
    if (!this.chip || this.chip.length < 5) {
      this.errorMessage = 'Por favor, ingrese un CHIP válido (mínimo 5 caracteres)';
      return;
    }

    this.loadingService.show();
    this.errorMessage = '';

    this.predioService
      .consultarPorChip(this.chip)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (predioData) => {
          this.stateService.setPredioData(predioData, TipoBusqueda.CHIP, this.chip);
        },
        error: (error) => {
          this.errorMessage = 'Error al consultar el predio. Por favor, intente nuevamente.';
          console.error('Error:', error);
        },
      });
  }
}
