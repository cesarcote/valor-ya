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
      attributionControl: false,
    });

    const catastroLayer = esri.tiledMapLayer({
      url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_3857/MapServer',
      opacity: 0.8,
      maxZoom: 20,
    });

    let zoomTimeout: any;
    this.map.on('zoomstart', () => {
      catastroLayer.setOpacity(0.3);
      console.log('🔍 Zoom iniciado - Nivel:', this.map.getZoom());
    });

    this.map.on('zoomend', () => {
      const currentZoom = this.map.getZoom();
      console.log('✅ Zoom finalizado - Nivel:', currentZoom);
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        catastroLayer.setOpacity(0.8);
      }, 200);
    });

    this.map.on('zoom', () => {
      console.log('🔄 Zoom en progreso - Nivel:', this.map.getZoom());
    });

    catastroLayer.addTo(this.map);

    const cadesIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const cades = [
      {
        coords: [4.577802, -74.130469],
        nombre: 'Tunal',
        direccion: 'Carrera 24C 48 94 SUR, Centro Comercial Ciudad Tunal, Sotano 1 LC 58 59 60',
        horario: 'Lunes a viernes de 7:00 a.m. a 4:30 p.m.',
        url: 'https://bogota.gov.co/servicios/cades/cade-tunal',
      },
      {
        coords: [4.571291, -74.148273],
        nombre: 'Candelaria',
        direccion: 'Transversal 28 59C 75 SUR',
        horario: 'Lunes a viernes de 7:00 a.m. a 4:30 p.m.',
        url: 'https://bogota.gov.co/servicios/cades/cade-candelaria',
      },
      {
        coords: [4.624531, -74.15325],
        nombre: 'Kennedy',
        direccion: 'Carrera 78K 36 55 SUR',
        horario: 'Lunes a viernes de 7:00 a.m. a 4:30 p.m.',
        url: 'https://bogota.gov.co/servicios/cades/cade-kennedy',
      },
      {
        coords: [4.594716, -74.134033],
        nombre: 'Muzú',
        direccion: 'Carrera 51F 43 50 Sur',
        horario: 'Lunes a viernes de 7:00 a.m. a 4:30 p.m.',
        url: 'https://bogota.gov.co/servicios/cades/cade-muzu',
      },
      {
        coords: [4.641912, -74.158193],
        nombre: 'Patio Bonito',
        direccion: 'Carrera 87 5 B 21',
        horario: 'Lunes a viernes de 7:00 a.m. a 4:30 p.m.',
        url: 'https://bogota.gov.co/servicios/cades/cade-patio-bonito',
      },
      {
        coords: [4.57504, -74.121381],
        nombre: 'Santa Lucía',
        direccion: 'Avenida Caracas 41B 30 Sur',
        horario: 'Lunes a viernes de 7:00 a.m. a 4:30 p.m.',
        url: 'https://bogota.gov.co/servicios/cades/cade-santa-lucia',
      },
    ];

    cades.forEach((cade) => {
      const popup = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #3366cc;">CADE ${cade.nombre}</h3>
          <p style="margin: 5px 0;"><strong>Dirección:</strong><br>${cade.direccion}</p>
          <p style="margin: 5px 0;"><strong>Horario:</strong><br>${cade.horario}</p>
          <p style="margin: 5px 0;"><strong>Línea:</strong> 195</p>
          <a href="${cade.url}" target="_blank" style="color: #3366cc;">Más información</a>
        </div>
      `;

      L.marker(cade.coords as [number, number], { icon: cadesIcon })
        .addTo(this.map)
        .bindPopup(popup);
    });

    this.marker = L.marker([4.6097, -74.0817])
      .addTo(this.map)
      .bindPopup('Bogotá, Colombia')
      .openPopup();
  }
}
