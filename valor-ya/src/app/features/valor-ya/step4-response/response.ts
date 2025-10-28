import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-response',
  imports: [StepperComponent, ButtonComponent],
  templateUrl: './response.html',
  styleUrls: ['./response.css'],
})
export class ResponseComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);

  constructor() {

  }

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/inicio']);
  }

  onVolverInicio(): void {
    this.onNuevaConsulta();
  }
}
