import { Component, inject, OnInit, ElementRef, Renderer2, Optional, signal, effect } from '@angular/core';

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
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  currentStep = signal(1);
  progressPercentage = signal('15%');

  constructor(
    @Optional() private valorYaStepperService: ValorYaStepperService,
    @Optional() private avaluosStepperService: AvaluosStepperService
  ) {
    this.stepperService = this.avaluosStepperService || this.valorYaStepperService;
  }

  ngOnInit(): void {
    if (this.stepperService) {
      // Use effect to react to signal changes
      effect(() => {
        const step = this.stepperService.currentStep();
        this.currentStep.set(step);
        this.progressPercentage.set(this.stepperService.progressPercentage());
        this.updateStepColors();
      });
    }
  }

  isStepActive(step: number): boolean {
    return this.stepperService.isStepActive(step);
  }

  isCurrentStep(step: number): boolean {
    return this.currentStep() === step;
  }

  isPastStep(step: number): boolean {
    return step < this.currentStep();
  }

  private updateStepColors(): void {
    const stepElements = this.el.nativeElement.querySelectorAll('.header-linea-avance-govco');

    stepElements.forEach((item: any, index: number) => {
      const circulo = item.querySelector('.indicator-linea-avance-govco');
      const stepNumber = index + 1;

      if (stepNumber <= this.currentStep()) {
        this.renderer.setStyle(circulo, 'color', 'white');
      } else {
        this.renderer.setStyle(circulo, 'color', '#3366cc');
      }
    });
  }
}
