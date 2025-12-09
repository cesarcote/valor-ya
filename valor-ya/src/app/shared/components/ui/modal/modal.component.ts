import { Component, input, output, HostListener } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-modal',
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  message = input.required<string>();
  title = input<string>('Advertencia');
  iconType = input<'success' | 'warning' | 'error'>('warning');
  buttonText = input<string>('Aceptar');
  closeModal = output<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeModal.emit();
  }
}
