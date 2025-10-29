export interface DatosComplementarios {
  id?: number;
  loteId: string;
  tipoPredio?: string;
  numeroHabitaciones?: number;
  numeroBanos?: number;
  areaConstruida?: number;
  edad?: string;
  estrato?: number;
  numeroAscensores?: number;
  numeroParqueaderos?: number;
  numeroDepositos?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatosComplementariosRequest {
  loteId?: string;
  tipoPredio?: string;
  numeroHabitaciones?: number;
  numeroBanos?: number;
  areaConstruida?: number;
  edad?: string;
  estrato?: number;
  numeroAscensores?: number;
  numeroParqueaderos?: number;
  numeroDepositos?: number;
}

export interface DatosComplementariosResponse {
  success: boolean;
  message: string;
  data?: DatosComplementarios;
  error?: any;
}
