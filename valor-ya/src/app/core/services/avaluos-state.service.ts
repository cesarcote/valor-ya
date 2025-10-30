import { Injectable, signal, inject } from '@angular/core';
import { TipoUnidad } from '../models/parametricas.model';
import { LocalStorageService } from '../../shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AvaluosStateService {
  private readonly STORAGE_KEY_TIPO_UNIDAD = 'avaluos_tipo_unidad';
  private localStorageService = inject(LocalStorageService);

  public readonly currentStep = signal<number>(1);
  public readonly formData = signal<any>({});
  public readonly tipoUnidadSeleccionada = signal<TipoUnidad | undefined>(undefined);

  setFormData(data: any): void {
    this.formData.update((currentData) => ({ ...currentData, ...data }));
  }

  setTipoUnidad(tipoUnidad: TipoUnidad): void {
    this.tipoUnidadSeleccionada.set(tipoUnidad);
    this.localStorageService.guardar(this.STORAGE_KEY_TIPO_UNIDAD, tipoUnidad);
  }

  recuperarTipoUnidadDeLocalStorage(): TipoUnidad | undefined {
    const tipoUnidad = this.localStorageService.recuperar<TipoUnidad>(this.STORAGE_KEY_TIPO_UNIDAD);
    if (tipoUnidad) {
      this.tipoUnidadSeleccionada.set(tipoUnidad);
      return tipoUnidad;
    }
    return undefined;
  }

  reset(): void {
    this.currentStep.set(1);
    this.formData.set({});
    this.tipoUnidadSeleccionada.set(undefined);
  }
}
