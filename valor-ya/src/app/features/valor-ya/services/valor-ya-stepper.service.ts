import { Injectable, signal, computed } from '@angular/core';

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
  public readonly currentStep = signal<ValorYaStep>(ValorYaStep.INICIO);

  readonly steps: StepConfig[] = [
    {
      step: ValorYaStep.INICIO,
      label: 'Seleccionar',
      route: '/valor-ya/seleccionar',
      percentage: '15%',
    },
    {
      step: ValorYaStep.SOLICITUD,
      label: 'Solicitud',
      route: '/valor-ya/solicitud',
      percentage: '50%',
    },
    {
      step: ValorYaStep.PROCESO,
      label: 'Pago',
      route: '/valor-ya/pago',
      percentage: '80%',
    },
    {
      step: ValorYaStep.RESPUESTA,
      label: 'Respuesta',
      route: '/valor-ya/respuesta',
      percentage: '100%',
    },
  ];

  public readonly progressPercentage = computed(() => {
    const config = this.getStepConfig(this.currentStep());
    return config?.percentage || '0%';
  });

  setStep(step: ValorYaStep): void {
    this.currentStep.set(step);
  }

  nextStep(): void {
    this.currentStep.update((current) => (current < ValorYaStep.RESPUESTA ? current + 1 : current));
  }

  previousStep(): void {
    this.currentStep.update((current) => (current > ValorYaStep.INICIO ? current - 1 : current));
  }

  isStepActive(step: ValorYaStep): boolean {
    return this.currentStep() >= step;
  }

  getStepConfig(step: ValorYaStep): StepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  reset(): void {
    this.currentStep.set(ValorYaStep.INICIO);
  }
}
