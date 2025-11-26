export interface PredioData {
  mensaje: string;
  chip?: string;
  loteid?: string;
  direccion: string;
  municipio: string;
  localidad: string;
  barrio: string;
  tipoPredio: string;
  estrato: string;
  areaConstruida: string;
  edad: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  coordenadasPoligono?: number[][][];
  areaPoligono?: number;
  longitudPoligono?: number;
  ph?: string;
  nph?: string;
  codigoManzana?: string;
  codigoPredio?: string;
  codigoBarrio?: string;
}
