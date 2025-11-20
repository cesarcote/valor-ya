import { Injectable } from '@angular/core';
import { TestMapComponent } from '../components/test-map/test-map';

@Injectable({
  providedIn: 'root',
})
export class McmMapService {
  constructor() {}

  visualizarMCM(map: TestMapComponent, data: any): void {
    console.log('McmMapService: Received data', data);

    if (!map || !data || !data.resultados || data.resultados.length === 0) {
      console.warn('Datos MCM inválidos o mapa no inicializado');
      return;
    }

    map.clearMarkers();

    const resultados = data.resultados;
    const predioBase = resultados[0];

    console.log(
      'McmMapService: Adding marker at',
      predioBase.POINT_Y_PREDIO,
      predioBase.POINT_X_PREDIO
    );

    // Solo agregar el marcador del predio a valorar (como MapComponent original)
    map.addMarker({
      lat: predioBase.POINT_Y_PREDIO,
      lng: predioBase.POINT_X_PREDIO,
      popupText: `<strong>Predio a Valorar</strong><br>${predioBase.DIRECCION_REAL_PREDIO}`,
      isMain: true,
    });

    // Centrar el mapa (como MapComponent original)
    map.setView(predioBase.POINT_Y_PREDIO, predioBase.POINT_X_PREDIO, 16);
  }
}
