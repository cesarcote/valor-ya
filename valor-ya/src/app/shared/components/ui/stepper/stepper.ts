import { Component, inject, Optional, signal, effect } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStepperService } from '../../../../features/valor-ya/services/valor-ya-stepper.service';
import { AvaluosStepperService } from '../../../../features/avaluos-en-garantia/services/avaluos-stepper.service';
import { TestStepperService } from '../../../../features/test/services/test-stepper.service';

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
    private router: Router,
    @Optional() private valorYaStepperService: ValorYaStepperService,
    @Optional() private avaluosStepperService: AvaluosStepperService,
    @Optional() private testStepperService: TestStepperService
  ) {
    const url = this.router.url;

    switch (true) {
      case url.includes('/valor-ya'):
        this.stepperService = this.valorYaStepperService;
        break;
      case url.includes('/avaluos'):
        this.stepperService = this.avaluosStepperService;
        break;
      case url.includes('/test'):
        this.stepperService = this.testStepperService;
        break;
      default:
        this.stepperService =
          this.valorYaStepperService || this.avaluosStepperService || this.testStepperService;
        break;
    }

    if (this.stepperService) {
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
