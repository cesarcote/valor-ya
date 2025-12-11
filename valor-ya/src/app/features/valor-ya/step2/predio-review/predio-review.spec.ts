import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PredioReviewComponent } from './predio-review';
import { Router } from '@angular/router';
import { ValorYaStateService, TipoBusqueda } from '../../services/valor-ya-state.service';
import { ValorYaStepperService } from '../../services/valor-ya-stepper.service';
import { PredioService } from '../../services/predio.service';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { AuthModalService } from '../../../../core/auth/services/auth-modal.service';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PredioReviewComponent', () => {
  let component: PredioReviewComponent;
  let fixture: ComponentFixture<PredioReviewComponent>;

  let mockRouter: any;
  let mockStateService: any;
  let mockStepperService: any;
  let mockPredioService: any;
  let mockMCMService: any;
  let mockAuthService: any;
  let mockAuthModalService: any;
  let loginSuccessSubject: Subject<void>;

  const mockPredioData = {
    mensaje: 'Success',
    chip: 'AAA123',
    loteid: '123',
    direccion: 'Calle Falsa 123',
    municipio: 'Bogota',
    localidad: 'Chapinero',
    barrio: 'Chapinero Alto',
    tipoPredio: 'Apartamento',
    estrato: '4',
    areaConstruida: '80',
    edad: '10',
    coordenadas: { lat: 0, lng: 0 },
    codigoUso: '001',
    coordenadasPoligono: [],
  };

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    mockStateService = {
      tipoBusqueda: signal(TipoBusqueda.CHIP),
      valorBusqueda: signal('AAA123'),
      setPredioData: jasmine.createSpy('setPredioData'),
      reset: jasmine.createSpy('reset'),
      valorYaResponse: signal(null),
    };

    mockStepperService = {
      setStep: jasmine.createSpy('setStep'),
    };

    mockPredioService = {
      consultarPorChip: jasmine.createSpy('consultarPorChip').and.returnValue(of(mockPredioData)),
      consultarPorDireccion: jasmine
        .createSpy('consultarPorDireccion')
        .and.returnValue(of(mockPredioData)),
      consultarPorFMI: jasmine.createSpy('consultarPorFMI'),
      esCodigoUsoValido: jasmine.createSpy('esCodigoUsoValido').and.returnValue(true),
    };

    mockMCMService = {
      testConexion: jasmine.createSpy('testConexion').and.returnValue(of({ estado: 'CONECTADO' })),
      validarMinimoOfertas: jasmine.createSpy('validarMinimoOfertas').and.returnValue(of(true)),
    };

    mockAuthService = {
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
    };

    loginSuccessSubject = new Subject<void>();
    mockAuthModalService = {
      onLoginSuccess$: loginSuccessSubject.asObservable(),
      openLoginModal: jasmine.createSpy('openLoginModal'),
    };

    await TestBed.configureTestingModule({
      imports: [PredioReviewComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ValorYaStateService, useValue: mockStateService },
        { provide: ValorYaStepperService, useValue: mockStepperService },
        { provide: PredioService, useValue: mockPredioService },
        { provide: MCMValorYaService, useValue: mockMCMService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthModalService, useValue: mockAuthModalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PredioReviewComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PredioReviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect if no search params', () => {
    mockStateService.tipoBusqueda.set(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/valor-ya/seleccionar']);
  });

  it('should perform search on init', () => {
    component.ngOnInit();
    expect(mockPredioService.consultarPorChip).toHaveBeenCalledWith('AAA123');
    expect(component.isLoading()).toBeFalse();
    expect(component.predioData()).toEqual(mockPredioData);
  });

  it('should handle search error', () => {
    mockPredioService.consultarPorChip.and.returnValue(throwError(() => new Error('Not found')));
    component.ngOnInit();
    expect(component.errorMessage()).toBe('Not found');
    expect(component.isLoading()).toBeFalse();
  });

  it('should validate eligible predio logic', () => {
    mockPredioService.esCodigoUsoValido.and.returnValue(false);
    component.ngOnInit();
    expect(component.isPredioElegible()).toBeFalse();
    expect(component.showModal()).toBeTrue();
    expect(component.modalTitle()).toBe('Predio no elegible');
  });

  describe('onContinuar', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should show error if MCM unavailable', () => {
      mockMCMService.testConexion.and.returnValue(of({ estado: 'OFFLINE' }));
      component.onContinuar();
      expect(component.showModal()).toBeTrue();
      expect(component.modalTitle()).toBe('Servicio no disponible');
    });

    it('should show error if not enough offers', () => {
      mockMCMService.validarMinimoOfertas.and.returnValue(throwError(() => new Error('No offers')));
      component.onContinuar();
      expect(component.showModal()).toBeTrue();
      expect(component.modalTitle()).toBe('Información no disponible');
    });

    it('should prompt login if not authenticated', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      component.onContinuar();
      expect(mockAuthModalService.openLoginModal).toHaveBeenCalled();
    });

    it('should continue automatically after login success', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      component.onContinuar();

      mockAuthService.isAuthenticated.and.returnValue(true);
      loginSuccessSubject.next();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/valor-ya/pago']);
    });

    it('should navigate to pago if everything works', () => {
      component.onContinuar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/valor-ya/pago']);
    });
  });
});
