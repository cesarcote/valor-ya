export interface ReporteValorYaRequest {
  chip: string;
  imagenBase64: string;
  imagenBase64Ofertas: string | null;
}

export interface ReporteValorYaResponse {
  success: boolean;
  message: string;
  reportUrl?: string;
  reportData?: any;
}
