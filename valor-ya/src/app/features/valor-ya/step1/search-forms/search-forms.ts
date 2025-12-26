import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStateService, TipoBusqueda } from '../../services/valor-ya-state.service';
import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { StepperComponent } from '../../../../shared/components/ui/stepper/stepper';
import { TabsComponent, Tab } from '../../../../shared/components/ui/tabs/tabs';
import { FormChipComponent, ChipData } from '../components/form-chip/form-chip';
import { FormAddressComponent, AddressData } from '../components/form-address/form-address';
import { FormFmiComponent, FmiData } from '../components/form-fmi/form-fmi';
import { ValoryaDescription } from '../../components/valorya-description/valorya-description';

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
  private readonly router = inject(Router);
  private readonly stepperService = inject(ValorYaStepperService);
  private readonly authService = inject(AuthService);
  public readonly stateService = inject(ValorYaStateService);

  private readonly fmiDisabledMessage = 'Por el momento el servicio de FMI no está disponible';

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
    { label: 'Folio Matrícula Inmobiliaria', disabled: true, tooltip: this.fmiDisabledMessage },
  ];

  public currentTitle = computed(() => {
    const index = this.selectedTabIndex();
    return this.tabs[index]?.label || '';
  });

  constructor() {
    this.stepperService.setStep(ValorYaStep.INICIO);

    this.authService.clearValorYaSessionData();
    this.stateService.clearStorage();

    this.stateService.setTipoBusqueda(TipoBusqueda.DIRECCION);
  }

  onTabChange(index: number): void {
    const tipos = [TipoBusqueda.DIRECCION, TipoBusqueda.CHIP, TipoBusqueda.FMI];
    if (tipos[index] === TipoBusqueda.FMI) {
      return;
    }
    this.stateService.setTipoBusqueda(tipos[index]);
  }

  onConsultarChip(data: ChipData): void {
    this.stateService.setValorBusqueda(data.chip);
    this.irAProceso();
  }

  onConsultarDireccion(data: AddressData): void {
    this.stateService.setValorBusqueda(data.direccion);
    this.irAProceso();
  }

  onConsultarFMI(data: FmiData): void {
    this.stateService.setValorBusqueda(`${data.zona}-${data.matricula}`);
    this.irAProceso();
  }

  irAProceso(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);
    this.router.navigate(['/valor-ya/solicitud']);
  }
}
