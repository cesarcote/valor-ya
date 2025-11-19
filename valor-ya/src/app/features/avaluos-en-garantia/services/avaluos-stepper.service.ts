import { Injectable, signal, computed } from '@angular/core';

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
  public readonly currentStep = signal<AvaluosStep>(AvaluosStep.INICIO);

  readonly steps: AvaluosStepConfig[] = [
    {
      step: AvaluosStep.INICIO,
      label: 'Seleccionar',
      route: '/avaluos-en-garantia/seleccionar',
      percentage: '15%',
    },
    {
      step: AvaluosStep.SOLICITUD,
      label: 'Solicitud',
      route: '/avaluos-en-garantia/solicitud',
      percentage: '50%',
    },
    {
      step: AvaluosStep.PROCESO,
      label: 'Pago',
      route: '/avaluos-en-garantia/pago',
      percentage: '80%',
    },
    {
      step: AvaluosStep.RESPUESTA,
      label: 'Respuesta',
      route: '/avaluos-en-garantia/respuesta',
      percentage: '100%',
    },
  ];

  public readonly progressPercentage = computed(() => {
    const config = this.getStepConfig(this.currentStep());
    return config?.percentage || '0%';
  });

  setStep(step: AvaluosStep): void {
    this.currentStep.set(step);
  }

  nextStep(): void {
    this.currentStep.update((current) => (current < AvaluosStep.RESPUESTA ? current + 1 : current));
  }

  previousStep(): void {
    this.currentStep.update((current) => (current > AvaluosStep.INICIO ? current - 1 : current));
  }

  isStepActive(step: AvaluosStep): boolean {
    return this.currentStep() >= step;
  }

  getStepConfig(step: AvaluosStep): AvaluosStepConfig | undefined {
    return this.steps.find((s) => s.step === step);
  }

  reset(): void {
    this.currentStep.set(AvaluosStep.INICIO);
  }
}
