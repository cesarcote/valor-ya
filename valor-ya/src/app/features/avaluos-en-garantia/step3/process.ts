import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AvaluosStepperService, AvaluosStep } from '../../../core/services/avaluos-stepper.service';
import { AvaluosStateService } from '../../../core/services/avaluos-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-avaluos-process',
  imports: [StepperComponent, ButtonComponent],
  providers: [AvaluosStepperService],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class AvaluosProcess implements OnInit {
  private router = inject(Router);
  private stepperService = inject(AvaluosStepperService);
  private stateService = inject(AvaluosStateService);

  isLoading = signal(false);

  ngOnInit(): void {
    this.stepperService.setStep(AvaluosStep.PROCESO);
  }

  onVolver(): void {
    this.stepperService.setStep(AvaluosStep.SOLICITUD);
    this.router.navigate(['/avaluos-en-garantia/solicitud']);
  }

  onVolverInicio(): void {
    this.stateService.reset();
    this.stepperService.setStep(AvaluosStep.INICIO);
    this.router.navigate(['/avaluos-en-garantia/seleccionar']);
  }

  onContinuar(): void {
    this.isLoading.set(true);
    this.stepperService.setStep(AvaluosStep.RESPUESTA);
    this.router.navigate(['/avaluos-en-garantia/respuesta']);
  }
}
