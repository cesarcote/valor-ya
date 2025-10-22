import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum AvaluosStep {
  INICIO = 1,
  SOLICITUD = 2,
  PROCESO = 3,
  RESPUESTA = 4,
}

export interface AvaluosStepConfig {
  step: AvaluosStep;
  label: string;
  route: string;
  percentage: string;
}

@Injectable()
export class AvaluosStepperService {
  private currentStepSubject = new BehaviorSubject<AvaluosStep>(AvaluosStep.INICIO);
  public currentStep$: Observable<AvaluosStep> = this.currentStepSubject.asObservable();

  readonly steps: AvaluosStepConfig[] = [
    {
      step: AvaluosStep.INICIO,
      label: 'Inicio',
      route: '/avaluos-en-garantia/inicio',
      percentage: '15%',
    },
    {
      step: AvaluosStep.SOLICITUD,
      label: 'Hago mi solicitud',
      route: '/avaluos-en-garantia/solicitud',
      percentage: '50%',
    },
    {
      step: AvaluosStep.PROCESO,
      label: 'Procesan mi solicitud',
      route: '/avaluos-en-garantia/proceso',
      percentage: '80%',
    },
    {
      step: AvaluosStep.RESPUESTA,
      label: 'Respuesta',
      route: '/avaluos-en-garantia/respuesta',
      percentage: '100%',
    },
  ];

  getCurrentStep(): AvaluosStep {
    return this.currentStepSubject.value;
  }

  setStep(step: AvaluosStep): void {
    this.currentStepSubject.next(step);
  }

  nextStep(): void {
    const current = this.currentStepSubject.value;
    if (current < AvaluosStep.RESPUESTA) {
      this.currentStepSubject.next(current + 1);
    }
  }

  previousStep(): void {
    const current = this.currentStepSubject.value;
    if (current > AvaluosStep.INICIO) {
      this.currentStepSubject.next(current - 1);
    }
  }

  isStepActive(step: AvaluosStep): boolean {
    return this.currentStepSubject.value >= step;
  }

  getStepConfig(step: AvaluosStep): AvaluosStepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  reset(): void {
    this.currentStepSubject.next(AvaluosStep.INICIO);
  }

  getProgressPercentage(): string {
    const config = this.getStepConfig(this.currentStepSubject.value);
    return config?.percentage || '0%';
  }
}
