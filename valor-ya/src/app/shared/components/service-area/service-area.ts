import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-area',
  imports: [CommonModule],
  templateUrl: './service-area.html',
  styleUrls: ['./service-area.css'],
})
export class ServiceArea {
  isDoubtsOpen = signal(false);
  isExperienceOpen = signal(false);

  toggleDoubts() {
    this.isDoubtsOpen.update((v) => !v);
    if (this.isDoubtsOpen()) {
      this.isExperienceOpen.set(false);
    }
  }

  toggleExperience() {
    this.isExperienceOpen.update((v) => !v);
    if (this.isExperienceOpen()) {
      this.isDoubtsOpen.set(false);
    }
  }
}
