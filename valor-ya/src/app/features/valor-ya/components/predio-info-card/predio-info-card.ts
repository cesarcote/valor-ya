import { Component, Input } from '@angular/core';
import { PredioData } from '../../../core/models/predio-data.model';

@Component({
  selector: 'app-predio-info-card',
  imports: [],
  templateUrl: './predio-info-card.html',
  styleUrls: ['./predio-info-card.css'],
})
export class PredioInfoCardComponent {
  @Input() predioData?: PredioData;
  @Input() showMessage: boolean = true;
  @Input() showAllFields: boolean = false;
}
