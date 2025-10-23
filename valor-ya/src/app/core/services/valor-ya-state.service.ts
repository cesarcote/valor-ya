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

  getState(): ValorYaState {
    return this.stateSubject.value;
  }

  setTipoBusqueda(tipo: TipoBusqueda): void {
    this.updateState({ tipoBusqueda: tipo });
  }

  setValorBusqueda(valor: string): void {
    this.updateState({ valorBusqueda: valor });
  }

  setPredioData(data: PredioData, tipoBusqueda: TipoBusqueda, valor: string): void {
    this.updateState({
      predioData: data,
      tipoBusqueda,
      valorBusqueda: valor,
      mostrarResultado: true,
    });
  }

  setMostrarResultado(mostrar: boolean): void {
    this.updateState({ mostrarResultado: mostrar });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }

  hasPredioData(): boolean {
    return !!this.stateSubject.value.predioData;
  }

  private updateState(partial: Partial<ValorYaState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partial });
  }
}
