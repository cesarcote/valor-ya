import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrls: ['./alert.css'],
})
export class AlertComponent implements OnInit, OnChanges {
  @Input() type: 'info' | 'error' | 'success' | 'warning' = 'info';
  @Input() dismissible = false;

  typeClass = '';
  iconClass = '';
  isVisible = true;

  ngOnInit(): void {
    this.updateStyle();
  }

  ngOnChanges(): void {
    this.updateStyle();
  }

  updateStyle(): void {
    switch (this.type) {
      case 'info':
        this.typeClass = 'alert-info';
        this.iconClass = 'icon-info';
        break;
      case 'error':
        this.typeClass = 'alert-error';
        this.iconClass = 'icon-error';
        break;
      case 'success':
        this.typeClass = 'alert-success';
        this.iconClass = 'icon-success';
        break;
      case 'warning':
        this.typeClass = 'alert-warning';
        this.iconClass = 'icon-warning';
        break;
    }
  }

  dismiss(): void {
    this.isVisible = false;
  }
}
