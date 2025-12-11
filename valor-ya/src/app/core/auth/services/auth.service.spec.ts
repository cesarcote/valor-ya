import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { currentEnvironment } from '../../../../environments/environment';
import { User, LoginResponse } from '../../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockTokenService: any;
  const apiUrl = currentEnvironment.baseUrl;

  const mockUser: User = {
    id: 1,
    personId: 100,
    nombre: 'Pepito',
    apellido: 'Perez',
    email: 'pepito@test.com',
    numeroDocumento: '123456',
    tipoPersona: 'NATURAL',
  };

  beforeEach(() => {
    mockTokenService = {
      saveToken: jasmine.createSpy('saveToken'),
      saveUser: jasmine.createSpy('saveUser'),
      getToken: jasmine.createSpy('getToken'),
      getUser: jasmine.createSpy('getUser'),
      clearAll: jasmine.createSpy('clearAll'),
      isTokenExpired: jasmine.createSpy('isTokenExpired').and.returnValue(false),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: mockTokenService },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with recovered session if valid', () => {
    mockTokenService.getUser.and.returnValue(mockUser);
    mockTokenService.isTokenExpired.and.returnValue(false);

    (service as any).recoverSession();

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('should clear session if token expired on init', () => {
    mockTokenService.isTokenExpired.and.returnValue(true);

    (service as any).recoverSession();

    expect(mockTokenService.clearAll).toHaveBeenCalled();
    expect(service.currentUser()).toBeNull();
  });

  it('should check document availability (available)', () => {
    service.checkDocumentAvailability('123', '1').subscribe((res) => {
      expect(res.available).toBeTrue();
      expect(res.message).toBe('Documento disponible');
    });

    const req = httpMock.expectOne(`${apiUrl}/api/auth/temp-key`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: false });
  });

  it('should check document availability (taken)', () => {
    service.checkDocumentAvailability('123', '1').subscribe((res) => {
      expect(res.available).toBeFalse();
      expect(res.message).toContain('ya se encuentra registrado');
    });

    const req = httpMock.expectOne(`${apiUrl}/api/auth/temp-key`);
    req.flush({ success: true, data: { success: true } });
  });

  it('should login and map user data correctly', () => {
    const loginRequest = {
      tipoDocumento: 'CC',
      numeroDocumento: '123',
      password: 'pass',
      recaptchaToken: 'token',
      claveTemporal: '1234',
    };
    const mockLoginResponse: LoginResponse = {
      success: true,
      data: {
        success: true,
        data: {
          token: 'fake-token',
          usuario: {
            ...mockUser,
            id: 100,
            nombreCompleto: 'Pepito Perez',
            tipoDocumento: 'CC',
            tipoPersona: 'NATURAL',
            estado: 'ACTIVO',
          }, // id is personId here
          refreshToken: 'refresh',
          tokenType: 'Bearer',
          expiresIn: 3600,
          fechaLogin: new Date().toISOString(),
        },
        message: 'Login successful',
      },
    };

    // User lookup lookup response
    const mockUserLookupResponse = {
      success: true,
      data: { ID: 1, PERSON_ID: 100 },
    };

    service.login(loginRequest).subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(mockTokenService.saveToken).toHaveBeenCalledWith('fake-token');
      expect(mockTokenService.saveUser).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1 }));
      expect(service.currentUser()?.id).toBe(1);
    });

    const loginReq = httpMock.expectOne(`${apiUrl}/api/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush(mockLoginResponse);

    const lookupReq = httpMock.expectOne(`${apiUrl}/api/users/person/100`);
    expect(lookupReq.request.method).toBe('GET');
    lookupReq.flush(mockUserLookupResponse);
  });

  it('should handle login error gracefully', () => {
    const loginRequest = {
      tipoDocumento: 'CC',
      numeroDocumento: '123',
      password: 'fail',
      recaptchaToken: 'token',
      claveTemporal: '1234',
    };

    service.login(loginRequest).subscribe((response) => {
      expect(response.success).toBeFalse();
      expect(service.currentUser()).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/api/auth/login`);
    req.flush({ error: 'Auth failed' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout and clear local data', () => {
    mockTokenService.getToken.and.returnValue('token');
    spyOn(localStorage, 'removeItem');
    spyOn(sessionStorage, 'removeItem');

    service.logout();

    // Verify API call
    const req = httpMock.expectOne(`${apiUrl}/api/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    // Verify cleanups
    expect(mockTokenService.clearAll).toHaveBeenCalled();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('valorya-predio-data');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('valorya-busqueda-state');
  });
});
