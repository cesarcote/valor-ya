import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredioData } from '../../../../core/models/predio-data.model';

@Component({
  selector: 'app-property-data',
  imports: [CommonModule],
  templateUrl: './property-data.component.html',
  styleUrls: ['./property-data.component.css'],
})
export class PropertyDataComponent {
  @Input() predioData?: PredioData;
}
