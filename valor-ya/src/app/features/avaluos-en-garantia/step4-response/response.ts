import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AvaluosStepperService, AvaluosStep } from '../../../core/services/avaluos-stepper.service';
import { AvaluosStateService } from '../../../core/services/avaluos-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-avaluos-response',
  imports: [StepperComponent, ButtonComponent],
  providers: [AvaluosStepperService],
  templateUrl: './response.html',
  styleUrls: ['./response.css'],
})
export class AvaluosResponseComponent implements OnInit {
  private router = inject(Router);
  stepperService = inject(AvaluosStepperService);
  private stateService = inject(AvaluosStateService);

  ngOnInit(): void {
    this.stepperService.setStep(AvaluosStep.RESPUESTA);
  }

  onNuevaSolicitud(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/avaluos-en-garantia/inicio']);
  }
}
