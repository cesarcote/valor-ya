/**
 * Modelo de usuario para autenticación
 */
export interface User {
  id: number | string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  numeroDocumento: string;
  tipoDocumento?: {
    id: number;
    codigo: string;
    descripcion: string;
  };
  fechaExpedicion?: string;
  celular?: string;
  telefono?: string;
  email: string;
  emailOpcional?: string;
  estado?: string;
  tipoPersona?: string;
  nombreEntidad?: string;
  direccionCorrespondencia?: string;
  descripcion?: string;
}

// ========== SOLICITUD DE CLAVE TEMPORAL ==========
export interface TempKeyRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  validInput?: boolean;
}

export interface TempKeyDataResponse {
  mensaje: string;
  emailOfuscado: string;
  tiempoExpiracion: number;
}

export interface TempKeyInnerResponse {
  success: boolean;
  message: string;
  data: TempKeyDataResponse;
  timestamp?: string;
}

export interface TempKeyResponse {
  success: boolean;
  message?: string;
  data?: TempKeyInnerResponse;
  error?: string;
}

// ========== VALIDACIÓN DE CLAVE TEMPORAL (LOGIN) ==========
export interface LoginRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  claveTemporal: string;
}

export interface LoginUsuario {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  tipoDocumento: string;
  numeroDocumento: string;
  tipoPersona: string;
  estado: string;
}

export interface LoginDataResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: LoginUsuario;
  fechaLogin: string;
}

export interface LoginInnerResponse {
  success: boolean;
  message: string;
  data: LoginDataResponse;
  timestamp?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: LoginInnerResponse;
  error?: string;
}

export interface RegisterRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  telefono?: string;
  fechaExpedicion: string;
  direccion?: string;
  tipoGenero: number;
  descripcion?: string;
  nombreEntidad?: string;
  direccionCorrespondencia?: string;
  direccionCorrespondenciaOtra?: string;
  emailOpcional?: string;
}

// Respuesta interna del registro (dentro de data)
export interface RegisterDataResponse {
  success: boolean;
  message: string;
  data: User;
  timestamp?: string;
}

// Respuesta del API de registro
export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: RegisterDataResponse;
  error?: string;
}

export interface DocumentType {
  id: number;
  description: string;
}

export interface SexType {
  id: number;
  description: string;
}
