import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  signal,
  input,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';

export interface TestMapConfig {
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface TestMarkerConfig {
  lat: number;
  lng: number;
  popupText?: string;
  color?: string;
  number?: number;
  isMain?: boolean;
}

@Component({
  selector: 'app-test-map',
  standalone: true,
  templateUrl: './test-map.html',
  styleUrls: ['./test-map.css'],
})
export class TestMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  private http = inject(HttpClient);
  private map!: L.Map;
  private currentMarker?: L.Marker;

  config = input<TestMapConfig>({
    center: [4.6097, -74.0817],
    zoom: 14,
    minZoom: 12,
    maxZoom: 20,
  });

  isLoading = signal(false);
  mapReady = signal(false);

  private readonly CATASTRO_TILE_URL =
    'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_3857/MapServer';

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  isMapReady(): boolean {
    return this.map !== undefined && this.map !== null;
  }

  setView(lat: number, lng: number, zoom?: number): void {
    if (!this.map) return;

    // Forzar redibujado del mapa para asegurar que las tiles se carguen
    this.map.invalidateSize();

    const zoomLevel = zoom ?? this.config().zoom ?? 14;
    this.map.setView([lat, lng], zoomLevel);
  }

  invalidateSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  addMarker(config: TestMarkerConfig): void {
    console.log('TestMapComponent: addMarker called with config:', config);

    if (!this.map) {
      console.error('TestMapComponent: Map not initialized');
      return;
    }

    this.clearMarkers();

    const { lat, lng, popupText, isMain } = config;

    console.log(`TestMapComponent: Creating marker at [${lat}, ${lng}]`);

    this.currentMarker = L.marker([lat, lng]).addTo(this.map);

    console.log(`TestMapComponent: Marker added.`);

    if (popupText) {
      this.currentMarker.bindPopup(popupText);
      if (isMain) {
        this.currentMarker.openPopup();
      }
    }
  }

  clearMarkers(): void {
    if (this.currentMarker && this.map) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = undefined;
    }
  }

  private initMap(): void {
    const mapConfig = this.config();

    this.map = L.map(this.mapContainer.nativeElement, {
      center: mapConfig.center!,
      zoom: mapConfig.zoom!,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
    });

    this.initMarkerIcons();
    this.addCatastroTileLayer();
    this.mapReady.set(true);

    // Asegurar que el mapa se ajuste al contenedor después de un momento
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  private initMarkerIcons(): void {
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = iconDefault;
  }

  private addCatastroTileLayer(): void {
    const catastroLayer = esri.tiledMapLayer({
      url: this.CATASTRO_TILE_URL,
      opacity: 0.8,
      maxZoom: 20,
      attribution:
        'Powered by <a href="https://www.esri.com">Esri</a> | IDECA - UAECD, Secretaría General de la Alcaldía Mayor de Bogotá D.C.',
    });

    this.map.on('zoomstart', () => catastroLayer.setOpacity(0.3));
    this.map.on('zoomend', () => catastroLayer.setOpacity(0.8));

    catastroLayer.addTo(this.map);
  }
}
