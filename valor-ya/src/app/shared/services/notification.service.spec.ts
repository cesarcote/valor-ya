import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    const existingContainer = document.querySelector('.notification-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create container on initialization', () => {
    const container = document.querySelector('.notification-container');
    expect(container).toBeTruthy();
  });

  it('should show success notification', () => {
    service.success('Test Success');
    const alert = document.querySelector('.alert-success');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Test Success');
  });

  it('should show error notification', () => {
    service.error('Test Error');
    const alert = document.querySelector('.alert-danger');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Test Error');
  });

  it('should remove notification automatically after timeout', fakeAsync(() => {
    service.info('Auto Remove');
    const alert = document.querySelector('.alert-info');
    expect(alert).toBeTruthy();

    // Fast-forward 3000ms (main timeout)
    tick(3000);
    // Fast-forward 150ms (transition timeout)
    tick(150);

    const removedAlert = document.querySelector('.alert-info');
    expect(removedAlert).toBeNull();
  }));

  it('should verify all types', () => {
    service.warning('Warning');
    expect(document.querySelector('.alert-warning')).toBeTruthy();

    service.primary('Primary');
    expect(document.querySelector('.alert-primary')).toBeTruthy();

    service.secondary('Secondary');
    expect(document.querySelector('.alert-secondary')).toBeTruthy();
  });
});
