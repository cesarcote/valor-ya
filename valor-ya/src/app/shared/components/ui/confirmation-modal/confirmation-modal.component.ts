import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css'],
})
export class ConfirmationModalComponent {
  // Outputs para comunicación con el componente padre
  confirm = output<void>();
  cancelAction = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }
}
