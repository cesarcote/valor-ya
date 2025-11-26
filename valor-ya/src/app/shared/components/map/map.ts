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

export interface MapConfig {
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface MarkerConfig {
  lat: number;
  lng: number;
  popupText?: string;
  popupOptions?: L.PopupOptions;
  tooltipContent?: string | HTMLElement;
  tooltipOptions?: L.TooltipOptions;
}

export interface PolygonConfig {
  coordinates: L.LatLngExpression[];
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  private http = inject(HttpClient);
  private map!: L.Map;
  private currentMarker?: L.Marker;
  private currentPolygon?: L.Polygon;

  config = input<MapConfig>({
    center: [4.6097, -74.0817],
    zoom: 14,
    minZoom: 12,
    maxZoom: 20,
  });

  isLoading = signal(false);
  direccion = signal<string>('');

  private readonly DEFAULT_POLYGON_STYLE = {
    color: '#e3192f',
    weight: 3,
    fillColor: '#FEB400',
    fillOpacity: 0.3,
  };

  // Layer de mapa del catastro de Bogotá
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

    const zoomLevel = zoom ?? this.config().zoom ?? 14;
    this.map.setView([lat, lng], zoomLevel);
  }

  addMarker(markerConfig: MarkerConfig): void {
    if (!this.map) return;

    this.clearMarker();

    const { lat, lng, popupText, popupOptions, tooltipContent, tooltipOptions } = markerConfig;
    this.currentMarker = L.marker([lat, lng]).addTo(this.map);

    if (popupText) {
      this.currentMarker.bindPopup(popupText, popupOptions).openPopup();
    }

    if (tooltipContent) {
      this.currentMarker.bindTooltip(tooltipContent, tooltipOptions).openTooltip();

      this.currentMarker.on('click', () => {
        this.currentMarker?.openTooltip();
      });
    }
  }

  addPolygon(polygonConfig: PolygonConfig): void {
    if (!this.map) return;

    this.clearPolygon();

    const style = {
      color: polygonConfig.color ?? this.DEFAULT_POLYGON_STYLE.color,
      weight: polygonConfig.weight ?? this.DEFAULT_POLYGON_STYLE.weight,
      fillColor: polygonConfig.fillColor ?? this.DEFAULT_POLYGON_STYLE.fillColor,
      fillOpacity: polygonConfig.fillOpacity ?? this.DEFAULT_POLYGON_STYLE.fillOpacity,
    };

    this.currentPolygon = L.polygon(polygonConfig.coordinates, style).addTo(this.map);

    const bounds = this.currentPolygon.getBounds();
    this.map.fitBounds(bounds, {
      maxZoom: 19,
      paddingTopLeft: [20, 20],
      paddingBottomRight: [80, 20],
    });
  }

  ubicarLotePorCoordenadas(
    coordenadasPoligono: number[][][],
    direccion?: string,
    popupContent?: string | HTMLElement
  ): void {
    if (!this.map) {
      console.error('Map not initialized!');
      return;
    }

    if (!coordenadasPoligono || coordenadasPoligono.length === 0) {
      console.warn('Invalid coordinates:', coordenadasPoligono);
      return;
    }

    this.direccion.set(direccion || '');

    // Convertir coordenadas del polígono al formato de Leaflet
    const coordinates = this.parseRingsToLatLng(coordenadasPoligono);

    // Agregar el polígono al mapa
    this.addPolygon({ coordinates });

    // Agregar marcador en el centro del polígono
    const bounds = this.currentPolygon!.getBounds();
    const center = bounds.getCenter();

    this.addMarker({
      lat: center.lat,
      lng: center.lng,
      tooltipContent: popupContent || `<strong>Dirección:</strong> ${direccion || 'Sin dirección'}`,
      tooltipOptions: popupContent
        ? {
            permanent: true,
            direction: 'right',
            className: 'custom-tooltip-card',
            interactive: true,
            offset: [100, 0],
          }
        : undefined,
    });
  }

  clearMarker(): void {
    if (this.currentMarker && this.map) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = undefined;
    }
  }

  clearPolygon(): void {
    if (this.currentPolygon && this.map) {
      this.map.removeLayer(this.currentPolygon);
      this.currentPolygon = undefined;
    }
  }

  clearAll(): void {
    this.clearMarker();
    this.clearPolygon();
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

  private parseRingsToLatLng(rings: number[][][]): L.LatLngExpression[] {
    if (!rings || rings.length === 0) {
      console.error('Rings vacíos o inválidos');
      return [];
    }

    const mainRing = rings[0];
    return mainRing.map((coord: number[]) => [coord[1], coord[0]] as L.LatLngExpression);
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
    this.map.on('zoomend', () => {
      catastroLayer.setOpacity(0.8);
      this.updateTooltipOffset();
    });

    catastroLayer.addTo(this.map);
  }

  private updateTooltipOffset(): void {
    if (this.currentMarker && this.currentMarker.getTooltip()) {
      const zoom = this.map.getZoom();
      // Calculate offset based on zoom.
      // Example: Zoom 18 -> 100px. Zoom 14 -> 60px.
      // Formula: 100 - (18 - zoom) * 10
      const baseOffset = 100;
      const zoomFactor = 10;
      const referenceZoom = 18;

      let newOffsetX = baseOffset - (referenceZoom - zoom) * zoomFactor;

      if (newOffsetX < 40) newOffsetX = 40;

      const tooltip = this.currentMarker.getTooltip()!;
      tooltip.options.offset = [newOffsetX, 0];

      if (this.map.hasLayer(tooltip)) {
        this.currentMarker.closeTooltip();
        this.currentMarker.openTooltip();
      }
    }
  }

  closeTooltip(): void {
    if (this.currentMarker) {
      this.currentMarker.closeTooltip();
    }
  }
}
