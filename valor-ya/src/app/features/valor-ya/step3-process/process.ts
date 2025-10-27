import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { CatastroResponse } from '../../../core/models/catastro-response.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { MapComponent } from '../../test/components/map/map';

@Component({
  selector: 'app-process',
  imports: [StepperComponent, ButtonComponent, MapComponent],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class ProcessComponent implements OnInit, AfterViewInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);

  readonly TipoBusqueda = TipoBusqueda;

  catastroData = signal<CatastroResponse | null>(null);
  valorBusqueda = signal<string>('');
  tipoBusqueda = signal<TipoBusqueda | undefined>(undefined);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);

    const state = this.stateService.getState();

    if (!state.tipoBusqueda || !state.valorBusqueda || !state.catastroResponse) {
      console.warn('Redirigiendo al inicio - falta información');
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.catastroData.set(state.catastroResponse);
    this.valorBusqueda.set(state.valorBusqueda);
    this.tipoBusqueda.set(state.tipoBusqueda);
    this.isLoading.set(false);
  }

  ngAfterViewInit(): void {
    const state = this.stateService.getState();
    const loteid = state.catastroResponse?.LOTEID || state.catastroResponse?.data?.infoConsultaPredio?.loteid;
    
    if (loteid && this.mapComponent) {
      this.mapComponent.ubicarLotePorCodigo(loteid);
    }
  }

  onNoEsCorrecta(): void {
    this.router.navigate(['/valor-ya/complementar']);
  }

  onContinuar(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);
    this.router.navigate(['/valor-ya/respuesta']);
  }
}
