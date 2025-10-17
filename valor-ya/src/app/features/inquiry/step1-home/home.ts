import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StepperService, InquiryStep } from '../../../core/services/stepper.service';
import { InquiryStateService, TipoBusqueda } from '../../../core/services/inquiry-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';

@Component({
  selector: 'app-home',
  imports: [StepperComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(StepperService);
  private stateService = inject(InquiryStateService);

  ngOnInit(): void {
    this.stepperService.setStep(InquiryStep.INICIO);
  }

  onCardClick(type: string): void {
    let tipoBusqueda: TipoBusqueda;

    switch (type) {
      case 'direccion':
        tipoBusqueda = TipoBusqueda.DIRECCION;
        break;
      case 'chip':
        tipoBusqueda = TipoBusqueda.CHIP;
        break;
      case 'folio':
        tipoBusqueda = TipoBusqueda.FMI;
        break;
      default:
        return;
    }

    this.stateService.setTipoBusqueda(tipoBusqueda);

    this.stepperService.setStep(InquiryStep.SOLICITUD);

    this.router.navigate(['/valor-ya/solicitud']);
  }
}
