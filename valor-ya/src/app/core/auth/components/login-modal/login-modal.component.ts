import { Component, inject, signal, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { NotificationService } from '../../../../shared/services/notification.service';
import { DocumentType } from '../../../models/user.model';
import { ConfirmationModalComponent } from '../../../../shared/components/ui/confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { FormModalBaseComponent } from '../../../../shared/components/base/form-modal-base.component';

@Component({
  selector: 'app-login-modal',
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent, ButtonComponent],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css'],
})
export class LoginModalComponent extends FormModalBaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly recaptchaV3Service = inject(ReCaptchaV3Service);

  // Outputs para comunicación con el componente padre
  // closeModal heredado de FormModalBaseComponent
  openRegister = output<void>();
  loginSuccess = output<void>();

  // Estado del componente
  stepOneCompleted = signal(false);
  isLoading = signal(false);
  hidePassword = signal(true);
  emailUser = signal('');
  tiempoExpiracion = signal(5);
  documentTypes = signal<DocumentType[]>([]);
  // showConfirmation heredado de FormModalBaseComponent

  // Datos guardados del paso 1 para usar en paso 2
  private tipoDocumentoSeleccionado = '';
  private numeroDocumentoIngresado = '';

  // Formularios
  stepOneForm!: FormGroup;
  stepTwoForm!: FormGroup;

  // Escuchar tecla ESC para mostrar confirmación - Heredado

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

  // Getters para mensajes de error de validación
  get documentNumberError(): string {
    if (this.documentNumber?.hasError('required')) {
      return 'Este campo es requerido.';
    }
    if (this.documentNumber?.hasError('minlength')) {
      return 'El documento debe tener mínimo 4 dígitos.';
    }
    if (this.documentNumber?.hasError('pattern')) {
      return 'El formato del número de documento no es válido.';
    }
    if (this.documentNumber?.hasError('notFoundID')) {
      return 'Este número de documento no se encuentra registrado.';
    }
    if (this.documentNumber?.hasError('blockID')) {
      return 'Este número de documento se encuentra bloqueado.';
    }
    return '';
  }

  get passwordError(): string {
    if (this.password?.hasError('required')) {
      return 'Este campo es requerido.';
    }
    if (this.password?.hasError('minlength') || this.password?.hasError('maxlength')) {
      return 'La contraseña debe tener 4 dígitos.';
    }
    if (this.password?.hasError('invalidPassword')) {
      return 'La contraseña es incorrecta.';
    }
    return '';
  }

  onContinue(): void {
    if (this.stepOneForm.invalid) {
      this.stepOneForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Mapear tipos de documento del frontend al backend
    const tipoDocumentoMap: { [key: number]: string } = {
      1: 'CC', // Cédula de ciudadanía
      2: 'NIT', // NIT
      3: 'CE', // Cédula de extranjería
      4: 'PA', // Pasaporte
      5: 'TI', // Tarjeta de identidad
      6: 'NUIP', // Número Único de Identificación Personal
    };

    const tipoDocValue = Number(this.documentType?.value);
    const tipoDocumento = tipoDocumentoMap[tipoDocValue] || 'CC';

    // Guardar datos para el paso 2
    this.tipoDocumentoSeleccionado = tipoDocumento;
    this.numeroDocumentoIngresado = this.documentNumber?.value;

    // Solicitar clave temporal al API
    this.authService
      .requestTempKey({
        tipoDocumento: tipoDocumento,
        numeroDocumento: this.documentNumber?.value,
        validInput: true,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          if (response.success && response.data?.success) {
            // Clave enviada exitosamente
            const data = response.data.data;
            this.emailUser.set(data.emailOfuscado);
            this.tiempoExpiracion.set(data.tiempoExpiracion);
            this.stepOneCompleted.set(true);
            this.notificationService.success(data.mensaje);
          } else {
            // Error - usuario no encontrado u otro error
            const errorMsg = response.error || response.data?.message || 'Error al solicitar clave';
            this.documentNumber?.setErrors({ notFoundID: true });
            this.notificationService.error(errorMsg);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Error al solicitar clave temporal');
        },
      });
  }

  onLogin(): void {
    if (this.stepTwoForm.invalid) {
      this.stepTwoForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.recaptchaV3Service.execute('login').subscribe({
      next: (token: string) => {
        this.authService
          .login({
            tipoDocumento: this.tipoDocumentoSeleccionado,
            numeroDocumento: this.numeroDocumentoIngresado,
            claveTemporal: this.password?.value,
            recaptchaToken: token,
          })
          .subscribe({
            next: (response) => {
              this.isLoading.set(false);

              if (response.success && response.data?.success) {
                const mensaje = response.data.message || response.message || '¡Bienvenido!';
                this.notificationService.success(mensaje);
                this.loginSuccess.emit();
                this.closeModal.emit();
              } else {
                this.password?.setErrors({ invalidPassword: true });
                const errorMsg = response.error || response.message || 'Clave temporal incorrecta';
                this.notificationService.error(errorMsg);
              }
            },
            error: () => {
              this.isLoading.set(false);
              this.notificationService.error('Error al iniciar sesión');
            },
          });
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        console.error('Error executing reCAPTCHA', error);
        // Fallback or error handling - still try to login?
        // Let's assume strict requirement and fail or try without token
        this.notificationService.error('Error de validación de seguridad. Intente nuevamente.');
      },
    });
  }

  onBack(): void {
    this.stepOneCompleted.set(false);
    this.stepTwoForm.reset();
  }

  protected override hasUnsavedData(): boolean {
    const hasStepOneData =
      this.stepOneForm.get('documentType')?.value || this.stepOneForm.get('documentNumber')?.value;
    const hasStepTwoData = this.stepTwoForm.get('password')?.value;
    return !!(hasStepOneData || hasStepTwoData);
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
