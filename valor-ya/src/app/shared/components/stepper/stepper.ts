import {
  Component,
  inject,
  OnInit,
  Optional,
  signal,
  effect,
} from '@angular/core';

import { ValorYaStepperService } from '../../../core/services/valor-ya-stepper.service';
import { AvaluosStepperService } from '../../../core/services/avaluos-stepper.service';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
})
export class StepperComponent implements OnInit {
  stepperService: any;

  currentStep = signal(1);
  progressPercentage = signal('15%');

  constructor(
    @Optional() private valorYaStepperService: ValorYaStepperService,
    @Optional() private avaluosStepperService: AvaluosStepperService
  ) {
    this.stepperService = this.avaluosStepperService || this.valorYaStepperService;

    if (this.stepperService) {
      // Use effect to react to signal changes
      effect(() => {
        const step = this.stepperService.currentStep();
        this.currentStep.set(step);
        this.progressPercentage.set(this.stepperService.progressPercentage());
      });
    }
  }

  ngOnInit(): void {
    // ngOnInit is intentionally left empty.
    // The logic that was here has been moved to the constructor
    // to ensure it runs within the correct injection context.
  }

  isStepActive(step: number): boolean {
    return this.currentStep() >= step;
  }

  isCurrentStep(step: number): boolean {
    return this.currentStep() === step;
  }

  isPastStep(step: number): boolean {
    return step < this.currentStep();
  }
}
