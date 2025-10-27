import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CatastroResponse } from '../models/catastro-response.model';

export enum TipoBusqueda {
  CHIP = 'chip',
  DIRECCION = 'direccion',
  FMI = 'fmi',
}

export interface ValorYaState {
  tipoBusqueda?: TipoBusqueda;
  valorBusqueda?: string;
  catastroResponse?: CatastroResponse;
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

  setCatastroResponse(response: CatastroResponse): void {
    this.updateState({ catastroResponse: response, mostrarResultado: true });
  }

  setMostrarResultado(mostrar: boolean): void {
    this.updateState({ mostrarResultado: mostrar });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }

  hasCatastroResponse(): boolean {
    return !!this.stateSubject.value.catastroResponse;
  }

  private updateState(partial: Partial<ValorYaState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partial });
  }
}
