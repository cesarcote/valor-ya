import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validateMessageField',
})
export class ValidateMessageFieldPipe implements PipeTransform {
  messages: any = {
    required: 'Este campo es requerido',
    minlength: 'Debe contener al menos :requiredLength caracteres',
    maxlength: 'No debe contener más de :requiredLength caracteres',
    pattern: 'Formato inválido',
    email: 'Correo electrónico no válido',
    min: 'El valor mínimo permitido es :min',
    max: 'El valor máximo permitido es :max',
  };

  transform(value: any) {
    if (value) {
      const keys: string[] = Object.keys(value);
      const texto = this.messages[keys[0]];
      const textoReplace = this.replacePlaceholders(texto, value[keys[0]]);
      return textoReplace;
    }
    return '';
  }

  private replacePlaceholders(template: string, values: { [key: string]: string }): string {
    return template.replace(/:([a-zA-Z]+)/g, (_, key) => values[key] || `:${key}`);
  }
}
