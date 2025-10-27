import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { PredioService } from '../../../shared/services/predio.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../shared/components/predio-info-card/predio-info-card';

// Interfaz para la respuesta de la API del catastro
interface CatastroApiResponse {
  success: boolean;
  message: string;
  data: {
    infoConsultaPredio: {
      chip: string;
      loteid: string;
    };
    infoGeografica: {
      areaPoligono: number;
      longitudPoligono: number;
      coordenadasPoligono: number[][][];
    };
    infoAdicional: {
      municipio: string;
      localidad: string;
      barrio: string;
      direccion: string;
      tipoPredio: string;
      estrato: string;
      areaConstruidaPrivada: string;
      edad: string;
    };
  };
  error: any;
}

@Component({
  selector: 'app-process',
  imports: [StepperComponent, ButtonComponent, PredioInfoCardComponent],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class ProcessComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);
  private predioService = inject(PredioService);
  private cdr = inject(ChangeDetectorRef);

  predioData?: PredioData;
  errorMessage: string = '';

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);

    const state = this.stateService.getState();

    if (!state.tipoBusqueda || !state.valorBusqueda) {
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.realizarConsulta(state.tipoBusqueda, state.valorBusqueda);
  }

  realizarConsulta(tipo: TipoBusqueda, valor: string): void {
    console.log('🔍 Iniciando consulta:', { tipo, valor });
    this.errorMessage = '';
    this.predioData = undefined; // Limpiar datos anteriores

    let consulta$: Observable<PredioData>;

    switch (tipo) {
      case TipoBusqueda.CHIP:
        console.log('📍 Consultando por CHIP:', valor);
        consulta$ = this.predioService.consultarPorChip(valor);
        break;
      case TipoBusqueda.DIRECCION:
        console.log('📍 Consultando por DIRECCION:', valor);
        consulta$ = this.predioService.consultarPorDireccion(valor);
        break;
      case TipoBusqueda.FMI:
        const [zona, matricula] = valor.split('-');
        console.log('📍 Consultando por FMI:', { zona, matricula });
        consulta$ = this.predioService.consultarPorFMI(zona, matricula);
        break;
      default:
        console.log('❌ Tipo de búsqueda no válido:', tipo);
        this.router.navigate(['/valor-ya/solicitud']);
        return;
    }

    console.log('🔄 Observable creado, ejecutando suscripción...');
    console.log('🔄 Estado antes de suscripción - predioData:', this.predioData, 'errorMessage:', this.errorMessage);

    console.log('🔄 Observable creado, ejecutando suscripción...');
    console.log('🔄 Estado antes de suscripción - predioData:', this.predioData, 'errorMessage:', this.errorMessage);
    consulta$.subscribe({
      next: (predioData: PredioData) => {
        console.log('✅ Datos del predio recibidos exitosamente');
        console.log('📊 Datos completos:', predioData);
        console.log('🔧 ANTES de asignar - this.predioData:', this.predioData);
        this.predioData = predioData;
        console.log('🔧 DESPUÉS de asignar - this.predioData:', this.predioData);
        console.log('💾 predioData asignado:', this.predioData);
        this.stateService.setPredioData(predioData, tipo, valor);
        
        // Forzar detección de cambios para asegurar que la vista se actualice
        this.cdr.detectChanges();
        console.log('🔄 Detección de cambios ejecutada');
        console.log('🔧 FINAL - this.predioData:', this.predioData);
      },
      error: (error: any) => {
        console.error('❌ Error en suscripción:', error);
        // Mostrar mensaje específico del error
        if (error.message && error.message.includes('No se encontraron datos')) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Error al consultar el predio. Por favor, verifique los datos e intente nuevamente.';
        }
        
        this.cdr.detectChanges();
        console.log('💥 Error manejado, errorMessage:', this.errorMessage);
      },
      complete: () => {
        console.log('🏁 Suscripción completada');
        console.log('🏁 Estado final - predioData:', this.predioData, 'errorMessage:', this.errorMessage);
      }
    });
  }

  onNoEsCorrecta(): void {
    this.router.navigate(['/valor-ya/complementar']);
  }

  onContinuar(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);
    this.router.navigate(['/valor-ya/respuesta']);
  }
}
