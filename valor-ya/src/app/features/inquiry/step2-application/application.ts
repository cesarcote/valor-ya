import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StepperService, InquiryStep } from '../../../core/services/stepper.service';
import { InquiryStateService, TipoBusqueda } from '../../../core/services/inquiry-state.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs';
import { FormChipComponent } from './components/form-chip/form-chip';
import { FormAddressComponent } from './components/form-address/form-address';
import { FormFmiComponent } from './components/form-fmi/form-fmi';

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
  private stepperService = inject(StepperService);
  stateService = inject(InquiryStateService);

  tipoBusquedaActual: TipoBusqueda | undefined;
  mostrarResultado: boolean = false;
  predioData?: PredioData;
  selectedTabIndex: number = 0;

  tabs: Tab[] = [
    { label: 'CHIP', disabled: false },
    { label: 'Dirección Catastral', disabled: false },
    { label: 'Folio Matrícula Inmobiliaria', disabled: false },
  ];

  readonly TipoBusqueda = TipoBusqueda;

  ngOnInit(): void {
    this.stepperService.setStep(InquiryStep.SOLICITUD);

    this.stateService.state$.subscribe((state) => {
      this.tipoBusquedaActual = state.tipoBusqueda;
      this.mostrarResultado = state.mostrarResultado;
      this.predioData = state.predioData;

      this.updateSelectedTabIndex();
      this.updateTabsDisabled();
    });

    if (!this.tipoBusquedaActual) {
      this.router.navigate(['/valor-ya/inicio']);
    }
  }

  updateSelectedTabIndex(): void {
    if (this.tipoBusquedaActual === TipoBusqueda.CHIP) {
      this.selectedTabIndex = 0;
    } else if (this.tipoBusquedaActual === TipoBusqueda.DIRECCION) {
      this.selectedTabIndex = 1;
    } else if (this.tipoBusquedaActual === TipoBusqueda.FMI) {
      this.selectedTabIndex = 2;
    }
  }

  updateTabsDisabled(): void {
    this.tabs = this.tabs.map((tab) => ({
      ...tab,
      disabled: this.mostrarResultado,
    }));
  }

  onTabChange(index: number): void {
    const tipos = [TipoBusqueda.CHIP, TipoBusqueda.DIRECCION, TipoBusqueda.FMI];
    this.stateService.setTipoBusqueda(tipos[index]);
    this.stateService.setMostrarResultado(false);
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(InquiryStep.INICIO);
    this.router.navigate(['/valor-ya/inicio']);
  }

  onContinuar(): void {
    this.stepperService.setStep(InquiryStep.PROCESO);
    this.router.navigate(['/valor-ya/proceso']);
  }
}
