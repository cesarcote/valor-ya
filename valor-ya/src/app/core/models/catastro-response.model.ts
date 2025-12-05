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
      codigoBarrio?: string;
      codigoSector?: string;
      maxNumPiso?: string;
      vetustez?: string;
      codigoUso?: string;
      codigoResto?: string;
      claseSuelo?: string;
      actividadEconomica?: string;
      nombrePH?: string;
      areasActividad?: string;
      tratamientos?: string;
      claseVia?: string;
      estadoVia?: string;
      influenciaVia?: string;
      topografia?: string;
      serviciosPublicos?: string;
      condicionJuridica?: string;
      distanciaCentrosComerciales?: string | null;
      distanciaClinicas?: string | null;
      distanciaHospitales?: string | null;
      distanciaCAI?: string | null;
      distanciaEstacionTM?: string | null;
      distanciaPortalTM?: string | null;
      codigoManzana?: string | null;
      codigoPredio?: string | null;
    };
  };
  error?: string | null;
}
