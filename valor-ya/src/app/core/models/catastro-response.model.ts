export interface CatastroResponse {
  success?: boolean;
  message?: string;
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
