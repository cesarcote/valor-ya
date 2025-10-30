import { Routes } from '@angular/router';
import { predioDataGuard } from './core/guards/predio-data.guard';

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
          import('./features/valor-ya/step1-home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'solicitud',
        title: 'Valor YA - Consulta tu Predio',
        loadComponent: () =>
          import('./features/valor-ya/step2-application/application').then(
            (m) => m.ApplicationComponent
          ),
      },
      {
        path: 'proceso',
        title: 'Valor YA - Procesando Solicitud',
        loadComponent: () =>
          import('./features/valor-ya/step3-process/process').then((m) => m.Process),
      },
      {
        path: 'complementar',
        title: 'Valor YA - Complementar Información',
        canActivate: [predioDataGuard],
        loadComponent: () =>
          import('./features/valor-ya/step3-process/components/complement-info').then(
            (m) => m.ComplementInfo
          ),
      },
      {
        path: 'respuesta',
        title: 'Valor YA - Resultado de tu Consulta',
        loadComponent: () =>
          import('./features/valor-ya/step4-response/response').then((m) => m.ResponseComponent),
      },
      {
        path: '**',
        redirectTo: 'inicio',
      },
    ],
  },
  {
    path: 'avaluos-en-garantia',
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        title: 'Avalúos en Garantía - Inicio',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step1-home/home').then((m) => m.AvaluosHome),
      },
      {
        path: 'solicitud',
        title: 'Avalúos en Garantía - Solicitud',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step2-application/application').then(
            (m) => m.AvaluosApplication
          ),
      },
      {
        path: 'proceso',
        title: 'Avalúos en Garantía - Proceso',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step3-process/process').then(
            (m) => m.AvaluosProcess
          ),
      },
      {
        path: 'respuesta',
        title: 'Avalúos en Garantía - Respuesta',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step4-response/response').then(
            (m) => m.AvaluosResponse
          ),
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
