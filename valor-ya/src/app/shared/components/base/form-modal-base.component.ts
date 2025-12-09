import { Component, HostListener, output, signal } from '@angular/core';

@Component({
  template: '',
})
export abstract class FormModalBaseComponent {
  // Outputs para comunicación con el componente padre
  closeModal = output<void>();

  // Estado del componente
  showConfirmation = signal(false);

  // Método abstracto que deben implementar los hijos
  protected abstract hasUnsavedData(): boolean;

  // Escuchar tecla ESC para mostrar confirmación
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.tryClose();
  }

  onClose(): void {
    this.tryClose();
  }

  protected tryClose(): void {
    if (this.hasUnsavedData()) {
      this.showConfirmation.set(true);
    } else {
      this.closeModal.emit();
    }
  }

  onConfirmClose(): void {
    this.showConfirmation.set(false);
    this.closeModal.emit();
  }

  onCancelClose(): void {
    this.showConfirmation.set(false);
  }
}
