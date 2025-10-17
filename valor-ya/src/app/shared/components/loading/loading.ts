import { Component, inject, OnInit } from '@angular/core';

import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrls: ['./loading.css'],
})
export class LoadingComponent implements OnInit {
  private loadingService = inject(LoadingService);
  isLoading = false;

  ngOnInit(): void {
    this.loadingService.currentLoading$.subscribe((status) => {
      this.isLoading = status;
    });
  }
}
