import {
  Component,
  Input,
  forwardRef,
  OnInit,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.html',
  styleUrls: ['./input.css'],
})
export class InputComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @Input() type: 'text' | 'number' | 'tel' | 'email' | 'password' = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() note: string = '';
  @Input() readonly: boolean = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() formControl!: FormControl;

  @ViewChild('inputElement', { static: true }) inputElement!: ElementRef;

  private renderer = inject(Renderer2);

  control = new FormControl();
  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.formControl) {
      this.control = this.formControl;
    }
  }

  ngAfterViewInit(): void {
    this.updateErrorState();
  }

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  get isRequired(): boolean {
    return this.control.hasValidator(Validators.required);
  }

  get showError(): boolean {
    return !!(this.control.invalid && (this.control.touched || this.control.dirty));
  }

  get showSuccess(): boolean {
    return !!(
      this.control.valid &&
      (this.control.touched || this.control.dirty) &&
      this.control.value
    );
  }

  getErrorMessage(): string {
    if (this.control.errors) {
      const errors = this.control.errors;

      if (errors['required']) return 'Este campo es obligatorio';
      if (errors['email']) return 'Ingrese un correo electrónico válido';
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
      if (errors['max']) return `El valor máximo es ${errors['max'].max}`;
      if (errors['pattern']) return 'Formato inválido';

      return 'Campo inválido';
    }
    return '';
  }

  private updateErrorState(): void {
    if (this.showError) {
      this.renderer.addClass(this.inputElement.nativeElement, 'error');
    } else {
      this.renderer.removeClass(this.inputElement.nativeElement, 'error');
    }
  }

  onInputChange(): void {
    this.updateErrorState();
  }
}
