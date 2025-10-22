import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs';
import { ButtonComponent } from '../../../shared/components/button/button';
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
export class ApplicationComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);

  tipoBusquedaActual: TipoBusqueda | undefined;
  selectedTabIndex: number = 0;

  tabs: Tab[] = [
    { label: 'Dirección Catastral', disabled: false },
    { label: 'CHIP', disabled: false },
    { label: 'Folio Matrícula Inmobiliaria', disabled: false },
  ];

  readonly TipoBusqueda = TipoBusqueda;

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    this.stateService.state$.subscribe((state) => {
      this.tipoBusquedaActual = state.tipoBusqueda;
      this.updateSelectedTabIndex();
    });

    if (!this.tipoBusquedaActual) {
      this.router.navigate(['/valor-ya/inicio']);
    }
  }

  updateSelectedTabIndex(): void {
    if (this.tipoBusquedaActual === TipoBusqueda.DIRECCION) {
      this.selectedTabIndex = 0;
    } else if (this.tipoBusquedaActual === TipoBusqueda.CHIP) {
      this.selectedTabIndex = 1;
    } else if (this.tipoBusquedaActual === TipoBusqueda.FMI) {
      this.selectedTabIndex = 2;
    }
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
    this.stateService.setValorBusqueda(`${data.zona}-${data.matricula}`);
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
