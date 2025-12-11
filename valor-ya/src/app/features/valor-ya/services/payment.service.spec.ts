import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PaymentService, AppModule } from './payment.service';
import { currentEnvironment } from '../../../../environments/environment';
import { PaymentResponse } from '../models/payment.model';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  const mockBaseUrl = currentEnvironment.baseUrl;
  const mockApiUrl = `${mockBaseUrl}/api/paymentez/crear-link-pago`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initiatePayment', () => {
    it('should initiate payment request successfully with default module', () => {
      const mockPaymentData = {
        amount: 10000,
        description: 'Test Payment',
        reference: 'REF123',
        currency: 'COP',
        tax_amount: 0,
        tax_base: 10000,
        buyer: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      } as any;

      const mockResponse: PaymentResponse = {
        status: 'success',
        data: {
          payment: {
            payment_url: 'https://pay.example.com/check',
            payment_qr: 'qr-code-string',
          },
          order: {
            id: 'ORDER-123',
          },
        },
      } as any;

      service.initiatePayment(mockPaymentData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(mockApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.description).toBe('Test Payment');

      // Verify default configuration behavior
      const config = req.request.body.configuration;
      expect(config).toBeDefined();
      expect(config.success_url).toContain('valor-ya/pago-status/success');

      req.flush(mockResponse);
    });

    it('should initiate payment request successfully with specific module', () => {
      const mockPaymentData = { amount: 5000 } as any;
      const testModule: AppModule = 'test';

      service.initiatePayment(mockPaymentData, testModule).subscribe();

      const req = httpMock.expectOne(mockApiUrl);
      expect(req.request.body.configuration.success_url).toContain('test/pago-status/success');

      req.flush({});
    });
  });

  describe('Helper methods', () => {
    const mockResponse: PaymentResponse = {
      status: 'success',
      data: {
        payment: {
          payment_url: 'https://test.com',
          payment_qr: 'QR123',
        },
        order: {
          id: 'ORD-001',
        },
      },
    } as any;

    const emptyResponse = { data: {} } as any;

    it('should extract payment URL', () => {
      expect(service.getPaymentUrl(mockResponse)).toBe('https://test.com');
      expect(service.getPaymentUrl(emptyResponse)).toBeNull();
    });

    it('should extract payment QR', () => {
      expect(service.getPaymentQR(mockResponse)).toBe('QR123');
      expect(service.getPaymentQR(emptyResponse)).toBeNull();
    });

    it('should extract order ID', () => {
      expect(service.getOrderId(mockResponse)).toBe('ORD-001');
      expect(service.getOrderId(emptyResponse)).toBeNull();
    });

    it('should generate unique reference', () => {
      const ref1 = service.generateReference();
      const ref2 = service.generateReference('TEST');

      expect(ref1).toContain('TXN');
      expect(ref2).toContain('TEST');
      expect(ref1).not.toBe(ref2);
    });
  });
});
