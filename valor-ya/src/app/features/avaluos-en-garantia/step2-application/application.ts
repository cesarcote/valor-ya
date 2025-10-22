import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AvaluosStepperService, AvaluosStep } from '../../../core/services/avaluos-stepper.service';
import { AvaluosStateService } from '../../../core/services/avaluos-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-avaluos-application',
  imports: [StepperComponent, ButtonComponent],
  providers: [AvaluosStepperService],
  templateUrl: './application.html',
  styleUrls: ['./application.css'],
})
export class AvaluosApplicationComponent implements OnInit {
  private router = inject(Router);
  stepperService = inject(AvaluosStepperService);
  private stateService = inject(AvaluosStateService);

  ngOnInit(): void {
    this.stepperService.setStep(AvaluosStep.SOLICITUD);
  }

  onVolver(): void {
    this.stepperService.setStep(AvaluosStep.INICIO);
    this.router.navigate(['/avaluos-en-garantia/inicio']);
  }

  onContinuar(): void {
    this.stepperService.setStep(AvaluosStep.PROCESO);
    this.router.navigate(['/avaluos-en-garantia/proceso']);
  }
}
