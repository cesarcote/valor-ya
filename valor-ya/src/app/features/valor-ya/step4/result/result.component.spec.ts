import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResultComponent } from './result';
import { Router } from '@angular/router';
import { ValorYaStateService, TipoBusqueda } from '../../services/valor-ya-state.service';
import { ValorYaStepperService } from '../../services/valor-ya-stepper.service';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
import { ReporteService } from '../../services/reporte.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingService } from '../../../../shared/services/loading.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ResultComponent', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;

  let mockRouter: any;
  let mockStateService: any;
  let mockStepperService: any;
  let mockApiService: any;
  let mockReporteService: any;
  let mockNotificationService: any;
  let mockLoadingService: any;

  const mockPredioData = {
    chip: 'AAA123',
    direccion: 'Calle 123',
    coordenadasPoligono: [{ lat: 1, lng: 1 }],
  };

  const mockValorYaResumen = {
    data: {
      ofertas_utilizadas: 5,
      chips_procesados: 100,
      AREA_CONSTRUIDA_PREDIO: 50,
      CV: 0.1,
      LIMITE_INFERIOR: 900000,
      LIMITE_SUPERIOR: 1100000,
      VALOR_YA: 1000000,
      VALORYA_M2: 20000,
    },
  };

  const mockOfertasResponse = {
    resultados: [
      { POINT_Y_PREDIO: 4.0, POINT_X_PREDIO: -74.0, POINT_Y_OFERTA: 4.1, POINT_X_OFERTA: -74.1 },
    ],
  };

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    mockStateService = {
      predioData: signal(mockPredioData),
      tipoBusqueda: signal(TipoBusqueda.CHIP),
      setPredioData: jasmine.createSpy('setPredioData'),
      reset: jasmine.createSpy('reset'),
    };

    mockStepperService = {
      setStep: jasmine.createSpy('setStep'),
      reset: jasmine.createSpy('reset'),
    };

    mockApiService = {
      testConexion: jasmine.createSpy('testConexion').and.returnValue(of({ estado: 'CONECTADO' })),
      calcularValorYa: jasmine.createSpy('calcularValorYa').and.returnValue(of(mockValorYaResumen)),
      procesarChip: jasmine.createSpy('procesarChip').and.returnValue(of(mockOfertasResponse)),
    };

    mockReporteService = {
      generarReporteValorYa: jasmine
        .createSpy('generarReporteValorYa')
        .and.returnValue(of(new Blob())),
    };

    mockNotificationService = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };

    mockLoadingService = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
    };

    await TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ValorYaStateService, useValue: mockStateService },
        { provide: ValorYaStepperService, useValue: mockStepperService },
        { provide: MCMValorYaService, useValue: mockApiService },
        { provide: ReporteService, useValue: mockReporteService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: LoadingService, useValue: mockLoadingService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ResultComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;

    // Mock private methods that create dynamic components to avoid dependency issues
    (component as any).renderizarMapaPredio = jasmine.createSpy('renderizarMapaPredio');
    (component as any).renderizarMapaOfertas = jasmine.createSpy('renderizarMapaOfertas');

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockPredioData));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load results on init if connection is OK', () => {
    fixture.detectChanges();
    expect(mockApiService.testConexion).toHaveBeenCalled();
    expect(mockApiService.calcularValorYa).toHaveBeenCalledWith('AAA123');
    expect(component.valorYaResumen()).toEqual(mockValorYaResumen as any);
  });

  it('should show error if connection fails', () => {
    mockApiService.testConexion.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();
    expect(component.showModal()).toBeTrue();
    expect(component.modalTitle()).toBe('Error en el sistema');
  });

  it('should download report successfully', fakeAsync(() => {
    // Setup state
    fixture.detectChanges();
    component.valorYaResumen.set(mockValorYaResumen as any); // Ensure data present

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockUrl = 'blob:http://localhost/123';
    withMockUrl(() => {
      component.onDescargarAvaluo();
      tick();

      expect(mockLoadingService.show).toHaveBeenCalled();
      expect(mockReporteService.generarReporteValorYa).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalled();
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }, mockUrl);
  }));

  it('should handle download report error', fakeAsync(() => {
    fixture.detectChanges();
    mockReporteService.generarReporteValorYa.and.returnValue(
      throwError(() => new Error('PDF Error'))
    );

    component.onDescargarAvaluo();
    tick();

    expect(mockNotificationService.error).toHaveBeenCalledWith('Error generando reporte');
    expect(mockLoadingService.hide).toHaveBeenCalled();
  }));

  function withMockUrl(callback: () => void, mockUrl: string) {
    const originalCreate = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;

    globalThis.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.returnValue(mockUrl);
    globalThis.URL.revokeObjectURL = jasmine.createSpy('revokeObjectURL');

    try {
      callback();
    } finally {
      globalThis.URL.createObjectURL = originalCreate;
      globalThis.URL.revokeObjectURL = originalRevoke;
    }
  }
});
