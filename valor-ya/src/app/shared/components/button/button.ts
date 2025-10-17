import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Button component following Gov.co design system
 *
 * @example
 * <app-button
 *   text="Consultar"
 *   variant="fill"
 *   type="submit"
 *   [disabled]="form.invalid">
 * </app-button>
 */
@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  /**
   * Button text content
   */
  @Input() text: string = 'Button';

  /**
   * Button variant style
   * - 'fill': Solid button with background color
   * - 'outline': Button with border and transparent background
   */
  @Input() variant: 'fill' | 'outline' = 'fill';

  /**
   * Button HTML type attribute
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Full width button
   */
  @Input() fullWidth: boolean = false;

  /**
   * Additional CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Click event emitter
   */
  @Output() clicked = new EventEmitter<void>();

  /**
   * Get button CSS classes
   */
  get buttonClasses(): string {
    const classes = ['btn-govco'];

    if (this.variant === 'fill') {
      classes.push('fill-btn-govco');
    } else {
      classes.push('outline-btn-govco');
    }

    if (this.fullWidth) {
      classes.push('w-100');
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }

  /**
   * Handle button click
   */
  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
