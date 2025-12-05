import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AvaluosStepperService, AvaluosStep } from '../services/avaluos-stepper.service';
import { AvaluosStateService } from '../services/avaluos-state.service';
import { StepperComponent } from '../../../shared/components/ui/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/ui/button/button';

@Component({
  selector: 'app-avaluos-response',
  imports: [StepperComponent, ButtonComponent],
  providers: [AvaluosStepperService],
  templateUrl: './response.html',
  styleUrls: ['./response.css'],
})
export class AvaluosResponse implements OnInit {
  private readonly router = inject(Router);
  private readonly stepperService = inject(AvaluosStepperService);
  private readonly stateService = inject(AvaluosStateService);

  isLoading = signal(false);

  ngOnInit(): void {
    this.stepperService.setStep(AvaluosStep.RESPUESTA);
  }

  onNuevaSolicitud(): void {
    this.isLoading.set(true);
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/avaluos-en-garantia/seleccionar']);
  }
}
