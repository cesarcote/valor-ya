import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PredioData } from '../../core/models/predio-data.model';

export enum TipoBusqueda {
  CHIP = 'chip',
  DIRECCION = 'direccion',
  FMI = 'fmi',
}

export interface ValorYaState {
  tipoBusqueda?: TipoBusqueda;
  valorBusqueda?: string;
  predioData?: PredioData;
  mostrarResultado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ValorYaStateService {
  private initialState: ValorYaState = {
    mostrarResultado: false,
  };

  private stateSubject = new BehaviorSubject<ValorYaState>(this.initialState);
  public state$: Observable<ValorYaState> = this.stateSubject.asObservable();

  constructor() {}

  // Obtener el estado actual
  getState(): ValorYaState {
    return this.stateSubject.value;
  }

  // Actualizar tipo de búsqueda
  setTipoBusqueda(tipo: TipoBusqueda): void {
    this.updateState({ tipoBusqueda: tipo });
  }

  // Guardar valor de búsqueda
  setValorBusqueda(valor: string): void {
    this.updateState({ valorBusqueda: valor });
  }

  // Guardar resultado de búsqueda
  setPredioData(data: PredioData, tipoBusqueda: TipoBusqueda, valor: string): void {
    this.updateState({
      predioData: data,
      tipoBusqueda,
      valorBusqueda: valor,
      mostrarResultado: true,
    });
  }

  // Mostrar/ocultar resultado
  setMostrarResultado(mostrar: boolean): void {
    this.updateState({ mostrarResultado: mostrar });
  }

  // Limpiar estado (para volver a Step 1)
  reset(): void {
    this.stateSubject.next(this.initialState);
  }

  // Verificar si hay datos cargados
  hasPredioData(): boolean {
    return !!this.stateSubject.value.predioData;
  }

  private updateState(partial: Partial<ValorYaState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partial });
  }
}
