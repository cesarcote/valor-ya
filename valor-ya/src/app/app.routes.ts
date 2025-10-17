import { Routes } from '@angular/router';
import {
  canAccessSolicitudGuard,
  canAccessProcesoGuard,
  canAccessRespuestaGuard,
} from './core/guards/inquiry.guards';

export const routes: Routes = [
  {
    path: 'valor-ya',
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        title: 'Valor YA - Inicio',
        loadComponent: () =>
          import('./features/inquiry/step1-home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'solicitud',
        title: 'Valor YA - Consulta tu Predio',
        canActivate: [canAccessSolicitudGuard],
        loadComponent: () =>
          import('./features/inquiry/step2-application/application').then(
            (m) => m.ApplicationComponent
          ),
      },
      {
        path: 'proceso',
        title: 'Valor YA - Procesando Solicitud',
        canActivate: [canAccessProcesoGuard],
        loadComponent: () =>
          import('./features/inquiry/step3-process/process').then((m) => m.ProcessComponent),
      },
      {
        path: 'respuesta',
        title: 'Valor YA - Resultado de tu Consulta',
        canActivate: [canAccessRespuestaGuard],
        loadComponent: () =>
          import('./features/inquiry/step4-response/response').then((m) => m.ResponseComponent),
      },
      {
        path: '**',
        redirectTo: 'inicio',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'valor-ya',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'valor-ya',
  },
];
