import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';

@Component({
  selector: 'app-response',
  imports: [StepperComponent],
  templateUrl: './response.html',
  styleUrls: ['./response.css'],
})
export class ResponseComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);

  predioData?: PredioData;
  valorEstimado: number = 0;
  fechaConsulta: string = '';

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    const state = this.stateService.getState();
    if (!state.predioData) {
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.predioData = state.predioData;
    this.valorEstimado = this.calcularValorEstimado();
    this.fechaConsulta = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  calcularValorEstimado(): number {
    return Math.floor(Math.random() * (500000000 - 200000000) + 200000000);
  }

  onDescargarPDF(): void {
    alert('Funcionalidad de descarga PDF en desarrollo');
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
