export interface TipoUnidad {
  codigoUnidad: string;
  descripcionUnidad: string;
}

export interface TiposUnidadResponse {
  success: boolean;
  message: string;
  data: TipoUnidad[];
}
