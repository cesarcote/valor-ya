import { Component, inject, Optional, signal, effect } from '@angular/core';

import { ValorYaStepperService } from '../../../core/services/valor-ya-stepper.service';
import { AvaluosStepperService } from '../../../core/services/avaluos-stepper.service';
import { TestStepperService } from '../../../core/services/test-stepper.service';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
})
export class StepperComponent {
  stepperService: any;

  currentStep = signal(1);
  progressPercentage = signal('15%');

  constructor(
    @Optional() private valorYaStepperService: ValorYaStepperService,
    @Optional() private avaluosStepperService: AvaluosStepperService,
    @Optional() private testStepperService: TestStepperService
  ) {
    this.stepperService =
      this.testStepperService || this.avaluosStepperService || this.valorYaStepperService;

    if (this.stepperService) {
      // Use effect to react to signal changes
      effect(() => {
        const step = this.stepperService.currentStep();
        const percentage = this.stepperService.progressPercentage();
        this.currentStep.set(step);
        this.progressPercentage.set(percentage);
      });
    }
  }

  isStepActive(step: number): boolean {
    if (this.stepperService && typeof this.stepperService.isStepActive === 'function') {
      return this.stepperService.isStepActive(step);
    }
    return this.currentStep() >= step;
  }

  isCurrentStep(step: number): boolean {
    return this.currentStep() === step;
  }

  isPastStep(step: number): boolean {
    return step < this.currentStep();
  }
}
