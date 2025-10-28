import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../shared/components/predio-info-card/predio-info-card';

@Component({
  selector: 'app-response',
  imports: [CommonModule, StepperComponent, ButtonComponent, PredioInfoCardComponent],
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

    // Dummy calculation for estimated value
    if (this.predioData()) {
      const area = parseFloat(this.predioData()!.areaConstruida) || 100;
      const estrato = parseInt(this.predioData()!.estrato) || 3;
      const baseValue = 1500000;
      this.valorEstimado.set(area * baseValue * (1 + (estrato - 1) * 0.1));
    }
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
