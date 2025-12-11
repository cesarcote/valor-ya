import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  ComprasService,
  CompraRequest,
  PagoRequest,
  ActualizarCompraPagoRequest,
  FacturaRequest,
} from './compras.service';
import { currentEnvironment } from '../../../../environments/environment';

describe('ComprasService', () => {
  let service: ComprasService;
  let httpMock: HttpTestingController;

  const mockBaseUrl = currentEnvironment.baseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComprasService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ComprasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearCompra', () => {
    it('should create compra successfully', () => {
      const mockRequest: CompraRequest = {
        usuarioId: 1,
        fechaCompra: '2025-12-12',
        estado: 'PENDIENTE',
        uuid: 'test-uuid',
        cantidad: 1,
        valorFiltro: 100000,
      };

      const mockResponse = {
        compraId: 1,
        detalleId: 1,
        mensaje: 'Compra creada',
        status: 'success' as const,
      };

      service.crearCompra(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/api/compras`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle error in crearCompra', () => {
      const mockRequest: CompraRequest = {
        usuarioId: 1,
        fechaCompra: '2025-12-12',
        estado: 'PENDIENTE',
        uuid: 'test-uuid',
        cantidad: 1,
        valorFiltro: 100000,
      };

      service.crearCompra(mockRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/api/compras`);
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('crearPago', () => {
    it('should create pago successfully', () => {
      const mockRequest: PagoRequest = {
        compraId: 1,
        estado: 'APROBADO',
        fechaInicioTx: '2025-12-12',
        fechaFinTx: '2025-12-12',
        numeroTx: 'TX-123',
        numeroConfTx: 'CONF-123',
        fechaConfTx: '2025-12-12',
        tipoPersona: 'NATURAL',
        banco: 'BANCO-TEST',
        version: 1,
        estadoPagoProveedor: 'APPROVED',
        formaPagoProveedor: 'CREDIT',
        codigoTxProveedor: 'XXX',
      };

      const mockResponse = {
        pagoId: 100,
        mensaje: 'Pago creado',
        status: 'success' as const,
      };

      service.crearPago(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/api/compras/pagos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });
  });

  describe('actualizarCompraPago', () => {
    it('should update compra and pago successfully', () => {
      const mockRequest: ActualizarCompraPagoRequest = {
        pagoId: 100,
        estadoPago: 'EXITOSO',
        estadoCompra: 'COMPRADO_CON_PAGO',
      };

      const mockResponse = {
        mensaje: 'Actualizado correctamente',
        status: 'success' as const,
      };

      service.actualizarCompraPago(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/api/compras/pagos/actualizar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });
  });

  describe('crearFactura', () => {
    it('should create factura successfully', () => {
      const mockRequest: FacturaRequest = {
        compraId: 1,
      };

      const mockResponse = {
        status: 'success' as const,
        mensaje: 'Factura creada',
        facturaId: 500,
        compraId: 1,
      };

      service.crearFactura(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/api/compras/facturas`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
