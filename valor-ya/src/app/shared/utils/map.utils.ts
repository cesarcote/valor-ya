import * as L from 'leaflet';

export class MapUtils {
  static getCustomMarkerOptions(
    color: string,
    markerType: 'pin' | 'circle' = 'pin'
  ): L.DivIconOptions {
    let iconHtml: string;
    let iconSize: L.Point;
    let iconAnchor: L.Point;
    let popupAnchor: L.Point;

    const type = markerType === 'circle' ? 'circle' : 'pin';

    if (type === 'circle') {
      iconHtml = `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
        </svg>
      `;
      iconSize = L.point(20, 20);
      iconAnchor = L.point(10, 10);
      popupAnchor = L.point(0, -10);
    } else {
      iconHtml = `
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" stroke="#fff" stroke-width="2"
            d="M12.5 0C5.6 0 0 5.6 0 12.5c0 1.9 0.4 3.7 1.2 5.3L12.5 41l11.3-23.2c0.8-1.6 1.2-3.4 1.2-5.3C25 5.6 19.4 0 12.5 0z"/>
          <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
        </svg>
      `;
      iconSize = L.point(25, 41);
      iconAnchor = L.point(12, 41);
      popupAnchor = L.point(1, -34);
    }

    return {
      className: 'custom-marker',
      html: iconHtml,
      iconSize: iconSize,
      iconAnchor: iconAnchor,
      popupAnchor: popupAnchor,
    };
  }
}
