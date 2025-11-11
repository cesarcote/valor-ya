import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import {
  ValorYaStateService,
  TipoBusqueda,
} from '../../../../core/services/valor-ya-state.service';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { TabsComponent, Tab } from '../../../../shared/components/tabs/tabs';
import { FormChipComponent, ChipData } from '../components/form-chip/form-chip';
import { FormAddressComponent, AddressData } from '../components/form-address/form-address';
import { FormFmiComponent, FmiData } from '../components/form-fmi/form-fmi';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';

@Component({
  selector: 'app-search-forms',
  imports: [
    StepperComponent,
    TabsComponent,
    FormChipComponent,
    FormAddressComponent,
    FormFmiComponent,
    ValoryaDescription,
  ],
  templateUrl: './search-forms.html',
  styleUrls: ['./search-forms.css'],
})
export class SearchFormsComponent {
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

  public currentTitle = computed(() => {
    const index = this.selectedTabIndex();
    return this.tabs[index]?.label || '';
  });

  constructor() {
    this.stepperService.setStep(ValorYaStep.INICIO);

    // Establecer tipo de búsqueda por defecto si no hay ninguno
    if (!this.stateService.tipoBusqueda()) {
      this.stateService.setTipoBusqueda(TipoBusqueda.DIRECCION);
    }
  }

  onTabChange(index: number): void {
    const tipos = [TipoBusqueda.DIRECCION, TipoBusqueda.CHIP, TipoBusqueda.FMI];
    this.stateService.setTipoBusqueda(tipos[index]);
  }

  onConsultarChip(data: ChipData): void {
    this.stateService.setValorBusqueda(data.chip);
    this.stateService.setTipoPredio(data.tipoPredio);
    this.stateService.setTipoUnidad(data.tipoUnidad);
    this.irAProceso();
  }

  onConsultarDireccion(data: AddressData): void {
    this.stateService.setValorBusqueda(data.direccion);
    this.stateService.setTipoPredio(data.tipoPredio);
    this.stateService.setTipoUnidad(data.tipoUnidad);
    this.irAProceso();
  }

  onConsultarFMI(data: FmiData): void {
    this.stateService.setValorBusqueda(`${data.zona}-${data.matricula}`);
    this.stateService.setTipoPredio(data.tipoPredio);
    this.stateService.setTipoUnidad(data.tipoUnidad);
    this.irAProceso();
  }

  irAProceso(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);
    this.router.navigate(['/valor-ya/solicitud']);
  }
}
