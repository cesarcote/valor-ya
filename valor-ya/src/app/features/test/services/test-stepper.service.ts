import { Injectable, signal, computed } from '@angular/core';

export enum TestStep {
  INICIO = 1,
  SOLICITUD = 2,
  PROCESO = 3,
  RESPUESTA = 4,
}

export interface StepConfig {
  step: TestStep;
  label: string;
  route: string;
  percentage: string;
}

@Injectable({
  providedIn: 'root',
})
export class TestStepperService {
  public readonly currentStep = signal<TestStep>(TestStep.INICIO);

  readonly steps: StepConfig[] = [
    {
      step: TestStep.INICIO,
      label: 'Seleccionar',
      route: '/test/seleccionar',
      percentage: '15%',
    },
    {
      step: TestStep.SOLICITUD,
      label: 'Solicitud',
      route: '/test/solicitud',
      percentage: '50%',
    },
    {
      step: TestStep.PROCESO,
      label: 'Pago',
      route: '/test/pago',
      percentage: '80%',
    },
    {
      step: TestStep.RESPUESTA,
      label: 'Respuesta',
      route: '/test/respuesta',
      percentage: '100%',
    },
  ];

  public readonly progressPercentage = computed(() => {
    const config = this.getStepConfig(this.currentStep());
    return config?.percentage || '0%';
  });

  setStep(step: TestStep): void {
    this.currentStep.set(step);
  }

  nextStep(): void {
    this.currentStep.update((current) => (current < TestStep.RESPUESTA ? current + 1 : current));
  }

  previousStep(): void {
    this.currentStep.update((current) => (current > TestStep.INICIO ? current - 1 : current));
  }

  isStepActive(step: TestStep): boolean {
    return this.currentStep() >= step;
  }

  getStepConfig(step: TestStep): StepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  reset(): void {
    this.currentStep.set(TestStep.INICIO);
  }
}
