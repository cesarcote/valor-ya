import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum ValorYaStep {
  INICIO = 1,
  SOLICITUD = 2,
  PROCESO = 3,
  RESPUESTA = 4,
}

export interface StepConfig {
  step: ValorYaStep;
  label: string;
  route: string;
  percentage: string;
}

@Injectable({
  providedIn: 'root',
})
export class ValorYaStepperService {
  private currentStepSubject = new BehaviorSubject<ValorYaStep>(ValorYaStep.INICIO);
  public currentStep$: Observable<ValorYaStep> = this.currentStepSubject.asObservable();

  readonly steps: StepConfig[] = [
    {
      step: ValorYaStep.INICIO,
      label: 'Inicio',
      route: '/valor-ya/inicio',
      percentage: '15%',
    },
    {
      step: ValorYaStep.SOLICITUD,
      label: 'Hago mi solicitud',
      route: '/valor-ya/solicitud',
      percentage: '50%',
    },
    {
      step: ValorYaStep.PROCESO,
      label: 'Procesan mi solicitud',
      route: '/valor-ya/proceso',
      percentage: '80%',
    },
    {
      step: ValorYaStep.RESPUESTA,
      label: 'Respuesta',
      route: '/valor-ya/respuesta',
      percentage: '100%',
    },
  ];

  constructor() {}

  getCurrentStep(): ValorYaStep {
    return this.currentStepSubject.value;
  }

  setStep(step: ValorYaStep): void {
    this.currentStepSubject.next(step);
  }

  nextStep(): void {
    const current = this.currentStepSubject.value;
    if (current < ValorYaStep.RESPUESTA) {
      this.currentStepSubject.next(current + 1);
    }
  }

  previousStep(): void {
    const current = this.currentStepSubject.value;
    if (current > ValorYaStep.INICIO) {
      this.currentStepSubject.next(current - 1);
    }
  }

  isStepActive(step: ValorYaStep): boolean {
    return this.currentStepSubject.value >= step;
  }

  getStepConfig(step: ValorYaStep): StepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  reset(): void {
    this.currentStepSubject.next(ValorYaStep.INICIO);
  }

  getProgressPercentage(): string {
    const config = this.getStepConfig(this.currentStepSubject.value);
    return config?.percentage || '0%';
  }
}
