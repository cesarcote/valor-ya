export interface ReporteValorYaRequest {
  chip: string;
  zona: string;
  tipoPredio: string;
  valorYa: string;
  limiteInferior: string;
  limiteSuperior: string;
  valorYaM2: string;
  limiteInferiorM2: string;
  limiteSuperiorM2: string;
  ofertasUtilizadas: string;
  coeficienteVariacion: string;
}

export interface ReporteValorYaResponse {
  success: boolean;
  message: string;
  reportUrl?: string;
  reportData?: any;
}
