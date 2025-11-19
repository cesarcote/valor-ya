import { Injectable } from '@angular/core';
import { MapComponent } from '../../../shared/components/map/map';

@Injectable({
  providedIn: 'root',
})
export class McmMapService {
  constructor() {}

  visualizarMCM(map: MapComponent, data: any): void {
    if (!map || !data || !data.resultados || data.resultados.length === 0) {
      console.warn('Datos MCM inválidos o mapa no inicializado');
      return;
    }

    // Limpiar marcadores existentes
    map.clearMarkers();

    const resultados = data.resultados;
    const predioBase = resultados[0]; // Tomamos el primero para sacar datos del predio base

    // 1. Dibujar "Predio a Valorar"
    // Usamos un color distintivo, por ejemplo azul o el default
    map.addColoredMarker({
      lat: predioBase.POINT_Y_PREDIO,
      lng: predioBase.POINT_X_PREDIO,
      popupText: `<strong>Predio a Valorar</strong><br>${predioBase.DIRECCION_REAL_PREDIO}`,
      color: '#0000FF', // Azul
      isMain: true,
      number: 0,
    });

    // 2. Dibujar puntos de comparación
    resultados.forEach((item: any, index: number) => {
      map.addColoredMarker({
        lat: item.POINT_Y_OFERTA,
        lng: item.POINT_X_OFERTA,
        popupText: `<strong>Comparable #${index + 1}</strong><br>${
          item.DIRECCION_REAL_OFERTA
        }<br>Oferta: $${item.VALOR_INTEGRAL_OFERTA}`,
        color: '#e3192f', // Rojo (o el color que desees para comparables)
        number: index + 1,
      });
    });

    // Centrar el mapa en el predio a valorar
    map.setView(predioBase.POINT_Y_PREDIO, predioBase.POINT_X_PREDIO, 16);
  }
}
