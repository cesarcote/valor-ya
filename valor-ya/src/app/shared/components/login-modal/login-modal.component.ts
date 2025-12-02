import { Component, inject, signal, OnInit, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DocumentType } from '../../../core/models/user.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent, ButtonComponent],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css'],
})
export class LoginModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  // Outputs para comunicación con el componente padre
  closeModal = output<void>();
  openRegister = output<void>();
  loginSuccess = output<void>();

  // Estado del componente
  stepOneCompleted = signal(false);
  isLoading = signal(false);
  hidePassword = signal(true);
  emailUser = signal('');
  documentTypes = signal<DocumentType[]>([]);
  showConfirmation = signal(false);

  // Formularios
  stepOneForm!: FormGroup;
  stepTwoForm!: FormGroup;

  // Escuchar tecla ESC para mostrar confirmación
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.tryClose();
  }

  ngOnInit(): void {
    this.initForms();
    this.loadDocumentTypes();
  }

  private initForms(): void {
    this.stepOneForm = this.fb.group({
      documentType: ['', [Validators.required]],
      documentNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(12),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });

    this.stepTwoForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    });
  }

  private loadDocumentTypes(): void {
    this.authService.getDocumentTypes().subscribe({
      next: (types) => this.documentTypes.set(types),
      error: (err) => console.error('Error cargando tipos de documento:', err),
    });
  }

  // Getters para acceso fácil a los controles
  get documentType() {
    return this.stepOneForm.get('documentType');
  }
  get documentNumber() {
    return this.stepOneForm.get('documentNumber');
  }
  get password() {
    return this.stepTwoForm.get('password');
  }

  onContinue(): void {
    if (this.stepOneForm.invalid) {
      this.stepOneForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Verificar si el documento existe (simulación de envío de clave temporal)
    this.authService
      .checkDocumentAvailability(this.documentNumber?.value, this.documentType?.value)
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);

          if (result.available) {
            // Documento no registrado
            this.documentNumber?.setErrors({ notFoundID: true });
          } else {
            // Documento existe, continuar al paso 2
            this.stepOneCompleted.set(true);
            // Simular email parcialmente oculto
            this.emailUser.set('us***@ejemplo.com');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Error al verificar el documento');
        },
      });
  }

  onLogin(): void {
    if (this.stepTwoForm.invalid) {
      this.stepTwoForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService
      .login({
        documentType: this.documentType?.value,
        documentNumber: this.documentNumber?.value,
        password: this.password?.value,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          if (response.success) {
            this.notificationService.success(response.message);
            this.loginSuccess.emit();
            this.closeModal.emit();
          } else {
            this.password?.setErrors({ invalidPassword: true });
            this.notificationService.error(response.message);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Error al iniciar sesión');
        },
      });
  }

  onBack(): void {
    this.stepOneCompleted.set(false);
    this.stepTwoForm.reset();
  }

  onClose(): void {
    this.tryClose();
  }

  private tryClose(): void {
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

  private hasUnsavedData(): boolean {
    const hasStepOneData =
      this.stepOneForm.get('documentType')?.value || this.stepOneForm.get('documentNumber')?.value;
    const hasStepTwoData = this.stepTwoForm.get('password')?.value;
    return hasStepOneData || hasStepTwoData;
  }

  onOpenRegister(): void {
    this.openRegister.emit();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  clearErrors(): void {
    this.documentNumber?.setErrors(null);
  }
}
