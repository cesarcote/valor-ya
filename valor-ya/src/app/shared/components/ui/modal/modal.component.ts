import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  message = input.required<string>();
  title = input<string>('Advertencia');
  iconType = input<'success' | 'warning' | 'error'>('warning');
  buttonText = input<string>('Aceptar');
  close = output<void>();
}
