import { Injectable } from '@angular/core';

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'light'
  | 'dark';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    if (typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.className =
        'notification-container position-fixed top-0 start-50 translate-middle-x p-3';
      this.container.style.zIndex = '9999';
      this.container.style.width = '90%';
      this.container.style.maxWidth = '600px';
      document.body.appendChild(this.container);
    }
  }

  show(message: string, type: NotificationType = 'success'): void {
    if (!this.container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${this.mapTypeToBootstrap(type)} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');

    alert.innerHTML = `
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    this.container.appendChild(alert);

    setTimeout(() => {
      if (alert.parentNode) {
        alert.classList.remove('show');
        setTimeout(() => {
          if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
          }
        }, 150);
      }
    }, 3000);
  }

  private mapTypeToBootstrap(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      default:
        return 'primary';
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  primary(message: string): void {
    this.show(message, 'primary');
  }

  secondary(message: string): void {
    this.show(message, 'secondary');
  }

  light(message: string): void {
    this.show(message, 'light');
  }

  dark(message: string): void {
    this.show(message, 'dark');
  }
}
