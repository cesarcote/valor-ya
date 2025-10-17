import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-viewer',
  imports: [CommonModule],
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.css'],
})
export class MapViewerComponent {
  @Input() hasData: boolean = false;
  @Input() coordenadas?: { lat: number; lng: number };
}
