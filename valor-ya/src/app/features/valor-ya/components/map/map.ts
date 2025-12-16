import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  signal,
  input,
  inject,
  output,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { MapUtils } from '../../../../shared/utils/map.utils';
import { MapCardComponent } from '../map-card/map-card.component';
import { PredioData } from '../../models/predio-data.model';
import { MCMValorYAResultado, CalcularValorYaResponse } from '../../models/mcm-valor-ya.model';

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
  color?: string;
  markerType?: 'pin' | 'circle';
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
  imports: [MapCardComponent],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapWrapper', { static: false }) mapWrapper!: ElementRef;
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  private readonly http = inject(HttpClient);
  private map!: L.Map;
  private currentMarker?: L.Marker;
  private currentPolygon?: L.Polygon;
  private centerControl?: L.Control;
  private restoreCardAfterZoom = false;
  private mobileMql?: MediaQueryList;
  private onMobileChange?: (event: MediaQueryListEvent) => void;

  cardVisible = signal(false);
  isMobile = signal(false);
  cardPredioData = signal<PredioData | undefined>(undefined);
  cardValorYaData = signal<MCMValorYAResultado | CalcularValorYaResponse | undefined>(undefined);
  predioSelected = output<void>();

  config = input<MapConfig>({
    center: [4.6097, -74.0817],
    zoom: 14,
    minZoom: 12,
    maxZoom: 20,
  });

  isLoading = signal(false);
  isCapturing = signal(false);
  direccion = signal<string>('');
  showDireccion = input(true);

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
    this.initMobileDetection();
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.centerControl?.remove();
      this.map.remove();
    }

    if (this.mobileMql && this.onMobileChange) {
      this.mobileMql.removeEventListener('change', this.onMobileChange);
    }
  }

  setView(lat: number, lng: number, zoom?: number, animate: boolean = true): void {
    if (!this.map) return;

    const zoomLevel = zoom ?? this.config().zoom ?? 14;
    this.map.setView([lat, lng], zoomLevel, { animate });
  }

  addMarker(markerConfig: MarkerConfig): void {
    if (!this.map) return;

    this.clearMarker();

    const { lat, lng, popupText, popupOptions, tooltipContent, tooltipOptions, color, markerType } =
      markerConfig;

    let marker: L.Marker;

    if (color) {
      const iconOptions = MapUtils.getCustomMarkerOptions(color, markerType);
      const customIcon = L.divIcon(iconOptions);
      marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    } else {
      marker = L.marker([lat, lng]).addTo(this.map);
    }

    this.currentMarker = marker;

    if (popupText) {
      marker.bindPopup(popupText, popupOptions).openPopup();
    }

    if (tooltipContent && tooltipOptions) {
      marker.bindTooltip(tooltipContent, tooltipOptions).openTooltip();
    }

    if (this.cardPredioData() && !this.isMobile()) {
      marker.on('click', () => {
        if (!this.cardVisible()) {
          this.showCard();
          this.predioSelected.emit();
        }
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

    this.currentPolygon.on('click', () => {
      if (!this.cardVisible()) {
        this.showCard();
        this.predioSelected.emit();
      }
    });

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
    predioData?: PredioData,
    valorYaData?: MCMValorYAResultado | CalcularValorYaResponse
  ): void {
    if (!this.map) {
      console.error('Map not initialized!');
      return;
    }

    if (!coordenadasPoligono || coordenadasPoligono.length === 0) {
      console.warn('Invalid coordinates:', coordenadasPoligono);
      return;
    }

    this.clearAll();

    this.direccion.set(direccion || '');

    if (predioData) {
      this.cardPredioData.set(predioData);
      this.cardValorYaData.set(valorYaData);
      if (!this.isMobile()) {
        this.showCard();
      }
    }

    const coordinates = this.parseRingsToLatLng(coordenadasPoligono);

    this.addPolygon({ coordinates });

    const bounds = this.currentPolygon!.getBounds();
    const center = bounds.getCenter();

    this.addMarker({
      lat: center.lat,
      lng: center.lng,
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
    this.hideCard();
    this.cardPredioData.set(undefined);
    this.cardValorYaData.set(undefined);
  }

  async captureMapAsBase64(): Promise<string | null> {
    if (!this.mapContainer || !this.map) return null;

    try {
      this.isCapturing.set(true);

      const container = this.mapWrapper.nativeElement;

      const originalWidth = container.style.width;
      const originalHeight = container.style.height;
      const originalAspectRatio = container.style.aspectRatio;

      container.style.width = '767px';
      container.style.height = '432px';
      container.style.aspectRatio = 'unset';

      this.map.invalidateSize();

      await new Promise((resolve) => setTimeout(resolve, 800));

      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 767,
        height: 432,
        scale: 1,
      });

      container.style.width = originalWidth;
      container.style.height = originalHeight;
      container.style.aspectRatio = originalAspectRatio;
      this.map.invalidateSize();

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al capturar el mapa:', error);
      return null;
    } finally {
      this.isCapturing.set(false);
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
    this.registerZoomHandlers();
    this.createCenterControl();
  }
  private registerZoomHandlers(): void {
    this.map.on('zoomstart', () => {
      this.removeCustomTooltipCards();
      if (this.cardVisible()) {
        this.restoreCardAfterZoom = true;
        this.hideCard();
      } else {
        this.restoreCardAfterZoom = false;
      }
    });

    this.map.on('zoomend', () => {
      this.removeCustomTooltipCards();
      if (this.restoreCardAfterZoom && this.cardPredioData()) {
        this.showCard();
      }
      this.restoreCardAfterZoom = false;
    });
  }

  private removeCustomTooltipCards(): void {
    const tooltipPane = this.map.getPanes()?.tooltipPane;
    if (!tooltipPane) return;

    tooltipPane.querySelectorAll('.custom-tooltip-card').forEach((node) => node.remove());
  }
  private initMobileDetection(): void {
    if (typeof window === 'undefined') return;

    this.mobileMql = window.matchMedia('(max-width: 768px)');
    this.isMobile.set(this.mobileMql.matches);

    this.onMobileChange = (event: MediaQueryListEvent) => {
      this.isMobile.set(event.matches);
      if (event.matches) {
        this.hideCard();
      }
    };

    this.mobileMql.addEventListener('change', this.onMobileChange);
  }

  
  private createCenterControl(): void {
    const CenterControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        const link = L.DomUtil.create('a', 'leaflet-control-center', container);
        link.setAttribute('href', '#');
        link.setAttribute('role', 'button');
        link.setAttribute('aria-label', 'Centrar en el predio');
        link.title = 'Centrar en el predio';
        link.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>';

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(link, 'click', (e: Event) => {
          L.DomEvent.preventDefault(e);
          this.centerOnPredio();
        });

        return container;
      },
    });

    this.centerControl = new CenterControl({ position: 'topleft' });
    this.centerControl.addTo(this.map);
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

  showCard(): void {
    this.cardVisible.set(true);
  }

  hideCard(): void {
    this.cardVisible.set(false);
  }

  closeTooltip(): void {
    this.hideCard();
  }

  openTooltip(): void {
    this.showCard();
  }

  centerOnPredio(animate: boolean = true): void {
    if (!this.map || !this.currentPolygon) return;

    const bounds = this.currentPolygon.getBounds();
    this.map.fitBounds(bounds, {
            maxZoom: 19,
      paddingTopLeft: [20, 20],
      paddingBottomRight: [80, 20],
    });
  }

  isTooltipVisible(): boolean {
    return this.cardVisible();
  }
}
