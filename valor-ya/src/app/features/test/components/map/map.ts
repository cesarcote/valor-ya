import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  private http = inject(HttpClient);
  private map!: L.Map;
  private marker!: L.Marker;
  private loteLayer?: L.Polygon;

  ngOnInit(): void {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  setView(lat: number, lng: number, zoom = 13): void {
    if (this.map) {
      this.map.setView([lat, lng], zoom);

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      }
    }
  }

  addMarker(lat: number, lng: number, popupText?: string): void {
    if (this.map) {
      const marker = L.marker([lat, lng]).addTo(this.map);

      if (popupText) {
        marker.bindPopup(popupText);
      }
    }
  }

  ubicarLotePorCodigo(lotcodigo: string): void {
    const url = `https://sig.catastrobogota.gov.co/arcgis/rest/services/catastro/lote/MapServer/0/query?returnGeometry=true&where=LOTCODIGO%20%3D%20%27${lotcodigo}%27&outSr=4326&outFields=*&f=json`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.features && response.features.length > 0) {
          const feature = response.features[0];
          const rings = feature.geometry.rings;

          if (this.loteLayer) {
            this.map.removeLayer(this.loteLayer);
          }

          const coordinates = rings.map((ring: number[][]) =>
            ring.map((coord: number[]) => [coord[1], coord[0]])
          );

          this.loteLayer = L.polygon(coordinates, {
            color: '#e3192f',
            weight: 3,
            fillColor: '#FEB400',
            fillOpacity: 0.3,
          }).addTo(this.map);

          const bounds = this.loteLayer.getBounds();
          this.map.fitBounds(bounds, { maxZoom: 20, padding: [20, 20] });

          if (this.marker) {
            this.map.removeLayer(this.marker);
          }

          const center = bounds.getCenter();
          this.marker = L.marker([center.lat, center.lng])
            .addTo(this.map)
            .bindPopup(`LOTE: ${lotcodigo}`)
            .openPopup();
        }
      },
      error: (error) => {
        console.error('Error al buscar lote:', error);
      },
    });
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [4.6097, -74.0817],
      zoom: 14,
      minZoom: 12,
      maxZoom: 20,
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
    });

    const catastroLayer = esri.tiledMapLayer({
      url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_3857/MapServer',
      opacity: 0.8,
      maxZoom: 20,
      attribution:
        'Powered by <a href="https://www.esri.com">Esri</a> | IDECA - UAECD, Secretaría General de la Alcaldía Mayor de Bogotá D.C.',
    });

    let zoomTimeout: any;
    this.map.on('zoomstart', () => {
      catastroLayer.setOpacity(0.3);
    });

    this.map.on('zoomend', () => {
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        catastroLayer.setOpacity(0.8);
      }, 200);
    });

    catastroLayer.addTo(this.map);

    this.marker = L.marker([4.6097, -74.0817]).addTo(this.map).openPopup();
  }
}
