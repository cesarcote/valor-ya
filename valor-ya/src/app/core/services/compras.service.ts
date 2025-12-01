import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { currentEnvironment } from '../../../environments/environment';

export interface CompraRequest {
  usuarioId: number;
  fechaCompra: string;
  estado: 'COMPRADO_CON_PAGO' | 'COMPRADA_SIN_PAGO' | 'REGISTRADA' | 'PENDIENTE' | 'COMPLETADO';
  uuid: string;
  cantidad: number;
  valorFiltro: number | null;
  prodDetId1?: string | null;
  prodDetId2?: string | null;
  archivoPrev?: string | null;
  radAgno?: number | null;
  radNum?: number | null;
}

export interface CompraResponse {
  compraId: number;
  detalleId: number;
  mensaje: string;
  status: 'success' | 'error';
}

export interface PagoRequest {
  compraId: number;
  estado: 'EXITOSO' | 'RECHAZADO' | 'PENDIENTE' | 'SIN_PAGO' | 'APROBADO';
  fechaInicioTx: string | null;
  fechaFinTx: string | null;
  numeroTx: string;
  numeroConfTx: string | null;
  fechaConfTx: string | null;
  tipoPersona: string;
  banco: string;
  version: number;
  estadoPagoProveedor: string | null;
  formaPagoProveedor: string;
  codigoTxProveedor: string | null;
}

export interface PagoResponse {
  pagoId: number;
  mensaje: string;
  status: 'success' | 'error';
}

export interface ActualizarCompraPagoRequest {
  pagoId: number;
  estadoPago: 'EXITOSO' | 'RECHAZADO' | 'PENDIENTE' | 'SIN_PAGO' | 'APROBADO';
  estadoCompra:
    | 'COMPRADO_CON_PAGO'
    | 'COMPRADA_SIN_PAGO'
    | 'REGISTRADA'
    | 'PENDIENTE'
    | 'COMPLETADO';
}

export interface ActualizarCompraPagoResponse {
  mensaje: string;
  status: 'success' | 'error';
}

export interface FacturaRequest {
  compraId: number;
}

export interface FacturaResponse {
  status: 'success' | 'error';
  mensaje: string;
  facturaId: number;
  compraId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  /**
   * Crea una nueva compra con su detalle asociado
   * usando el stored procedure SP_INSERT_COMPRA
   */
  crearCompra(compraData: CompraRequest): Observable<CompraResponse> {
    const url = `${this.API_BASE_URL}/api/compras`;

    return this.http.post<CompraResponse>(url, compraData).pipe(
      catchError((error) => {
        console.error('Error al crear compra:', error);
        throw error;
      })
    );
  }

  /**
   * Registra un pago para una compra existente
   * usando el stored procedure SP_INSERT_PAGO
   */
  crearPago(pagoData: PagoRequest): Observable<PagoResponse> {
    const url = `${this.API_BASE_URL}/api/compras/pagos`;

    return this.http.post<PagoResponse>(url, pagoData).pipe(
      catchError((error) => {
        console.error('Error al crear pago:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza el estado de una compra y su pago asociado
   * usando el stored procedure SP_ACTUALIZAR_COMPRA_PAGO
   */
  actualizarCompraPago(
    data: ActualizarCompraPagoRequest
  ): Observable<ActualizarCompraPagoResponse> {
    const url = `${this.API_BASE_URL}/api/compras/pagos/actualizar`;

    return this.http.put<ActualizarCompraPagoResponse>(url, data).pipe(
      catchError((error) => {
        console.error('Error al actualizar compra y pago:', error);
        throw error;
      })
    );
  }

  /**
   * Crea una factura para una compra existente
   * usando el paquete PL/SQL TIENDA_VIRTUAL.PK_TV_FACTURA.fn_crea_factura
   */
  crearFactura(facturaData: FacturaRequest): Observable<FacturaResponse> {
    const url = `${this.API_BASE_URL}/api/compras/facturas`;

    return this.http.post<FacturaResponse>(url, facturaData).pipe(
      catchError((error) => {
        console.error('Error al crear factura:', error);
        throw error;
      })
    );
  }
}
