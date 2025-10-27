import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { CatastroResponse } from '../../../../core/models/catastro-response.model';

@Component({
  selector: 'app-map',
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  private http = inject(HttpClient);
  private map!: L.Map;
  private marker!: L.Marker;
  private loteLayer?: L.Polygon;

  isLoadingUbicacion = signal(false);
  ubicacionData = signal<CatastroResponse | null>(null);

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

  private getUbicacionFromBackend(): Observable<CatastroResponse> {
    const mockResponse: CatastroResponse = {
      success: true,
      message: 'Consulta catastral realizada exitosamente',
      data: {
        infoGeografica: {
          areaPoligono: 451.58018913,
          longitudPoligono: 90.1995572949003,
          coordenadasPoligono: [
            [
              [-74.13142385200001, 4.718488246999982],
              [-74.13149593100002, 4.718488249000018],
              [-74.13149593000003, 4.718528927000023],
              [-74.13144637599999, 4.718528925999976],
              [-74.13142385100002, 4.718528924999987],
              [-74.131396822, 4.7185289239999975],
              [-74.131396822, 4.718488246999982],
              [-74.13142385200001, 4.718488246999982],
            ],
          ],
        },
        infoConsultaPredio: {
          chip: 'AAA0228WRAW',
          loteid: '008213033003',
        },
        infoAdicional: {
          municipio: 'Bogotá D.C.',
          localidad: 'Suba',
          barrio: 'Costa Azul',
          direccion: 'KR 119B 73B 15',
          tipoPredio: 'Residencial',
          estrato: '3',
          areaConstruidaPrivada: '120',
          edad: '10-20',
        },
      },
      error: null,
    };

    return of(mockResponse);
  }

  private parseCoordenadasPoligono(coordenadas: number[][][]): L.LatLngExpression[] {
    if (!coordenadas || coordenadas.length === 0) {
      console.error('Coordenadas vacías o inválidas');
      return [];
    }

    const ring = coordenadas[0];

    if (!ring || ring.length === 0) {
      console.error('Ring principal vacío o inválido');
      return [];
    }

    return ring.map((coord) => [coord[1], coord[0]]);
  }

  buscarUbicacionDesdeBackend(): void {
    this.isLoadingUbicacion.set(true);

    this.getUbicacionFromBackend().subscribe({
      next: (response) => {
        this.isLoadingUbicacion.set(false);
        this.ubicacionData.set(response);

        if (response.success && response.data?.infoGeografica.coordenadasPoligono) {
          this.dibujarPoligonoDesdeBackend(response);
        }
      },
      error: (error) => {
        this.isLoadingUbicacion.set(false);
        console.error('Error al obtener ubicación del backend:', error);
      },
    });
  }

  private dibujarPoligonoDesdeBackend(response: CatastroResponse): void {
    if (!response.data) return;

    const data = response.data;

    if (this.loteLayer) {
      this.map.removeLayer(this.loteLayer);
    }

    const coordinates = this.parseCoordenadasPoligono(data.infoGeografica.coordenadasPoligono);

    if (coordinates.length === 0) {
      console.error('No se pudieron parsear las coordenadas');
      return;
    }

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
    const popupContent = `
      <div style="font-family: Verdana, sans-serif; font-size: 13px;">
        <strong>${data.infoAdicional.direccion}</strong><br>
        <strong>CHIP:</strong> ${data.infoConsultaPredio.chip}<br>
        <strong>Lote ID:</strong> ${data.infoConsultaPredio.loteid}<br>
        <strong>Área:</strong> ${data.infoGeografica.areaPoligono.toFixed(2)} m²<br>
        <strong>Estrato:</strong> ${data.infoAdicional.estrato}
      </div>
    `;

    this.marker = L.marker([center.lat, center.lng])
      .addTo(this.map)
      .bindPopup(popupContent)
      .openPopup();
  }

  ubicarLotePorCodigo(lotcodigo: string): void {
    if (!this.map) {
      console.warn('Mapa no inicializado aún, esperando...');
      setTimeout(() => this.ubicarLotePorCodigo(lotcodigo), 100);
      return;
    }

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

    this.map.on('zoomstart', () => {
      catastroLayer.setOpacity(0.3);
    });

    this.map.on('zoomend', () => {
      catastroLayer.setOpacity(0.8);
    });

    catastroLayer.addTo(this.map);

    this.marker = L.marker([4.6097, -74.0817]).addTo(this.map).openPopup();
  }
}
