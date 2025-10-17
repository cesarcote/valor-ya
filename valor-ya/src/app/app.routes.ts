import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'valor-ya',
    loadComponent: () =>
      import('./features/inquiry/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'valor-ya/direccion-catastral',
    loadComponent: () =>
      import(
        './features/inquiry/application/formulario-direccion-catastral/formulario-direccion-catastral.component'
      ).then((m) => m.FormularioDireccionCatastralComponent),
  },
  {
    path: 'valor-ya/chip',
    loadComponent: () =>
      import('./features/inquiry/application/formulario-chip/formulario-chip.component').then(
        (m) => m.FormularioChipComponent
      ),
  },
  {
    path: 'valor-ya/fmi',
    loadComponent: () =>
      import('./features/inquiry/application/formulario-fmi/formulario-fmi.component').then(
        (m) => m.FormularioFmiComponent
      ),
  },
  {
    path: 'valor-ya/process',
    loadComponent: () =>
      import('./features/inquiry/process/process-container.component').then(
        (m) => m.ProcessContainerComponent
      ),
  },
  {
    path: '',
    redirectTo: 'valor-ya',
    pathMatch: 'full',
  },
];
