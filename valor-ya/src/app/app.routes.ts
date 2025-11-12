import { Routes } from '@angular/router';
import { predioDataGuard } from './core/guards/predio-data.guard';
import { testDataGuard } from './core/guards/test-data.guard';

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
        loadComponent: () =>
          import('./features/valor-ya/step1/search-forms/search-forms').then(
            (m) => m.SearchFormsComponent
          ),
      },
      {
        path: 'solicitud',
        title: 'Valor YA - Solicitud',
        loadComponent: () =>
          import('./features/valor-ya/step2/predio-review/predio-review').then(
            (m) => m.PredioReviewComponent
          ),
      },
      {
        path: 'pago',
        title: 'Valor YA - Pago',
        canActivate: [predioDataGuard],
        loadComponent: () =>
          import('./features/valor-ya/step3/payment/payment').then((m) => m.PaymentComponent),
      },
      {
        path: 'pago-status/:status',
        title: 'Valor YA - Estado del Pago',
        loadComponent: () =>
          import('./features/valor-ya/step3/payment-status/payment-status').then(
            (m) => m.PaymentStatusComponent
          ),
      },
      {
        path: 'complementar',
        title: 'Valor YA - Complementar Información',
        canActivate: [predioDataGuard],
        loadComponent: () =>
          import('./features/valor-ya/step2/complement-info/complement-info').then(
            (m) => m.ComplementInfo
          ),
      },
      {
        path: 'respuesta',
        title: 'Valor YA - Respuesta',
        canActivate: [predioDataGuard],
        loadComponent: () =>
          import('./features/valor-ya/step4/result/result').then((m) => m.ResultComponent),
      },
      {
        path: '**',
        redirectTo: 'seleccionar',
      },
    ],
  },
  {
    path: 'test',
    children: [
      {
        path: '',
        redirectTo: 'seleccionar',
        pathMatch: 'full',
      },
      {
        path: 'seleccionar',
        title: 'Test - Seleccionar',
        loadComponent: () =>
          import('./features/test/step1/search-forms/search-forms').then(
            (m) => m.SearchFormsComponent
          ),
      },
      {
        path: 'solicitud',
        title: 'Test - Solicitud',
        loadComponent: () =>
          import('./features/test/step2/predio-review/predio-review').then(
            (m) => m.PredioReviewComponent
          ),
      },
      {
        path: 'pago',
        title: 'Test - Pago',
        canActivate: [testDataGuard],
        loadComponent: () =>
          import('./features/test/step3/payment/payment').then((m) => m.PaymentComponent),
      },
      {
        path: 'pago-status/:status',
        title: 'Test - Estado del Pago',
        loadComponent: () =>
          import('./features/test/step3/payment-status/payment-status').then(
            (m) => m.PaymentStatusComponent
          ),
      },
      {
        path: 'complementar',
        title: 'Test - Complementar Información',
        canActivate: [testDataGuard],
        loadComponent: () =>
          import('./features/test/step2/complement-info/complement-info').then(
            (m) => m.ComplementInfo
          ),
      },
      {
        path: 'respuesta',
        title: 'Test - Respuesta',
        canActivate: [testDataGuard],
        loadComponent: () =>
          import('./features/test/step4/result/result').then((m) => m.ResultComponent),
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
