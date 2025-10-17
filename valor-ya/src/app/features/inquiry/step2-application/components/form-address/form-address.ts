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
  selector: 'app-form-address',
  imports: [FormsModule, AlertComponent],
  templateUrl: './form-address.html',
  styleUrls: ['./form-address.css'],
})
export class FormAddressComponent {
  private predioService = inject(PredioService);
  private stateService = inject(InquiryStateService);
  private loadingService = inject(LoadingService);

  direccion = '';
  errorMessage = '';

  onConsultar(): void {
    if (!this.direccion || this.direccion.length < 5) {
      this.errorMessage = 'Por favor, ingrese una dirección válida';
      return;
    }

    this.loadingService.show();
    this.errorMessage = '';

    this.predioService
      .consultarPorDireccion(this.direccion)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (predioData) => {
          this.stateService.setPredioData(predioData, TipoBusqueda.DIRECCION, this.direccion);
        },
        error: (error) => {
          this.errorMessage = 'Error al consultar el predio. Por favor, intente nuevamente.';
          console.error('Error:', error);
        },
      });
  }
}
