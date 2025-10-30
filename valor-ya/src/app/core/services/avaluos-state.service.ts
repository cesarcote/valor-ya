import { Injectable, signal } from '@angular/core';
import { TipoUnidad } from '../models/parametricas.model';

@Injectable({
  providedIn: 'root',
})
export class AvaluosStateService {
  public readonly currentStep = signal<number>(1);
  public readonly formData = signal<any>({});
  public readonly tipoUnidadSeleccionada = signal<TipoUnidad | undefined>(undefined);

  setFormData(data: any): void {
    this.formData.update((currentData) => ({ ...currentData, ...data }));
  }

  setTipoUnidad(tipoUnidad: TipoUnidad): void {
    this.tipoUnidadSeleccionada.set(tipoUnidad);
  }

  reset(): void {
    this.currentStep.set(1);
    this.formData.set({});
    this.tipoUnidadSeleccionada.set(undefined);
  }
}
