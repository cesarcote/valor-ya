import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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

  private map!: L.Map;
  private marker!: L.Marker;

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

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [4.6097, -74.0817],
      zoom: 12,
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

    this.marker = L.marker([4.6097, -74.0817])
      .addTo(this.map)
      .bindPopup('Bogotá, Colombia')
      .openPopup();
  }
}
