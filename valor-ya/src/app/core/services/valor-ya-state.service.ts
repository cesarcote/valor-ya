import { Injectable, signal, computed } from '@angular/core';
import { PredioData } from '../models/predio-data.model';
import { DatosComplementarios } from '../models/datos-complementarios.model';

export enum TipoBusqueda {
  CHIP = 'chip',
  DIRECCION = 'direccion',
  FMI = 'fmi',
}

@Injectable({
  providedIn: 'root',
})
export class ValorYaStateService {
  // State as individual signals
  public readonly tipoBusqueda = signal<TipoBusqueda | undefined>(TipoBusqueda.DIRECCION);
  public readonly valorBusqueda = signal<string | undefined>(undefined);
  public readonly predioData = signal<PredioData | undefined>(undefined);
  public readonly datosComplementarios = signal<DatosComplementarios | undefined>(undefined);
  public readonly tipoPredio = signal<string | undefined>(undefined);
  public readonly mostrarResultado = signal<boolean>(false);

  // Computed signal for derived state
  public readonly hasDatosComplementarios = computed(() => !!this.datosComplementarios());

  setTipoBusqueda(tipo: TipoBusqueda): void {
    this.tipoBusqueda.set(tipo);
  }

  setValorBusqueda(valor: string): void {
    this.valorBusqueda.set(valor);
  }

  setTipoPredio(tipo: string): void {
    this.tipoPredio.set(tipo);
  }

  setMostrarResultado(mostrar: boolean): void {
    this.mostrarResultado.set(mostrar);
  }

  setDatosComplementarios(datos: DatosComplementarios): void {
    this.datosComplementarios.set(datos);
  }

  setPredioData(predioData: PredioData, tipo: TipoBusqueda, valor: string): void {
    this.predioData.set(predioData);
    this.tipoBusqueda.set(tipo);
    this.valorBusqueda.set(valor);
  }

  reset(): void {
    this.tipoBusqueda.set(undefined);
    this.valorBusqueda.set(undefined);
    this.predioData.set(undefined);
    this.datosComplementarios.set(undefined);
    this.tipoPredio.set(undefined);
    this.mostrarResultado.set(false);
  }
}
