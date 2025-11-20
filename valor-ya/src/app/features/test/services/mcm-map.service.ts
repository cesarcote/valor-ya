import { Injectable } from '@angular/core';
import { TestMapComponent } from '../components/test-map/test-map';

@Injectable({
  providedIn: 'root',
})
export class McmMapService {
  visualizarMCM(map: TestMapComponent, data: any): void {
    if (!map || !data?.resultados?.length) {
      return;
    }

    const predioBase = data.resultados[0];

    map.addMarker({
      lat: predioBase.POINT_Y_PREDIO,
      lng: predioBase.POINT_X_PREDIO,
      popupText: `<strong>Predio a Valorar</strong>`,
      isMain: true,
      color: '#e3192f',
      markerType: 'pin',
    });

    const coloresOfertas = ['#2563eb', '#10b981', '#f9bc16ff'];

    data.resultados.forEach((oferta: any, index: number) => {
      map.addMarker({
        lat: oferta.POINT_Y_OFERTA,
        lng: oferta.POINT_X_OFERTA,
        popupText: `<strong>Oferta ${
          index + 1
        }</strong><br>Valor: $${oferta.VALOR_INTEGRAL_OFERTA?.toLocaleString()}`,
        isMain: false,
        color: coloresOfertas[index % coloresOfertas.length],
        markerType: 'circle',
      });
    });

    // Centrar el mapa en el predio a valorar
    map.setView(predioBase.POINT_Y_PREDIO, predioBase.POINT_X_PREDIO, 16);
  }
}
