export interface CatastroResponse {
  // Respuesta simple del endpoint real (búsqueda por CHIP/Dirección)
  // El backend SOLO devuelve estos campos cuando buscas por CHIP o Dirección:
  // - CHIP NO se devuelve cuando buscas por CHIP (usar valorBusqueda)
  // - LOTEID siempre se devuelve
  // - DIRECCION_REAL se devuelve cuando buscas por dirección
  CHIP?: string;
  LOTEID?: string;
  DIRECCION_REAL?: string;
  success?: boolean;
  message?: string;

  // Respuesta completa (si el endpoint devuelve información detallada)
  data?: {
    infoGeografica: {
      areaPoligono: number;
      longitudPoligono: number;
      coordenadasPoligono: number[][][];
    };
    infoConsultaPredio: {
      chip: string;
      loteid: string;
    };
    infoAdicional: {
      municipio: string;
      localidad: string;
      barrio: string;
      direccion: string;
      tipoPredio: string;
      estrato: string;
      areaConstruidaPrivada: string;
      edad: string;
    };
  };
  error?: string | null;
}
