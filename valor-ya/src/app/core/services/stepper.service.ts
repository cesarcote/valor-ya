import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum InquiryStep {
  INICIO = 1, // Home: Selección del tipo de búsqueda
  SOLICITUD = 2, // Formularios + Resultado de búsqueda
  PROCESO = 3, // Validación/Cálculo del valor
  RESPUESTA = 4, // Resultado final con PDF
}

export interface StepConfig {
  step: InquiryStep;
  label: string;
  route: string;
  percentage: string;
}

@Injectable({
  providedIn: 'root',
})
export class StepperService {
  private currentStepSubject = new BehaviorSubject<InquiryStep>(InquiryStep.INICIO);
  public currentStep$: Observable<InquiryStep> = this.currentStepSubject.asObservable();

  readonly steps: StepConfig[] = [
    {
      step: InquiryStep.INICIO,
      label: 'Inicio',
      route: '/valor-ya/inicio',
      percentage: '15%',
    },
    {
      step: InquiryStep.SOLICITUD,
      label: 'Hago mi solicitud',
      route: '/valor-ya/solicitud',
      percentage: '50%',
    },
    {
      step: InquiryStep.PROCESO,
      label: 'Procesan mi solicitud',
      route: '/valor-ya/proceso',
      percentage: '80%',
    },
    {
      step: InquiryStep.RESPUESTA,
      label: 'Respuesta',
      route: '/valor-ya/respuesta',
      percentage: '100%',
    },
  ];

  constructor() {}

  // Obtener step actual
  getCurrentStep(): InquiryStep {
    return this.currentStepSubject.value;
  }

  // Cambiar a un step específico
  setStep(step: InquiryStep): void {
    this.currentStepSubject.next(step);
  }

  // Avanzar al siguiente step
  nextStep(): void {
    const current = this.currentStepSubject.value;
    if (current < InquiryStep.RESPUESTA) {
      this.currentStepSubject.next(current + 1);
    }
  }

  // Retroceder al step anterior
  previousStep(): void {
    const current = this.currentStepSubject.value;
    if (current > InquiryStep.INICIO) {
      this.currentStepSubject.next(current - 1);
    }
  }

  // Verificar si un step está activo
  isStepActive(step: InquiryStep): boolean {
    return this.currentStepSubject.value >= step;
  }

  // Obtener configuración de un step
  getStepConfig(step: InquiryStep): StepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  // Resetear al inicio
  reset(): void {
    this.currentStepSubject.next(InquiryStep.INICIO);
  }

  // Obtener porcentaje de progreso
  getProgressPercentage(): string {
    const config = this.getStepConfig(this.currentStepSubject.value);
    return config?.percentage || '0%';
  }
}
