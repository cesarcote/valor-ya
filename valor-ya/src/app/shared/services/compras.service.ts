import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CompraRequest {
  usuarioId: number;
  fechaCompra: string;
  estado: 'COMPRADO_CON_PAGO' | 'COMPRADA_SIN_PAGO' | 'REGISTRADA' | 'PENDIENTE' | 'COMPLETADO';
  uuid: string;
  valor: number;
  productoId: number;
  cantidad: number;
  valorUnitario: number;

  enviada?: number;
  version?: number;
  pagoId?: number | null;
  facturaId?: number | null;
  fechaEnvio?: string | null;
  tipoFiltroProdId?: number | null;
  valorFiltro?: string | null;
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

  numeroTx?: string | null;
  banco?: string | null;
  version?: number;
  fechaInicioTx?: string | null;
  fechaFinTx?: string | null;
  numeroConfTx?: string | null;
  fechaConfTx?: string | null;
  tipoPersona?: string | null;
  numPago?: number | null;
  estadoPagoProveedor?: string | null;
  formaPagoProveedor?: string | null;
  codigoTxProveedor?: string | null;
}

export interface PagoResponse {
  pagoId: number;
  mensaje: string;
  status: 'success' | 'error';
}

export interface ActualizarCompraPagoRequest {
  pagoId: number;
  estadoPago: 'EXITOSO' | 'RECHAZADO' | 'PENDIENTE' | 'SIN_PAGO' | 'APROBADO';
  estadoCompra: 'COMPRADO_CON_PAGO' | 'COMPRADA_SIN_PAGO' | 'REGISTRADA' | 'PENDIENTE' | 'COMPLETADO';
}

export interface ActualizarCompraPagoResponse {
  mensaje: string;
  status: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  private http = inject(HttpClient);

  /**
   * Crea una nueva compra con su detalle asociado
   * usando el stored procedure SP_INSERT_COMPRA
   */
  crearCompra(compraData: CompraRequest): Observable<CompraResponse> {
    const url = `/api/compras`;

    return this.http.post<CompraResponse>(url, compraData).pipe(
      catchError((error) => {
        console.error('❌ [ComprasService] Error al crear compra:', error);
        throw error;
      })
    );
  }

  /**
   * Registra un pago para una compra existente
   * usando el stored procedure SP_INSERT_PAGO
   */
  crearPago(pagoData: PagoRequest): Observable<PagoResponse> {
    const url = `/api/compras/pagos`;

    return this.http.post<PagoResponse>(url, pagoData).pipe(
      catchError((error) => {
        console.error('❌ [ComprasService] Error al crear pago:', error);
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
    const url = `/api/compras/pagos/actualizar`;

    return this.http.put<ActualizarCompraPagoResponse>(url, data).pipe(
      catchError((error) => {
        console.error('❌ [ComprasService] Error al actualizar compra y pago:', error);
        throw error;
      })
    );
  }
}
