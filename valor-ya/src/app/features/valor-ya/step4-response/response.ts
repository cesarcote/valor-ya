import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { PredioData } from '../../../core/models/predio-data.model';
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

  public readonly predioData = signal<PredioData | undefined>(undefined);
  public readonly valorEstimado = signal<number>(0);
  public readonly fechaConsulta = signal<string>('');

  constructor() {
    this.predioData.set(this.stateService.predioData());

    effect(() => {
      if (!this.predioData()) {
        this.router.navigate(['/valor-ya/inicio']);
      }
    });
  }

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    this.fechaConsulta.set(
      new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );

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
