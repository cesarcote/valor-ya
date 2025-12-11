import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should verify initial state is false', (done) => {
    service.currentLoading$.subscribe((status) => {
      expect(status).toBeFalse();
      done();
    });
  });

  it('should change state to true when calling show()', (done) => {
    service.show();
    service.currentLoading$.subscribe((status) => {
      expect(status).toBeTrue();
      done();
    });
  });

  it('should change state to false when calling hide()', (done) => {
    service.show();
    service.hide();
    service.currentLoading$.subscribe((status) => {
      expect(status).toBeFalse();
      done();
    });
  });

  it('should toggle state', (done) => {
    service.toggle(true);
    service.currentLoading$.subscribe((status) => {
      expect(status).toBeTrue();
      done();
    });
  });
});
