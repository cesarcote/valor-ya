import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { TestStateService, TipoBusqueda } from '../../../../core/services/test-state.service';
import { TestStepperService, TestStep } from '../../../../core/services/test-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { TabsComponent, Tab } from '../../../../shared/components/tabs/tabs';
import { TestFormChipComponent, ChipData } from '../components/form-chip/form-chip';
import { TestFormAddressComponent, AddressData } from '../components/form-address/form-address';
import { TestFormFmiComponent, FmiData } from '../components/form-fmi/form-fmi';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';

@Component({
  selector: 'app-test-search-forms',
  imports: [
    StepperComponent,
    TabsComponent,
    TestFormChipComponent,
    TestFormAddressComponent,
    TestFormFmiComponent,
    ValoryaDescription,
  ],
  templateUrl: './search-forms.html',
  styleUrls: ['./search-forms.css'],
})
export class TestSearchFormsComponent {
  private router = inject(Router);
  private stepperService = inject(TestStepperService);
  public stateService = inject(TestStateService);

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
    this.stepperService.setStep(TestStep.INICIO);

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
    this.stepperService.setStep(TestStep.SOLICITUD);
    this.router.navigate(['/test/solicitud']);
  }
}
