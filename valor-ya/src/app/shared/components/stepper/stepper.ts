import { Component, inject, OnInit, ElementRef, Renderer2, ChangeDetectorRef, Optional } from '@angular/core';

import { StepperService } from '../../../core/services/stepper.service';
import { AvaluosStepperService } from '../../../core/services/avaluos-stepper.service';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
})
export class StepperComponent implements OnInit {
  stepperService: any;
  private cdr = inject(ChangeDetectorRef);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  currentStep: number = 1;
  progressPercentage: string = '15%';

  constructor(
    @Optional() private valorYaStepperService: StepperService,
    @Optional() private avaluosStepperService: AvaluosStepperService
  ) {
    // Usa el servicio que esté disponible
    this.stepperService = this.avaluosStepperService || this.valorYaStepperService;
  }

  ngOnInit(): void {
    this.stepperService.currentStep$.subscribe((step: number) => {
      this.currentStep = step;
      this.progressPercentage = this.stepperService.getProgressPercentage();
      this.cdr.detectChanges();
      this.updateStepColors();
    });
  }

  isStepActive(step: number): boolean {
    return this.stepperService.isStepActive(step);
  }

  isCurrentStep(step: number): boolean {
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
