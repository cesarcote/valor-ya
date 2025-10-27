import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { CatastroResponse } from '../../../core/models/catastro-response.model';
import { PredioService } from '../../../shared/services/predio.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { MapComponent } from '../../../shared/components/map/map';

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
  private predioService = inject(PredioService);

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

    // Guardar datos básicos
    this.valorBusqueda.set(state.valorBusqueda);
    this.tipoBusqueda.set(state.tipoBusqueda);

    const catastroBasico = state.catastroResponse;

    // Obtener LOTEID para consultar información completa
    const loteId = catastroBasico.LOTEID || catastroBasico.data?.infoConsultaPredio?.loteid;

    if (loteId) {
      // Consultar información completa del predio desde el backend
      this.isLoading.set(true);
      this.predioService.consultarPorLoteId(loteId).subscribe({
        next: (predioData: PredioData) => {
          // Convertir PredioData a CatastroResponse
          const dataCombinada: CatastroResponse = this.convertirPredioDataACatastroResponse(
            catastroBasico,
            predioData
          );

          this.catastroData.set(dataCombinada);
          this.stateService.setCatastroResponse(dataCombinada);
          this.isLoading.set(false);
        },
        error: (error: Error) => {
          console.error('Error al obtener información completa:', error);
          // Si falla, usar solo la información básica
          this.catastroData.set(catastroBasico);
          this.errorMessage.set(
            'No se pudo cargar toda la información del predio. Puede continuar con los datos básicos.'
          );
          this.isLoading.set(false);
        },
      });
    } else {
      // Si no hay LOTEID, usar solo la información básica
      this.catastroData.set(catastroBasico);
      this.isLoading.set(false);
    }
  }

  ngAfterViewInit(): void {
    const state = this.stateService.getState();
    const loteid =
      state.catastroResponse?.LOTEID || state.catastroResponse?.data?.infoConsultaPredio?.loteid;

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

  private convertirPredioDataACatastroResponse(
    catastroBasico: CatastroResponse,
    predioData: PredioData
  ): CatastroResponse {
    return {
      ...catastroBasico,
      CHIP: predioData.chip || catastroBasico.CHIP,
      LOTEID: predioData.loteid || catastroBasico.LOTEID,
      DIRECCION_REAL: predioData.direccion || catastroBasico.DIRECCION_REAL,
      success: true,
      message: predioData.mensaje,
      data: {
        infoGeografica: {
          areaPoligono: 0,
          longitudPoligono: 0,
          coordenadasPoligono: [],
        },
        infoConsultaPredio: {
          chip: predioData.chip,
          loteid: predioData.loteid,
        },
        infoAdicional: {
          municipio: predioData.municipio,
          localidad: predioData.localidad,
          barrio: predioData.barrio,
          direccion: predioData.direccion,
          tipoPredio: predioData.tipoPredio,
          estrato: predioData.estrato,
          areaConstruidaPrivada: predioData.areaConstruida.replace(' m²', ''),
          edad: predioData.edad,
        },
      },
    };
  }
}
