export interface PredioData {
  mensaje: string;
  direccion: string;
  municipio: string;
  localidad: string;
  barrio: string;
  tipoPredio: string;
  estrato: string;
  areaConstruida: string;
  edad: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}
