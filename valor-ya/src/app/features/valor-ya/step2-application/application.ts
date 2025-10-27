import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { CatastroService } from '../../../core/services/catastro.service';
import { CatastroResponse } from '../../../core/models/catastro-response.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs';
import { ButtonComponent } from '../../../shared/components/button/button';
import { FormChipComponent } from './components/form-chip/form-chip';
import { FormAddressComponent } from './components/form-address/form-address';
import { FormFmiComponent, FmiData } from './components/form-fmi/form-fmi';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-application',
  imports: [
    StepperComponent,
    TabsComponent,
    FormChipComponent,
    FormAddressComponent,
    FormFmiComponent,
    LoadingComponent,
  ],
  templateUrl: './application.html',
  styleUrls: ['./application.css'],
})
export class ApplicationComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);
  private catastroService = inject(CatastroService);

  tipoBusquedaActual = signal<TipoBusqueda | undefined>(undefined);
  selectedTabIndex = signal(0);
  isLoading = signal(false);
  errorMessage = signal('');

  tabs: Tab[] = [
    { label: 'Dirección Catastral', disabled: false },
    { label: 'CHIP', disabled: false },
    { label: 'Folio Matrícula Inmobiliaria', disabled: true },
  ];

  readonly TipoBusqueda = TipoBusqueda;

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    this.stateService.state$.subscribe((state) => {
      this.tipoBusquedaActual.set(state.tipoBusqueda);
      this.updateSelectedTabIndex();
    });

    if (!this.tipoBusquedaActual()) {
      this.router.navigate(['/valor-ya/inicio']);
    }
  }

  updateSelectedTabIndex(): void {
    if (this.tipoBusquedaActual() === TipoBusqueda.DIRECCION) {
      this.selectedTabIndex.set(0);
    } else if (this.tipoBusquedaActual() === TipoBusqueda.CHIP) {
      this.selectedTabIndex.set(1);
    } else if (this.tipoBusquedaActual() === TipoBusqueda.FMI) {
      this.selectedTabIndex.set(2);
    }
  }

  onTabChange(index: number): void {
    const tipos = [TipoBusqueda.DIRECCION, TipoBusqueda.CHIP, TipoBusqueda.FMI];
    this.stateService.setTipoBusqueda(tipos[index]);
  }

  onConsultarChip(chip: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.catastroService.buscarPorChip(chip).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.stateService.setValorBusqueda(chip);
        this.stateService.setCatastroResponse(response);
        this.irAProceso();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(`Error al consultar CHIP: ${error.message || 'Intente nuevamente'}`);
      },
    });
  }

  onConsultarDireccion(direccion: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.catastroService.buscarPorDireccion(direccion).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.stateService.setValorBusqueda(direccion);
        this.stateService.setCatastroResponse(response);
        this.irAProceso();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          `Error al consultar dirección: ${error.message || 'Intente nuevamente'}`
        );
      },
    });
  }

  onConsultarFMI(data: FmiData): void {
    this.errorMessage.set(
      'La búsqueda por Folio de Matrícula Inmobiliaria (FMI) no está disponible en este momento. Por favor, use búsqueda por CHIP o Dirección.'
    );
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
