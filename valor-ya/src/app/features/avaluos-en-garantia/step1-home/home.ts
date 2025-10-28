import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AvaluosStepperService, AvaluosStep } from '../../../core/services/avaluos-stepper.service';
import { AvaluosStateService } from '../../../core/services/avaluos-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-avaluos-home',
  imports: [StepperComponent, ButtonComponent],
  providers: [AvaluosStepperService],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class AvaluosHome implements OnInit {
  private router = inject(Router);
  private stepperService = inject(AvaluosStepperService);
  private stateService = inject(AvaluosStateService);

  isLoading = signal(false);

  ngOnInit(): void {
    this.stepperService.setStep(AvaluosStep.INICIO);
  }

  onContinuar(): void {
    this.isLoading.set(true);
    this.stepperService.setStep(AvaluosStep.SOLICITUD);
    this.router.navigate(['/avaluos-en-garantia/solicitud']);
  }
}
