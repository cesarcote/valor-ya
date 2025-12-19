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
  codigoManzana?: string | null;
  codigoPredio?: string | null;
  codigoBarrio?: string;
  codigoUso?: string;
  vetustez?: string;
  condicionJuridica?: string;
  valorAvaluo?: string;
}
