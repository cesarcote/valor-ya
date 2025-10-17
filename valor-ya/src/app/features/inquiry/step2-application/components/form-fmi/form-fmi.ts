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
  selector: 'app-form-fmi',
  imports: [ReactiveFormsModule, AlertComponent, InputComponent],
  templateUrl: './form-fmi.html',
  styleUrls: ['./form-fmi.css'],
})
export class FormFmiComponent {
  private predioService = inject(PredioService);
  private stateService = inject(InquiryStateService);
  private loadingService = inject(LoadingService);

  zonaControl = new FormControl('', [Validators.required]);
  matriculaControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  
  errorMessage = '';

  zonas = [
    { value: '50C', label: '50C-Bogota Zona Centro' },
    { value: '50S', label: '50S-Bogotá Zona Sur' },
    { value: '50N', label: '50N-Bogotá Zona Norte' },
  ];

  onConsultar(): void {
    if (this.zonaControl.invalid || this.matriculaControl.invalid) {
      this.zonaControl.markAsTouched();
      this.matriculaControl.markAsTouched();
      return;
    }

    this.loadingService.show();
    this.errorMessage = '';

    this.predioService
      .consultarPorFMI(this.zonaControl.value!, this.matriculaControl.value!)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (predioData) => {
          const valorBusqueda = `${this.zonaControl.value}-${this.matriculaControl.value}`;
          this.stateService.setPredioData(predioData, TipoBusqueda.FMI, valorBusqueda);
        },
        error: (error) => {
          this.errorMessage = 'Error al consultar el predio. Por favor, intente nuevamente.';
          console.error('Error:', error);
        },
      });
  }
}