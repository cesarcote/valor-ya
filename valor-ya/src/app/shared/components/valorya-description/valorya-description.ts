import { Component } from '@angular/core';

@Component({
  selector: 'app-valorya-description',
  imports: [],
  templateUrl: './valorya-description.html',
  styleUrl: './valorya-description.css',
})
export class ValoryaDescription {
  title = 'Conoce cuánto vale tu inmueble hoy con datos catastrales actualizados';
  description =
    'Aquí podrás saber cuál es el valor catastral de tu predio. Solo debes ingresar el CHIP, la dirección o la matrícula inmobiliaria para que obtengas un informe detallado, el cual estará disponible para que lo descargues en formato PDF.';
}
