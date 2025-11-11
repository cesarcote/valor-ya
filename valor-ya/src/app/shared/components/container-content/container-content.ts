import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-container-content',
  imports: [ButtonComponent],
  templateUrl: './container-content.html',
  styleUrls: ['./container-content.css'],
})
export class ContainerContentComponent {
  @Input() title: string = '';
  @Input() showBackButton: boolean = true;
  @Input() showContinueButton: boolean = true;
  @Input() backButtonText: string = 'Volver';
  @Input() continueButtonText: string = 'Continuar';
  @Input() continueButtonDisabled: boolean = false;
  @Input() backButtonDisabled: boolean = false;
  @Input() isLoading: boolean = false;

  @HostBinding('attr.title') get hostTitle(): string {
    return '';
  }

  @Output() volver = new EventEmitter<void>();
  @Output() continuar = new EventEmitter<void>();

  onVolverClick(): void {
    this.volver.emit();
  }

  onContinuarClick(): void {
    this.continuar.emit();
  }
}
