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
import { ValidateStatusFieldPipe } from '../../pipes/validate-status-field.pipe';
import { ValidateMessageFieldPipe } from '../../pipes/validate-message-field.pipe';

@Component({
  selector: 'app-textarea',
  imports: [CommonModule, ReactiveFormsModule, ValidateStatusFieldPipe, ValidateMessageFieldPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  templateUrl: './textarea.html',
  styleUrls: ['./textarea.css'],
})
export class TextareaComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() dataId: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
  @Input() cols: number = 50;
  @Input() isResizable: boolean = true;
  @Input() name: string = '';
  @Input() maxLength: number = 500;
  @Input() note: string = '';
  @Input() formControl!: FormControl;

  control = new FormControl();
  onChange: any = (value: any) => {};
  onTouched: any = () => {};

  ngOnInit() {
    if (this.formControl) {
      this.control = this.formControl;
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

  totalChart(): number {
    return this.control.value ? this.control.value.length : 0;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.control.errors;
  }

  isRequired(): boolean {
    return this.control ? this.control.hasValidator(Validators.required) : false;
  }
}
