import { Component, inject, computed, effect } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs';
import { FormChipComponent } from './components/form-chip/form-chip';
import { FormAddressComponent } from './components/form-address/form-address';
import { FormFmiComponent, FmiData } from './components/form-fmi/form-fmi';

@Component({
  selector: 'app-application',
  imports: [
    StepperComponent,
    TabsComponent,
    FormChipComponent,
    FormAddressComponent,
    FormFmiComponent,
  ],
  templateUrl: './application.html',
  styleUrls: ['./application.css'],
})
export class ApplicationComponent {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);

  public selectedTabIndex = computed(() => {
    const tipoBusqueda = this.stateService.tipoBusqueda();
    switch (tipoBusqueda) {
      case TipoBusqueda.DIRECCION:
        return 0;
      case TipoBusqueda.CHIP:
        return 1;
      case TipoBusqueda.FMI:
        return 2;
      default:
        return 0;
    }
  });

  tabs: Tab[] = [
    { label: 'Dirección Catastral', disabled: false },
    { label: 'CHIP', disabled: false },
    { label: 'Folio Matrícula Inmobiliaria', disabled: false },
  ];

  constructor() {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    effect(() => {
      if (!this.stateService.tipoBusqueda()) {
        this.router.navigate(['/valor-ya/inicio']);
      }
    });
  }

  onTabChange(index: number): void {
    const tipos = [TipoBusqueda.DIRECCION, TipoBusqueda.CHIP, TipoBusqueda.FMI];
    this.stateService.setTipoBusqueda(tipos[index]);
  }

  onConsultarChip(chip: string): void {
    this.stateService.setValorBusqueda(chip);
    this.irAProceso();
  }

  onConsultarDireccion(direccion: string): void {
    this.stateService.setValorBusqueda(direccion);
    this.irAProceso();
  }

  onConsultarFMI(data: FmiData): void {
    this.stateService.setValorBusqueda(`${data.matricula} - ${data.zona}`);
    this.irAProceso();
  }

  irAProceso(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);
    this.router.navigate(['/valor-ya/proceso']);
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(ValorYaStep.INICIO);
    this.router.navigate(['/valor-ya/inicio']);
  }
}
