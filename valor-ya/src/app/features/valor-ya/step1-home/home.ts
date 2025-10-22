import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';

@Component({
  selector: 'app-home',
  imports: [StepperComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.INICIO);
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

    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    this.router.navigate(['/valor-ya/solicitud']);
  }
}
