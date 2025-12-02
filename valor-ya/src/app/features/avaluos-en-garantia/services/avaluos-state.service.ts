import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AvaluosStateService {
  public readonly currentStep = signal<number>(1);
  public readonly formData = signal<any>({});

  setFormData(data: any): void {
    this.formData.update((currentData) => ({ ...currentData, ...data }));
  }

  reset(): void {
    this.currentStep.set(1);
    this.formData.set({});
  }
}
