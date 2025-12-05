export interface ReporteValorYaRequest {
  chip: string;
  imagenBase64: string;
  imagenBase64Ofertas: string;
}

export interface ReporteValorYaResponse {
  success: boolean;
  message: string;
  reportUrl?: string;
  reportData?: any;
}
