import { Validators, ValidatorFn } from '@angular/forms';

export type ColombiaDocumentType = 'CC' | 'CE' | 'NIT' | 'TI' | 'PA' | 'NUIP';

type DocumentRules = { minLength: number; maxLength: number; pattern: RegExp; inputMode: 'numeric' | 'text' };

export function getColombiaDocumentRules(tipoDocumento?: ColombiaDocumentType): DocumentRules {
  if (tipoDocumento === 'CC') {
    return { minLength: 6, maxLength: 10, pattern: /^\d+$/, inputMode: 'numeric' };
  }

  if (tipoDocumento === 'CE') {
    return { minLength: 6, maxLength: 12, pattern: /^\d+$/, inputMode: 'numeric' };
  }

  if (tipoDocumento === 'NIT') {
    return { minLength: 9, maxLength: 10, pattern: /^\d+$/, inputMode: 'numeric' };
  }

  if (tipoDocumento === 'TI') {
    return { minLength: 8, maxLength: 11, pattern: /^\d+$/, inputMode: 'numeric' };
  }

  if (tipoDocumento === 'NUIP') {
    return { minLength: 10, maxLength: 10, pattern: /^\d+$/, inputMode: 'numeric' };
  }

  if (tipoDocumento === 'PA') {
    return { minLength: 6, maxLength: 16, pattern: /^[0-9A-Za-z]+$/, inputMode: 'text' };
  }

  return { minLength: 4, maxLength: 16, pattern: /^[0-9A-Za-z]+$/, inputMode: 'text' };
}

export function colombiaDocumentNumberValidators(tipoDocumento?: ColombiaDocumentType): ValidatorFn[] {
  const rules = getColombiaDocumentRules(tipoDocumento);
  return [
    Validators.required,
    Validators.minLength(rules.minLength),
    Validators.maxLength(rules.maxLength),
    Validators.pattern(rules.pattern),
  ];
}

export function colombiaPhoneValidators(): ValidatorFn[] {
  return [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(10),
    Validators.pattern(/^\d{10}$/),
  ];
}