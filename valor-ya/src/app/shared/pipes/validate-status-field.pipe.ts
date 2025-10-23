import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validateStatusField',
})
export class ValidateStatusFieldPipe implements PipeTransform {
  transform(value: any) {
    if (!value.valid && (value.dirty || value.touched || value.writeValue) && value?.status != 'DISABLED') {
      return 'error';
    } else if (!value.dirty) {
      return null;
    }
    return 'success';
  }
}
