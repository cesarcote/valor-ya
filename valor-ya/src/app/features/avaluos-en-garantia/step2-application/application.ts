import { Component, inject, OnInit, signal } from '@angular/core';
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
export class AvaluosApplication implements OnInit {
  private router = inject(Router);
  private stepperService = inject(AvaluosStepperService);
  private stateService = inject(AvaluosStateService);

  isLoading = signal(false);

  ngOnInit(): void {
    this.stepperService.setStep(AvaluosStep.SOLICITUD);
  }

  onVolver(): void {
    this.stepperService.setStep(AvaluosStep.INICIO);
    this.router.navigate(['/avaluos-en-garantia/inicio']);
  }

  onContinuar(): void {
    this.isLoading.set(true);
    this.stepperService.setStep(AvaluosStep.PROCESO);
    this.router.navigate(['/avaluos-en-garantia/proceso']);
  }
}
