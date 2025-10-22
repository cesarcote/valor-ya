import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AvaluosState {
  currentStep: number;
  formData: any;
}

@Injectable({
  providedIn: 'root',
})
export class AvaluosStateService {
  private initialState: AvaluosState = {
    currentStep: 1,
    formData: {},
  };

  private stateSubject = new BehaviorSubject<AvaluosState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  getState(): AvaluosState {
    return this.stateSubject.value;
  }

  setFormData(data: any): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      formData: { ...currentState.formData, ...data },
    });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }
}
