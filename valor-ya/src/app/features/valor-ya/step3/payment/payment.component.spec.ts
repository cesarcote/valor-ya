import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PaymentComponent } from './payment';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ValorYaStateService } from '../../services/valor-ya-state.service';
import { ValorYaStepperService } from '../../services/valor-ya-stepper.service';
import { PaymentService } from '../../services/payment.service';
import { ComprasService } from '../../services/compras.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  // Mocks
  let mockRouter: any;
  let mockStateService: any;
  let mockStepperService: any;
  let mockPaymentService: any;
  let mockComprasService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    mockStateService = {
      predioData: signal({ chip: 'AAA123CHIP', direccion: 'Calle 123' }),
      setCompraInfo: jasmine.createSpy('setCompraInfo'),
      setPagoId: jasmine.createSpy('setPagoId'),
      reset: jasmine.createSpy('reset'),
    };

    mockStepperService = {
      setStep: jasmine.createSpy('setStep'),
      reset: jasmine.createSpy('reset'),
    };

    mockPaymentService = {
      initiatePayment: jasmine.createSpy('initiatePayment').and.returnValue(
        of({
          success: true,
          data: { payment: { payment_url: null } }, // Null to prevent window.location.href redirect in test
        })
      ),
      getPaymentUrl: (res: any) => res.data.payment.payment_url,
    };

    mockComprasService = {
      crearCompra: jasmine.createSpy('crearCompra').and.returnValue(of({ compraId: 1 })),
      crearPago: jasmine.createSpy('crearPago').and.returnValue(of({ pagoId: 100 })),
    };

    mockAuthService = {
      currentUser: signal({
        id: 1,
        tipoDocumento: { codigo: 'CC' },
        numeroDocumento: '12345678',
        nombre: 'John',
        apellido: 'Doe',
        email: 'john@example.com',
        direccionCorrespondencia: 'Calle 123',
        celular: '3001234567',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule], // Do NOT import PaymentComponent here if we are overriding it, or import and override
      // Actually with standalone we import it. Logic below overrides its metadata.
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ValorYaStateService, useValue: mockStateService },
        { provide: ValorYaStepperService, useValue: mockStepperService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: ComprasService, useValue: mockComprasService },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PaymentComponent, {
        set: {
          imports: [ReactiveFormsModule], // Remove all UI child components
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.facturacionForm).toBeDefined();
  });

  it('should initialize form with user data if authenticated', () => {
    const form = component.facturacionForm;
    expect(form.get('nombre')?.value).toBe('John');
    expect(form.get('email')?.value).toBe('john@example.com');
  });

  it('should show modal warning if predioData is missing', () => {
    // Reset component with empty state
    mockStateService.predioData.set(null);
    component.ngOnInit();

    expect(component.showModal()).toBeTrue();
    expect(component.modalIconType()).toBe('warning');
  });

  it('should navigate back on close modal if not success', () => {
    component.modalIconType.set('warning');
    component.onCloseModal();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/valor-ya/seleccionar']);
  });

  describe('Form Submission', () => {
    it('should validate form invalidity', () => {
      component.facturacionForm.controls['email'].setValue('invalid-email');
      component.onSubmitFacturacion();
      expect(component.errorMessage()).toContain('correctamente'); // "complete todos los campos requeridos correctamente"
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should execute full payment flow on valid submission', fakeAsync(() => {
      // Mock window.location assign to avoid actual redirect during test
      // Since we can't easily mock window.location in JSDOM/Karma without wrappers,
      // we can assume the flow reaches the point of calling services.
      // Or we can check if console.error is NOT called.

      // Fill form correctly (already filled by autofill test, but ensures validity)
      component.facturacionForm.patchValue({
        tipoDocumento: 'CC',
        numeroDocumento: '12345678',
        nombre: 'John',
        apellidos: 'Doe',
        direccion: 'Calle 123',
        ciudad: 'Bogota',
        telefono: '3001234567',
        email: 'john@example.com',
      });

      const originalLocation = window.location;
      // Mocking window.location is hard. We'll trust the flow if services are called.
      // A safer way is checking if 'window.location.href' is set, but that requires defining writable location.
      // For now, let's verify service calls sequence.

      component.onSubmitFacturacion();

      expect(component.isSubmitting()).toBeFalse(); // Should be false AFTER execution if sync, or we verify completion

      tick(); // Process Observables if any async left

      expect(mockComprasService.crearCompra).toHaveBeenCalled();
      expect(mockStateService.setCompraInfo).toHaveBeenCalledWith(1, jasmine.any(String));

      expect(mockComprasService.crearPago).toHaveBeenCalled();
      expect(mockStateService.setPagoId).toHaveBeenCalledWith(100);

      expect(mockPaymentService.initiatePayment).toHaveBeenCalled();

      // Final state
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should handle error when creating compra fails', fakeAsync(() => {
      mockComprasService.crearCompra.and.returnValue(throwError(() => new Error('API Error')));

      component.facturacionForm.patchValue({ cidade: 'Bogota' }); // Ensure valid
      component.facturacionForm.controls['ciudad'].setValue('Bogota');
      component.facturacionForm.controls['direccion'].setValue('Calle Real');
      component.facturacionForm.controls['telefono'].setValue('321654987');

      component.onSubmitFacturacion();
      tick();

      expect(component.errorMessage()).toContain('Error al crear la compra');
      expect(component.isSubmitting()).toBeFalse();
    }));
  });
});
