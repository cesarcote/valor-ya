export interface DatosComplementarios {
  id?: number;
  lote_id: string;
  area_construida?: number;
  estrato?: number;
  num_ascensores?: number;
  num_banos?: number;
  num_depositos?: number;
  num_habitaciones?: number;
  num_parqueaderos?: number;
  edad?: string;
  tipo_predio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatosComplementariosRequest {
  lote_id: string;
  area_construida?: number;
  estrato?: number;
  num_ascensores?: number;
  num_banos?: number;
  num_depositos?: number;
  num_habitaciones?: number;
  num_parqueaderos?: number;
  edad?: string;
  tipo_predio?: string;
}

export interface DatosComplementariosResponse {
  success: boolean;
  message: string;
  data?: DatosComplementarios;
  error?: any;
}