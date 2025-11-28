import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  @Input() text: string = 'Button';

  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'link' = 'primary';

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Input() disabled: boolean = false;

  @Input() fullWidth: boolean = false;

  @Input() rounded: boolean = true;

  @Input() customClass: string = '';

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.variant}`];

    if (this.rounded) {
      classes.push('rounded-pill');
    }

    if (this.fullWidth) {
      classes.push('w-100');
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
