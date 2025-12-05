import { Component, inject, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './loading.html',
  styleUrls: ['./loading.css'],
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
