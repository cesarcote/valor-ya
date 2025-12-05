import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ViewEncapsulation,
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
  isMain?: boolean;
  color?: string;
  markerType?: 'pin' | 'circle';
}

@Component({
  selector: 'app-test-map',
  templateUrl: './test-map.html',
  styleUrls: ['./test-map.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TestMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  private readonly http = inject(HttpClient);
  private map!: L.Map;
  private markers: L.Marker[] = [];

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

  setView(lat: number, lng: number, zoom?: number): void {
    if (!this.map) return;

    this.map.invalidateSize();
    const zoomLevel = zoom ?? this.config().zoom ?? 14;
    this.map.setView([lat, lng], zoomLevel);
  }

  addMarker(config: TestMarkerConfig): void {
    if (!this.map) return;

    const { lat, lng, popupText, isMain, color, markerType = 'pin' } = config;

    let marker: L.Marker;

    if (color) {
      let iconHtml: string;
      let iconSize: [number, number];
      let iconAnchor: [number, number];
      let popupAnchor: [number, number];

      if (markerType === 'circle') {
        iconHtml = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
          </svg>
        `;
        iconSize = [20, 20];
        iconAnchor = [10, 10];
        popupAnchor = [0, -10];
      } else {
        iconHtml = `
          <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" stroke="#fff" stroke-width="2"
              d="M12.5 0C5.6 0 0 5.6 0 12.5c0 1.9 0.4 3.7 1.2 5.3L12.5 41l11.3-23.2c0.8-1.6 1.2-3.4 1.2-5.3C25 5.6 19.4 0 12.5 0z"/>
            <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
          </svg>
        `;
        iconSize = [25, 41];
        iconAnchor = [12, 41];
        popupAnchor = [1, -34];
      }

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: popupAnchor,
      });
      marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    } else {
      marker = L.marker([lat, lng]).addTo(this.map);
    }

    this.markers.push(marker);

    if (popupText) {
      marker.bindPopup(popupText);
      if (isMain) {
        marker.openPopup();
      }
    }
  }

  clearMarkers(): void {
    if (this.markers.length > 0 && this.map) {
      this.markers.forEach((marker) => this.map.removeLayer(marker));
      this.markers = [];
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

  async downloadMap(): Promise<void> {
    if (!this.mapContainer) return;

    try {
      this.isLoading.set(true);

      const container = this.mapContainer.nativeElement;

      const originalWidth = container.style.width;
      const originalHeight = container.style.height;
      const originalAspectRatio = container.style.aspectRatio;

      container.style.width = '767px';
      container.style.height = '432px';
      container.style.aspectRatio = 'unset';

      this.map.invalidateSize();

      await new Promise((resolve) => setTimeout(resolve, 300));

      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 767,
        height: 432,
      });

      container.style.width = originalWidth;
      container.style.height = originalHeight;
      container.style.aspectRatio = originalAspectRatio;
      this.map.invalidateSize();

      const dataUrl = canvas.toDataURL('image/png');

      console.log('=== MAPA EN BASE64 (1200x800px) ===');
      console.log(dataUrl);
      console.log('====================================');

      const link = document.createElement('a');
      link.download = `mapa-valoracion-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el mapa:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async captureMapAsBase64(): Promise<string | null> {
    if (!this.mapContainer) return null;

    try {
      this.isLoading.set(true);

      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(this.mapContainer.nativeElement, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al capturar el mapa:', error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendMapToBackend(endpoint: string): Promise<void> {
    const base64Image = await this.captureMapAsBase64();

    if (!base64Image) {
      console.error('No se pudo capturar el mapa');
      return;
    }

    try {
      await this.http.post(endpoint, { image: base64Image }).toPromise();
    } catch (error) {
      console.error('Error al enviar el mapa al backend:', error);
      throw error;
    }
  }
}
