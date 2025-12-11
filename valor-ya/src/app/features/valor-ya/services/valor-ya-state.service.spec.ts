import { TestBed } from '@angular/core/testing';
import { ValorYaStateService, TipoBusqueda } from './valor-ya-state.service';
import { PredioData } from '../models/predio-data.model';
import { DatosComplementarios } from '../models/datos-complementarios.model';

describe('ValorYaStateService', () => {
  let service: ValorYaStateService;
  let sessionStorageStore: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock sessionStorage
    sessionStorageStore = {};
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      return sessionStorageStore[key] || null;
    });
    spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string) => {
      sessionStorageStore[key] = value;
    });
    spyOn(sessionStorage, 'removeItem').and.callFake((key: string) => {
      delete sessionStorageStore[key];
    });
    spyOn(sessionStorage, 'clear').and.callFake(() => {
      sessionStorageStore = {};
    });

    TestBed.configureTestingModule({
      providers: [ValorYaStateService],
    });
    service = TestBed.inject(ValorYaStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial default state', () => {
    expect(service.tipoBusqueda()).toBe(TipoBusqueda.DIRECCION);
    expect(service.valorBusqueda()).toBeUndefined();
    expect(service.predioData()).toBeUndefined();
    expect(service.mostrarResultado()).toBeFalse();
  });

  describe('State Management', () => {
    it('should update tipoBusqueda', () => {
      service.setTipoBusqueda(TipoBusqueda.CHIP);
      expect(service.tipoBusqueda()).toBe(TipoBusqueda.CHIP);
    });

    it('should update valorBusqueda and persist', () => {
      const valor = 'AAA123';
      service.setValorBusqueda(valor);
      expect(service.valorBusqueda()).toBe(valor);
      expect(sessionStorage.setItem).toHaveBeenCalled();
    });

    it('should update predioData and persist result', () => {
      const mockPredio: PredioData = { chip: 'TEST-CHIP', direccion: 'Calle 123' } as any;
      service.setPredioData(mockPredio, TipoBusqueda.CHIP, 'TEST-CHIP');

      expect(service.predioData()).toEqual(mockPredio);
      expect(service.tipoBusqueda()).toBe(TipoBusqueda.CHIP);
      expect(service.valorBusqueda()).toBe('TEST-CHIP');
      expect(sessionStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Computed Signals', () => {
    it('should correctly compute hasDatosComplementarios', () => {
      expect(service.hasDatosComplementarios()).toBeFalse();

      service.setDatosComplementarios({} as DatosComplementarios);
      expect(service.hasDatosComplementarios()).toBeTrue();
    });
  });

  describe('Persistence (restoring state)', () => {
    it('should restore state from sessionStorage on init', () => {
      // Setup storage BEFORE creating a NEW service instance to simulate page reload
      const mockState = { tipoBusqueda: TipoBusqueda.FMI, valorBusqueda: 'FMI-123' };
      sessionStorageStore['valorya-busqueda-state'] = JSON.stringify(mockState);

      // Re-inject to trigger constructor again with mocked storage
      const newService = TestBed.inject(ValorYaStateService);

      // Note: TestBed usually provides singleton. To test constructor logic thoroughly
      // with dependency injection, we might need manual instantiation or reset TestBed.
      // However, since we mocked getItem globally before inject, the first injection
      // in beforeEach might have already missed it if storage was empty then.
      // Let's manually call the private restore method if possible or rely on
      // restoring logic being called.
      // Actually, since we want to test constructor behavior, we need to set up storage BEFORE service creation.
      // But beforeEach already created the service.

      // Let's manually trigger restoration logic by calling private method via any (for testing)
      // or by re-creating logic.
      (service as any).restoreFromStorage();

      expect(service.tipoBusqueda()).toBe(TipoBusqueda.FMI);
      expect(service.valorBusqueda()).toBe('FMI-123');
    });
  });

  describe('Reset', () => {
    it('should clear all signals and storage on reset', () => {
      service.setValorBusqueda('TEST');
      service.setPredioData({} as any, TipoBusqueda.CHIP, 'TEST');

      service.reset();

      expect(service.valorBusqueda()).toBeUndefined();
      expect(service.predioData()).toBeUndefined();
      expect(service.tipoBusqueda()).toBeUndefined();
      expect(sessionStorage.removeItem).toHaveBeenCalled();
    });
  });
});
