import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { PropertyDataComponent } from './property-data/property-data.component';
import { PredioData } from '../../../core/models/predio-data.model';

@Component({
  selector: 'app-process-container',
  imports: [CommonModule, MapViewerComponent, PropertyDataComponent],
  templateUrl: './process-container.component.html',
  styleUrls: ['./process-container.component.css'],
})
export class ProcessContainerComponent implements OnInit {
  predioData?: PredioData;
  hasData: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const state = history.state;
    if (state && state.predioData) {
      this.predioData = state.predioData;
      this.hasData = true;
    }
  }

  onVolver(): void {
    this.router.navigate(['/valor-ya']);
  }

  onConfirmar(): void {
    this.router.navigate(['/valor-ya/response'], {
      state: { predioData: this.predioData },
    });
  }
}
