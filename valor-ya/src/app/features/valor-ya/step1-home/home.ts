import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ValoryaDescription } from '../../../shared/components/valorya-description/valorya-description';

@Component({
  selector: 'app-home',
  imports: [StepperComponent, ValoryaDescription],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);

  private readonly busquedaMap: { [key: string]: TipoBusqueda } = {
    direccion: TipoBusqueda.DIRECCION,
    chip: TipoBusqueda.CHIP,
    fmi: TipoBusqueda.FMI,
  };

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.INICIO);
  }

  onCardClick(type: string): void {
    const tipoBusqueda = this.busquedaMap[type];

    if (tipoBusqueda) {
      this.stateService.setTipoBusqueda(tipoBusqueda);
      this.stepperService.setStep(ValorYaStep.SOLICITUD);
      this.router.navigate(['/valor-ya/solicitud']);
    }
  }
}
