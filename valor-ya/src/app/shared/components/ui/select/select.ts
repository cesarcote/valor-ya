import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { ValidateStatusFieldPipe } from '../../../pipes/validate-status-field.pipe';
import { ValidateMessageFieldPipe } from '../../../pipes/validate-message-field.pipe';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [CommonModule, ReactiveFormsModule, ValidateStatusFieldPipe, ValidateMessageFieldPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  templateUrl: './select.html',
  styleUrls: ['./select.css'],
})
export class SelectComponent implements ControlValueAccessor, OnInit {
  @Input() dataId: string = '';
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = 'Selecciona una opción';
  @Input() options: SelectOption[] = [];
  @Input() disabled: boolean = false;
  @Input() helpText: string = '';
  @Input() formCtr: any;

  control!: FormControl;
  onChange: any = (value: any) => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    if (this.formCtr) {
      this.control = this.formCtr;
    } else {
      this.control = new FormControl();
    }
  }

  writeValue(value: any): void {
    this.control.setValue(value);
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

  validate(control: AbstractControl): ValidationErrors | null {
    return this.control.errors;
  }

  isRequired(): boolean {
    return this.control ? this.control.hasValidator(Validators.required) : false;
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
}
