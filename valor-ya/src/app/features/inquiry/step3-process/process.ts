import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StepperService, InquiryStep } from '../../../core/services/stepper.service';
import { InquiryStateService } from '../../../core/services/inquiry-state.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-process',
  imports: [StepperComponent, ButtonComponent],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class ProcessComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(StepperService);
  private stateService = inject(InquiryStateService);

  predioData?: PredioData;
  isCalculating: boolean = false;
  calculationProgress: number = 0;

  ngOnInit(): void {
    this.stepperService.setStep(InquiryStep.PROCESO);

    const state = this.stateService.getState();
    if (!state.predioData) {
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.predioData = state.predioData;
    this.simularCalculo();
  }

  simularCalculo(): void {
    this.isCalculating = true;

    const interval = setInterval(() => {
      this.calculationProgress += 10;

      if (this.calculationProgress >= 100) {
        clearInterval(interval);
        this.isCalculating = false;
      }
    }, 300);
  }

  onVolver(): void {
    this.stepperService.setStep(InquiryStep.SOLICITUD);
    this.router.navigate(['/valor-ya/solicitud']);
  }

  onVerResultado(): void {
    this.stepperService.setStep(InquiryStep.RESPUESTA);
    this.router.navigate(['/valor-ya/respuesta']);
  }
}
