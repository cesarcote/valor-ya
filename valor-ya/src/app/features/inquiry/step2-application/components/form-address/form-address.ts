import { Component, inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  InquiryStateService,
  TipoBusqueda,
} from '../../../../../core/services/inquiry-state.service';
import { PredioService } from '../../../../../core/services/predio.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { AlertComponent } from '../../../../../shared/components/alert/alert';
import { InputComponent } from '../../../../../shared/components/input/input';

@Component({
  selector: 'app-form-address',
  imports: [ReactiveFormsModule, AlertComponent, InputComponent],
  templateUrl: './form-address.html',
  styleUrls: ['./form-address.css'],
})
export class FormAddressComponent {
  private predioService = inject(PredioService);
  private stateService = inject(InquiryStateService);
  private loadingService = inject(LoadingService);

  direccionControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  errorMessage = '';

  onConsultar(): void {
    if (this.direccionControl.invalid) {
      this.direccionControl.markAsTouched();
      return;
    }

    this.loadingService.show();
    this.errorMessage = '';

    this.predioService
      .consultarPorDireccion(this.direccionControl.value!)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (predioData) => {
          this.stateService.setPredioData(
            predioData,
            TipoBusqueda.DIRECCION,
            this.direccionControl.value!
          );
        },
        error: (error) => {
          this.errorMessage = 'Error al consultar el predio. Por favor, intente nuevamente.';
          console.error('Error:', error);
        },
      });
  }
}
