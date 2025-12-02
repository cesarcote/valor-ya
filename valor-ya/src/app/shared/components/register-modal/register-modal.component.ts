import { Component, inject, signal, OnInit, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DocumentType, SexType } from '../../../core/models/user.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent, ButtonComponent],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css'],
})
export class RegisterModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  // Outputs para comunicación con el componente padre
  closeModal = output<void>();
  openLogin = output<void>();
  registerSuccess = output<void>();

  // Estado del componente
  currentStep = signal<1 | 2>(1);
  isLoading = signal(false);
  acceptTerms = signal(false);
  documentTypes = signal<DocumentType[]>([]);
  sexTypes = signal<SexType[]>([]);
  showConfirmation = signal(false);

  // Formularios
  stepOneForm!: FormGroup;
  stepTwoForm!: FormGroup;

  // Fecha máxima para expedición (hoy)
  maxDate = new Date().toISOString().split('T')[0];

  // Escuchar tecla ESC para mostrar confirmación
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.tryClose();
  }

  ngOnInit(): void {
    this.initForms();
    this.loadDocumentTypes();
    this.loadSexTypes();
  }

  private initForms(): void {
    this.stepOneForm = this.fb.group(
      {
        documentType: ['', [Validators.required]],
        documentNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(12),
            Validators.pattern(/^[0-9A-Za-z]+$/),
          ],
        ],
        documentNumberConfirm: ['', [Validators.required]],
        expeditionDate: ['', [Validators.required]],
      },
      { validators: this.documentMatchValidator }
    );

    this.stepTwoForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(80),
            Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
          ],
        ],
        lastname: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(60),
            Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        emailConfirm: ['', [Validators.required]],
        cellphone: [
          '',
          [
            Validators.required,
            Validators.minLength(7),
            Validators.maxLength(20),
            Validators.pattern(/^\d+$/),
          ],
        ],
        sexType: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.emailMatchValidator }
    );
  }

  private loadDocumentTypes(): void {
    this.authService.getDocumentTypes().subscribe({
      next: (types) => this.documentTypes.set(types),
      error: (err) => console.error('Error cargando tipos de documento:', err),
    });
  }

  private loadSexTypes(): void {
    this.authService.getSexTypes().subscribe({
      next: (types) => this.sexTypes.set(types),
      error: (err) => console.error('Error cargando tipos de sexo:', err),
    });
  }

  // Validadores personalizados
  private documentMatchValidator(control: AbstractControl): ValidationErrors | null {
    const docNumber = control.get('documentNumber');
    const docConfirm = control.get('documentNumberConfirm');

    if (docNumber && docConfirm && docNumber.value !== docConfirm.value) {
      docConfirm.setErrors({ mismatch: true });
      return { documentMismatch: true };
    }
    return null;
  }

  private emailMatchValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.get('email');
    const emailConfirm = control.get('emailConfirm');

    if (email && emailConfirm && email.value !== emailConfirm.value) {
      emailConfirm.setErrors({ mismatch: true });
      return { emailMismatch: true };
    }
    return null;
  }

  // Getters para acceso fácil a los controles
  get documentType() {
    return this.stepOneForm.get('documentType');
  }
  get documentNumber() {
    return this.stepOneForm.get('documentNumber');
  }
  get documentNumberConfirm() {
    return this.stepOneForm.get('documentNumberConfirm');
  }
  get expeditionDate() {
    return this.stepOneForm.get('expeditionDate');
  }
  get name() {
    return this.stepTwoForm.get('name');
  }
  get lastname() {
    return this.stepTwoForm.get('lastname');
  }
  get email() {
    return this.stepTwoForm.get('email');
  }
  get emailConfirm() {
    return this.stepTwoForm.get('emailConfirm');
  }
  get cellphone() {
    return this.stepTwoForm.get('cellphone');
  }
  get sexType() {
    return this.stepTwoForm.get('sexType');
  }
  get acceptTermsControl() {
    return this.stepTwoForm.get('acceptTerms');
  }

  // Es NIT?
  get isNIT(): boolean {
    return this.documentType?.value === 2 || this.documentType?.value === '2';
  }

  onContinueToStepTwo(): void {
    if (this.stepOneForm.invalid) {
      this.stepOneForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Verificar disponibilidad del documento
    this.authService
      .checkDocumentAvailability(this.documentNumber?.value, this.documentType?.value)
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);

          if (result.available) {
            this.currentStep.set(2);
          } else {
            this.documentNumber?.setErrors({ duplicateID: true });
            this.notificationService.error(result.message);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Error al verificar el documento');
        },
      });
  }

  onBackToStepOne(): void {
    this.currentStep.set(1);
  }

  onRegister(): void {
    if (this.stepTwoForm.invalid) {
      this.stepTwoForm.markAllAsTouched();
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

    this.authService
      .register({
        tipoDocumento: tipoDocumento,
        numeroDocumento: this.documentNumber?.value,
        fechaExpedicion: this.expeditionDate?.value,
        nombre: this.name?.value,
        apellido: this.lastname?.value,
        email: this.email?.value,
        celular: this.cellphone?.value,
        tipoGenero: Number(this.sexType?.value),
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          if (response.success && response.data?.success) {
            // Respuesta exitosa - mostrar mensaje del data interno
            const mensaje = response.data.message || response.message || '¡Registro exitoso!';
            this.notificationService.success(mensaje);
            this.registerSuccess.emit();
            this.closeModal.emit();
          } else {
            // Error - puede venir en response.error o response.data.message
            const errorMsg = response.error || response.message || 'Error en el registro';
            this.notificationService.error(errorMsg);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Error al registrar usuario');
        },
      });
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
      this.stepOneForm.get('documentType')?.value ||
      this.stepOneForm.get('documentNumber')?.value ||
      this.stepOneForm.get('expeditionDate')?.value;
    const hasStepTwoData =
      this.stepTwoForm.get('name')?.value ||
      this.stepTwoForm.get('lastname')?.value ||
      this.stepTwoForm.get('email')?.value ||
      this.stepTwoForm.get('cellphone')?.value;
    return hasStepOneData || hasStepTwoData;
  }

  onOpenLogin(): void {
    this.openLogin.emit();
  }

  onTermsChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.acceptTerms.set(checkbox.checked);
  }

  // Getters para mensajes de error (simplifican el template HTML)
  get documentNumberError(): string {
    const control = this.stepOneForm.get('documentNumber');
    if (control?.invalid && control?.touched) {
      if (control.hasError('required')) return 'Debe escribir su número de documento.';
      if (control.hasError('minlength')) return 'El documento debe tener mínimo 4 dígitos.';
      if (control.hasError('pattern')) return 'El formato del número de documento no es válido.';
      if (control.hasError('duplicateID'))
        return 'Este número de documento ya se encuentra registrado.';
    }
    return '';
  }

  get documentNumberConfirmError(): string {
    const control = this.stepOneForm.get('documentNumberConfirm');
    if (control?.invalid && control?.touched) {
      if (control.hasError('required')) return 'Debe confirmar su número de documento.';
      if (control.hasError('mismatch')) return 'Los documentos deben coincidir.';
    }
    return '';
  }

  get nameError(): string {
    const control = this.stepTwoForm.get('name');
    if (control?.invalid && control?.touched) {
      if (control.hasError('required'))
        return this.isNIT ? 'Ingrese su razón social.' : 'Ingrese su nombre.';
      if (control.hasError('minlength')) return 'Ingrese mínimo 3 caracteres.';
      if (control.hasError('pattern')) return 'No puede contener caracteres especiales.';
    }
    return '';
  }

  get lastnameError(): string {
    const control = this.stepTwoForm.get('lastname');
    if (control?.invalid && control?.touched) {
      if (control.hasError('required')) return 'Ingrese sus apellidos.';
      if (control.hasError('minlength')) return 'Ingrese mínimo 3 caracteres.';
      if (control.hasError('pattern')) return 'No puede contener números o caracteres especiales.';
    }
    return '';
  }

  get emailError(): string {
    const control = this.stepTwoForm.get('email');
    if (control?.invalid && control?.touched) {
      if (control.hasError('required')) return 'Ingrese un correo electrónico.';
      if (control.hasError('email')) return 'El formato del correo no es correcto.';
    }
    return '';
  }

  get cellphoneError(): string {
    const control = this.stepTwoForm.get('cellphone');
    if (control?.invalid && control?.touched) {
      if (control.hasError('required')) return 'Ingrese su número de celular.';
      if (control.hasError('minlength')) return 'Ingrese un número de mínimo 7 caracteres.';
      if (control.hasError('pattern')) return 'El número de celular no es válido.';
    }
    return '';
  }

  get sexTypeError(): string {
    const control = this.stepTwoForm.get('sexType');
    if (control?.invalid && control?.touched) {
      return 'Debe seleccionar un género.';
    }
    return '';
  }

  get acceptTermsError(): string {
    const control = this.stepTwoForm.get('acceptTerms');
    if (control?.invalid && control?.touched) {
      return 'Debe aceptar los términos y condiciones.';
    }
    return '';
  }

  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  toLowerCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toLowerCase();
  }
}
