import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PredioService } from './predio.service';
import { currentEnvironment } from '../../../../environments/environment';
import { CatastroResponse } from '../models/catastro-response.model';
import { PredioData } from '../models/predio-data.model';

describe('PredioService', () => {
  let service: PredioService;
  let httpMock: HttpTestingController;

  const mockBaseUrl = currentEnvironment.baseUrl;
  const mockApiUrl = `${mockBaseUrl}/catastro/consultar`;

  const mockSuccessResponse: CatastroResponse = {
    success: true,
    message: 'Consulta catastral realizada exitosamente',
    data: {
      infoConsultaPredio: {
        chip: 'AAA0091PPTO',
        loteid: '008213033003',
      },
      infoGeografica: {
        areaPoligono: 451.58018913,
        longitudPoligono: 90.1995572949003,
        coordenadasPoligono: [
          [
            [-74.06384238249719, 4.639938663828938],
            [-74.06384676658651, 4.639927768157126],
          ],
        ],
      },
      infoAdicional: {
        municipio: 'BOGOTÁ D.C.',
        localidad: 'CHAPINERO',
        barrio: 'CHAPINERO CENTRAL',
        direccion: 'KR 10 53 66 AP 101',
        tipoPredio: 'APARTAMENTO',
        estrato: '3',
        areaConstruidaPrivada: '67.7',
        edad: '28 - 34',
        codigoBarrio: '008213',
        codigoSector: '00821333030300101001',
        maxNumPiso: '6',
        vetustez: '1994',
        codigoUso: '038',
        codigoResto: '01001',
        claseSuelo: 'N/A',
        actividadEconomica: 'NO EDIFICADO',
        nombrePH: 'N/A',
        areasActividad: 'N/A',
        tratamientos: '(C)TRATAMIENTO DE CONSERVACIÓN',
        claseVia: 'N/A',
        estadoVia: 'SIN',
        influenciaVia: 'SIN',
        topografia: 'N/A',
        serviciosPublicos: 'SIN SERVICIOS',
        condicionJuridica: 'PROPIEDAD HORIZONTAL',
        distanciaCentrosComerciales: null,
        distanciaClinicas: '400.908996893',
        distanciaHospitales: '673.369093672',
        distanciaCAI: '662.785091828',
        distanciaEstacionTM: '338.788833032',
        distanciaPortalTM: null,
        codigoManzana: null,
        codigoPredio: null,
      },
    },
    error: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PredioService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PredioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('consultarPorDireccion', () => {
    it('should return mapped PredioData on success', () => {
      const direccion = 'KR 10 53 66 AP 101';

      service.consultarPorDireccion(direccion).subscribe((data: PredioData) => {
        expect(data).toBeTruthy();
        expect(data.direccion).toBe('KR 10 53 66 AP 101');
        expect(data.chip).toBe('AAA0091PPTO');
        expect(data.municipio).toBe('BOGOTÁ D.C.');
        expect(data.areaConstruida).toBe('67.7');
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === mockApiUrl &&
          req.params.get('Identificador') === direccion &&
          req.params.get('Opcion') === '2'
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should throw error when api returns success: false', () => {
      const direccion = 'Unknown Street';
      const errorResponse = { success: false, message: 'Not Found' };

      service.consultarPorDireccion(direccion).subscribe({
        next: () => fail('Should have failed'),
        error: (error: any) => {
          expect(error.message).toContain('No se encontraron datos');
        },
      });

      const req = httpMock.expectOne((req) => req.url === mockApiUrl);
      req.flush(errorResponse);
    });
  });

  describe('consultarPorChip', () => {
    it('should return mapped PredioData on success', () => {
      const chip = 'AAA0091PPTO';

      service.consultarPorChip(chip).subscribe((data: PredioData) => {
        expect(data.chip).toBe(chip);
        expect(data.areaConstruida).toBe('67.7');
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === mockApiUrl &&
          req.params.get('Identificador') === chip &&
          req.params.get('Opcion') === '3'
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });
  });
});
