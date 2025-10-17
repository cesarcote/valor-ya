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
  selector: 'app-form-fmi',
  imports: [FormsModule, AlertComponent],
  templateUrl: './form-fmi.html',
  styleUrls: ['./form-fmi.css'],
})
export class FormFmiComponent {
  private predioService = inject(PredioService);
  private stateService = inject(InquiryStateService);
  private loadingService = inject(LoadingService);

  zona = '';
  matricula = '';
  errorMessage = '';

  zonas = [
    { value: '50C', label: '50C-Bogota Zona Centro' },
    { value: '50S', label: '50S-Bogotá Zona Sur' },
    { value: '50N', label: '50N-Bogotá Zona Norte' },
  ];

  onConsultar(): void {
    if (!this.zona || !this.matricula) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    this.loadingService.show();
    this.errorMessage = '';

    this.predioService
      .consultarPorFMI(this.zona, this.matricula)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (predioData) => {
          const valorBusqueda = `${this.zona}-${this.matricula}`;
          this.stateService.setPredioData(predioData, TipoBusqueda.FMI, valorBusqueda);
        },
        error: (error) => {
          this.errorMessage = 'Error al consultar el predio. Por favor, intente nuevamente.';
          console.error('Error:', error);
        },
      });
  }
}
