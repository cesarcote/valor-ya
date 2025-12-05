import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class Footer {
  nombre_entidad = 'Unidad Administrativa Especial de Catastro Distrital';
  Direccion = 'Av. Carrera 30 No. 25 - 90, Torre B Piso 2';
  Cod_postal = '111311';
  Hor_atencion = 'Lunes a Viernes de 8:00 am a 4:30 pm';
  Tel_conmutador = '+57 601 234 7600';
  Lin_gratuita = '+57 601 234 7600 - Ext. 7600';
  Lin_anticorrupcion = '';
  Correo_institucional = 'buzon-correspondencia@catastrobogota.gov.co';
  Correo_not_judiciales = 'notificaciones@catastrobogota.gov.co';
  Lin_general = 'Línea 195';
  Portal_bogota = 'https://bogota.gov.co/';

  redes_sociales = [
    {
      nombre: '@catastrobogota_',
      url: 'https://www.instagram.com/catastrobogota_',
      title: 'Abrir Instagram de Catastro',
    },
    {
      nombre: '@CatastroBogota',
      url: 'https://www.facebook.com/CatastroBogota',
      title: 'Abrir Facebook de Catastro',
    },
    {
      nombre: '@CatastroBogota',
      url: 'https://twitter.com/CatastroBogota',
      title: 'Abrir Twitter de Catastro',
    },
    {
      nombre: '@CatastroBogota',
      url: 'https://www.youtube.com/channel/UCF1vty5F-FkJjwijlldTvJg',
      title: 'Abrir YouTube de Catastro',
    },
  ];
}
