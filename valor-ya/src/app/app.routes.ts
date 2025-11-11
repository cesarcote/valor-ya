import { Routes } from '@angular/router';
import { predioDataGuard } from './core/guards/predio-data.guard';

export const routes: Routes = [
  {
    path: 'valor-ya',
    children: [
      {
        path: '',
        redirectTo: 'seleccionar',
        pathMatch: 'full',
      },
      {
        path: 'seleccionar',
        title: 'Valor YA - Seleccionar',
        loadComponent: () => import('./features/valor-ya/step1/home').then((m) => m.HomeComponent),
      },
      {
        path: 'solicitud',
        title: 'Valor YA - Solicitud',
        loadComponent: () =>
          import('./features/valor-ya/step2/application').then((m) => m.ApplicationComponent),
      },
      {
        path: 'pago',
        title: 'Valor YA - Pago',
        loadComponent: () => import('./features/valor-ya/step3/process').then((m) => m.Process),
      },
      {
        path: 'complementar',
        title: 'Valor YA - Complementar Información',
        canActivate: [predioDataGuard],
        loadComponent: () =>
          import('./features/valor-ya/step3/components/complement-info').then(
            (m) => m.ComplementInfo
          ),
      },
      {
        path: 'respuesta',
        title: 'Valor YA - Respuesta',
        loadComponent: () =>
          import('./features/valor-ya/step4/response').then((m) => m.ResponseComponent),
      },
      {
        path: '**',
        redirectTo: 'seleccionar',
      },
    ],
  },
  {
    path: 'avaluos-en-garantia',
    children: [
      {
        path: '',
        redirectTo: 'seleccionar',
        pathMatch: 'full',
      },
      {
        path: 'seleccionar',
        title: 'Avalúos en Garantía - Seleccionar',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step1/home').then((m) => m.AvaluosHome),
      },
      {
        path: 'solicitud',
        title: 'Avalúos en Garantía - Solicitud',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step2/application').then(
            (m) => m.AvaluosApplication
          ),
      },
      {
        path: 'pago',
        title: 'Avalúos en Garantía - Pago',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step3/process').then((m) => m.AvaluosProcess),
      },
      {
        path: 'respuesta',
        title: 'Avalúos en Garantía - Respuesta',
        loadComponent: () =>
          import('./features/avaluos-en-garantia/step4/response').then((m) => m.AvaluosResponse),
      },
      {
        path: '**',
        redirectTo: 'seleccionar',
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
