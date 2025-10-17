import { Component, inject, OnInit, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';

import { StepperService, InquiryStep } from '../../../core/services/stepper.service';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
})
export class StepperComponent implements OnInit {
  stepperService = inject(StepperService);
  private cdr = inject(ChangeDetectorRef);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  currentStep: InquiryStep = InquiryStep.INICIO;
  progressPercentage: string = '15%';

  ngOnInit(): void {
    this.stepperService.currentStep$.subscribe((step) => {
      this.currentStep = step;
      this.progressPercentage = this.stepperService.getProgressPercentage();
      this.cdr.detectChanges();
      this.updateStepColors();
    });
  }

  isStepActive(step: InquiryStep): boolean {
    return this.stepperService.isStepActive(step);
  }

  isCurrentStep(step: InquiryStep): boolean {
    return this.currentStep === step;
  }

  private updateStepColors(): void {
    const stepElements = this.el.nativeElement.querySelectorAll('.header-linea-avance-govco');

    stepElements.forEach((item: any, index: number) => {
      const circulo = item.querySelector('.indicator-linea-avance-govco');
      const stepNumber = index + 1;

      if (stepNumber <= this.currentStep) {
        this.renderer.setStyle(circulo, 'color', 'white');
      } else {
        this.renderer.setStyle(circulo, 'color', '#3366cc');
      }
    });
  }
}
