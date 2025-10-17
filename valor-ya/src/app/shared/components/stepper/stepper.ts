import { Component, inject, OnInit } from '@angular/core';

import { StepperService, InquiryStep } from '../../../core/services/stepper.service';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
})
export class StepperComponent implements OnInit {
  stepperService = inject(StepperService);

  currentStep: InquiryStep = InquiryStep.INICIO;
  progressPercentage: string = '15%';

  ngOnInit(): void {
    this.stepperService.currentStep$.subscribe((step) => {
      this.currentStep = step;
      this.progressPercentage = this.stepperService.getProgressPercentage();
    });
  }

  isStepActive(step: InquiryStep): boolean {
    return this.stepperService.isStepActive(step);
  }

  isCurrentStep(step: InquiryStep): boolean {
    return this.currentStep === step;
  }
}
