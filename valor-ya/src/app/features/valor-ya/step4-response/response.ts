import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { CatastroResponse } from '../../../core/models/catastro-response.model';
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
  private stateService = inject(ValorYaStateService);

  catastroData?: CatastroResponse;
  valorEstimado: number = 0;
  fechaConsulta: string = '';

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    const state = this.stateService.getState();
    if (!state.catastroResponse) {
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.catastroData = state.catastroResponse;
    this.fechaConsulta = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/inicio']);
  }

  onVolverInicio(): void {
    this.router.navigate(['/valor-ya/inicio']);
  }
}
