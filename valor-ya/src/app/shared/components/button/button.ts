import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Button component using Bootstrap custom styles
 *
 * @example
 * <app-button
 *   text="Consultar"
 *   variant="primary"
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
   * Button Bootstrap variant
   * - 'primary': Main action button (#FEB400)
   * - 'secondary': Secondary action button
   * - 'success': Success/confirmation actions
   * - 'danger': Critical/destructive actions
   * - 'warning': Warning actions
   * - 'info': Information actions
   * - 'light': Light theme actions
   * - 'dark': Dark theme actions
   * - 'link': Link styled button
   */
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
   * Rounded pill style
   */
  @Input() rounded: boolean = true;

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

  /**
   * Handle button click
   */
  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
