import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-predio-found-header',
  imports: [ButtonComponent],
  templateUrl: './predio-found-header.html',
  styleUrls: ['./predio-found-header.css'],
})
export class PredioFoundHeaderComponent {
  @Input() title: string = '✓ Predio Encontrado';
  @Input() showNewSearchButton: boolean = true;
  @Output() newSearch = new EventEmitter<void>();

  onNewSearch(): void {
    this.newSearch.emit();
  }
}
