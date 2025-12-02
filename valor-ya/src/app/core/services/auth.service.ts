import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import {
  User,
  LoginRequest,
  LoginResponse,
  TempKeyRequest,
  TempKeyResponse,
  RegisterRequest,
  RegisterResponse,
  DocumentType,
  SexType,
} from '../models/user.model';
import { currentEnvironment } from '../../../environments/environment';
import { TokenService } from './token.service';

/**
 * Servicio de autenticación
 * Conectado al backend real
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly apiUrl = currentEnvironment.baseUrl;

  // Estado del usuario actual usando signals
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isLoadingSignal = signal(false);

  // Computed signals públicos
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  // Catálogos estáticos de tipos de documento y sexo
  private readonly documentTypes: DocumentType[] = [
    { id: 1, description: 'Cédula de ciudadanía' },
    { id: 2, description: 'NIT' },
    { id: 3, description: 'Cédula de extranjería' },
    { id: 4, description: 'Pasaporte' },
    { id: 5, description: 'Tarjeta de identidad' },
    { id: 6, description: 'NUIP' },
  ];

  private readonly sexTypes: SexType[] = [
    { id: 1, description: 'Masculino' },
    { id: 2, description: 'Femenino' },
    { id: 3, description: 'Otro' },
  ];

  constructor() {
    this.recoverSession();
  }

  /**
   * Obtener tipos de documento disponibles
   */
  getDocumentTypes(): Observable<DocumentType[]> {
    return of(this.documentTypes);
  }

  /**
   * Obtener tipos de sexo disponibles
   */
  getSexTypes(): Observable<SexType[]> {
    return of(this.sexTypes);
  }

  /**
   * Verificar si un documento ya está registrado
   * Usa el endpoint de clave temporal - si el usuario no existe, devolverá error
   */
  checkDocumentAvailability(
    documentNumber: string,
    documentType: string
  ): Observable<{ available: boolean; message: string }> {
    // Mapear tipo de documento
    const tipoDocumentoMap: { [key: number]: string } = {
      1: 'CC',
      2: 'NIT',
      3: 'CE',
      4: 'PA',
      5: 'TI',
      6: 'NUIP',
    };
    const tipoDoc = tipoDocumentoMap[Number(documentType)] || 'CC';

    return this.http
      .post<TempKeyResponse>(`${this.apiUrl}/api/auth/temp-key`, {
        tipoDocumento: tipoDoc,
        numeroDocumento: documentNumber,
        validInput: true,
      })
      .pipe(
        map((response) => {
          // Si la solicitud fue exitosa, el documento EXISTE (no está disponible para registro)
          if (response.success && response.data?.success) {
            return {
              available: false,
              message: 'Este documento ya se encuentra registrado',
            };
          }
          // Si hay error, el documento NO existe (está disponible para registro)
          return {
            available: true,
            message: 'Documento disponible',
          };
        }),
        catchError(() => {
          // Error significa que el usuario no existe, documento disponible
          return of({
            available: true,
            message: 'Documento disponible',
          });
        })
      );
  }

  /**
   * Solicitar clave temporal
   * Genera una clave de 4 dígitos y la envía al email del usuario
   */
  requestTempKey(request: TempKeyRequest): Observable<TempKeyResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<TempKeyResponse>(`${this.apiUrl}/api/auth/temp-key`, request).pipe(
      map((response) => {
        this.isLoadingSignal.set(false);
        return response;
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        console.error('Error solicitando clave temporal:', error);

        return of({
          success: false,
          error: error.error?.error || 'Error al solicitar clave temporal',
        });
      })
    );
  }

  /**
   * Iniciar sesión con clave temporal (API REAL)
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, request).pipe(
      map((response) => {
        this.isLoadingSignal.set(false);

        if (response.success && response.data?.success) {
          const loginData = response.data.data;
          const usuario = loginData.usuario;

          // Mapear usuario del login al modelo User
          const user: User = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            nombreCompleto: usuario.nombreCompleto,
            numeroDocumento: usuario.numeroDocumento,
            email: usuario.email,
            estado: usuario.estado,
            tipoPersona: usuario.tipoPersona,
          };

          this.currentUserSignal.set(user);
          this.saveSession(user, loginData.token);
        }

        return response;
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        console.error('Error en login:', error);

        return of({
          success: false,
          error: error.error?.error || 'Error al iniciar sesión',
        });
      })
    );
  }

  /**
   * Registrar nuevo usuario (API REAL)
   */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<RegisterResponse>(`${this.apiUrl}/api/users/register`, request).pipe(
      map((response) => {
        this.isLoadingSignal.set(false);
        // La respuesta tiene estructura anidada: response.data.data contiene el usuario
        return response;
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        console.error('Error en registro:', error);

        // Error 400 - Datos inválidos
        if (error.status === 400) {
          return of({
            success: false,
            error: error.error?.error || 'Datos de entrada inválidos',
          });
        }

        // Error 500 - Error interno
        if (error.status === 500) {
          return of({
            success: false,
            error: error.error?.error || 'Error interno en el proceso de registro',
          });
        }

        // Otros errores
        return of({
          success: false,
          error: error.error?.error || 'Error al registrar usuario. Por favor intente nuevamente.',
        });
      })
    );
  }

  /**
   * Cerrar sesión - Llama al API y limpia la sesión local
   */
  logout(): void {
    const token = this.tokenService.getToken();

    // Limpiar estado local primero
    this.currentUserSignal.set(null);
    this.tokenService.clearAll();

    // Llamar al API para invalidar el token en el servidor
    if (token) {
      this.http.post(`${this.apiUrl}/api/auth/logout`, {}).subscribe({
        next: () => console.log('Sesión cerrada en el servidor'),
        error: (err) => console.warn('Error cerrando sesión en servidor:', err),
      });
    }
  }

  /**
   * Recuperar sesión del sessionStorage
   */
  private recoverSession(): void {
    try {
      // Verificar si el token expiró
      if (this.tokenService.isTokenExpired()) {
        this.tokenService.clearAll();
        return;
      }

      const user = this.tokenService.getUser();
      if (user) {
        this.currentUserSignal.set(user);
      }
    } catch (error) {
      console.warn('Error recuperando sesión:', error);
      this.logout();
    }
  }

  /**
   * Guardar sesión en sessionStorage
   */
  private saveSession(user: User, token: string): void {
    this.tokenService.saveUser(user);
    this.tokenService.saveToken(token);
  }
}
