import { Injectable, signal, computed } from '@angular/core';
import { PredioData } from '../../valor-ya/models/predio-data.model';
import { DatosComplementarios } from '../../valor-ya/models/datos-complementarios.model';
import { MCMValorYAResultado } from '../../valor-ya/models/mcm-valor-ya.model';

export enum TipoBusqueda {
  CHIP = 'chip',
  DIRECCION = 'direccion',
  FMI = 'fmi',
}

interface BusquedaState {
  tipoBusqueda: TipoBusqueda;
  valorBusqueda: string;
}

const STORAGE_KEY = 'test-busqueda-state';

@Injectable({
  providedIn: 'root',
})
export class TestStateService {
  public readonly tipoBusqueda = signal<TipoBusqueda | undefined>(TipoBusqueda.DIRECCION);
  public readonly valorBusqueda = signal<string | undefined>(undefined);
  public readonly predioData = signal<PredioData | undefined>(undefined);
  public readonly datosComplementarios = signal<DatosComplementarios | undefined>(undefined);
  public readonly tipoPredio = signal<string | undefined>(undefined);
  public readonly mostrarResultado = signal<boolean>(false);
  public readonly valorYaResponse = signal<MCMValorYAResultado | undefined>(undefined);

  public readonly compraId = signal<number | undefined>(undefined);
  public readonly pagoId = signal<number | undefined>(undefined);
  public readonly uuid = signal<string | undefined>(undefined);

  public readonly hasDatosComplementarios = computed(() => !!this.datosComplementarios());

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: BusquedaState = JSON.parse(stored);
        this.tipoBusqueda.set(state.tipoBusqueda);
        this.valorBusqueda.set(state.valorBusqueda);
      }
    } catch (error) {
      console.error('Error al restaurar estado de búsqueda:', error);
    }
  }

  private persistToStorage(): void {
    const tipo = this.tipoBusqueda();
    const valor = this.valorBusqueda();

    if (tipo && valor) {
      const state: BusquedaState = { tipoBusqueda: tipo, valorBusqueda: valor };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  clearStorage(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  hasPendingSearch(): boolean {
    return !!this.tipoBusqueda() && !!this.valorBusqueda();
  }

  setTipoBusqueda(tipo: TipoBusqueda): void {
    this.tipoBusqueda.set(tipo);
  }

  setValorBusqueda(valor: string): void {
    this.valorBusqueda.set(valor);
    this.persistToStorage();
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

  setValorYaResponse(response: MCMValorYAResultado): void {
    this.valorYaResponse.set(response);
  }

  restoreFromPayment(chip: string): void {
    this.predioData.set({ chip } as PredioData);
  }

  setCompraInfo(compraId: number, uuid: string): void {
    this.compraId.set(compraId);
    this.uuid.set(uuid);
  }

  setPagoId(pagoId: number): void {
    this.pagoId.set(pagoId);
  }

  reset(): void {
    this.tipoBusqueda.set(undefined);
    this.valorBusqueda.set(undefined);
    this.predioData.set(undefined);
    this.datosComplementarios.set(undefined);
    this.tipoPredio.set(undefined);
    this.mostrarResultado.set(false);
    this.valorYaResponse.set(undefined);
    this.compraId.set(undefined);
    this.pagoId.set(undefined);
    this.uuid.set(undefined);
    this.clearStorage();
  }
}
