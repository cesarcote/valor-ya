import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum ValorYaStep {
  INICIO = 1, // Home: Selección del tipo de búsqueda
  SOLICITUD = 2, // Formularios + Resultado de búsqueda
  PROCESO = 3, // Validación/Cálculo del valor
  RESPUESTA = 4, // Resultado final con PDF
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

  // Obtener step actual
  getCurrentStep(): ValorYaStep {
    return this.currentStepSubject.value;
  }

  // Cambiar a un step específico
  setStep(step: ValorYaStep): void {
    this.currentStepSubject.next(step);
  }

  // Avanzar al siguiente step
  nextStep(): void {
    const current = this.currentStepSubject.value;
    if (current < ValorYaStep.RESPUESTA) {
      this.currentStepSubject.next(current + 1);
    }
  }

  // Retroceder al step anterior
  previousStep(): void {
    const current = this.currentStepSubject.value;
    if (current > ValorYaStep.INICIO) {
      this.currentStepSubject.next(current - 1);
    }
  }

  // Verificar si un step está activo
  isStepActive(step: ValorYaStep): boolean {
    return this.currentStepSubject.value >= step;
  }

  // Obtener configuración de un step
  getStepConfig(step: ValorYaStep): StepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  // Resetear al inicio
  reset(): void {
    this.currentStepSubject.next(ValorYaStep.INICIO);
  }

  // Obtener porcentaje de progreso
  getProgressPercentage(): string {
    const config = this.getStepConfig(this.currentStepSubject.value);
    return config?.percentage || '0%';
  }
}
