import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StepperService, InquiryStep } from '../../../core/services/stepper.service';
import { InquiryStateService, TipoBusqueda } from '../../../core/services/inquiry-state.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { FormChipComponent } from './components/form-chip/form-chip';
import { FormAddressComponent } from './components/form-address/form-address';
import { FormFmiComponent } from './components/form-fmi/form-fmi';

@Component({
  selector: 'app-application',
  imports: [StepperComponent, FormChipComponent, FormAddressComponent, FormFmiComponent],
  templateUrl: './application.html',
  styleUrls: ['./application.css'],
})
export class ApplicationComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(StepperService);
  stateService = inject(InquiryStateService);

  tipoBusquedaActual: TipoBusqueda | undefined;
  mostrarResultado: boolean = false;
  predioData?: PredioData;

  readonly TipoBusqueda = TipoBusqueda;

  ngOnInit(): void {
    this.stepperService.setStep(InquiryStep.SOLICITUD);

    this.stateService.state$.subscribe((state) => {
      this.tipoBusquedaActual = state.tipoBusqueda;
      this.mostrarResultado = state.mostrarResultado;
      this.predioData = state.predioData;
    });

    if (!this.tipoBusquedaActual) {
      this.router.navigate(['/valor-ya/inicio']);
    }
  }

  onTabChangeSimple(tipo: TipoBusqueda): void {
    this.stateService.setTipoBusqueda(tipo);
    this.stateService.setMostrarResultado(false);
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(InquiryStep.INICIO);
    this.router.navigate(['/valor-ya/inicio']);
  }

  onContinuar(): void {
    this.stepperService.setStep(InquiryStep.PROCESO);
    this.router.navigate(['/valor-ya/proceso']);
  }
}
