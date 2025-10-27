import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ValorYaStateService } from '../services/valor-ya-state.service';

export const canAccessSolicitudGuard: CanActivateFn = () => {
  const stateService = inject(ValorYaStateService);
  const router = inject(Router);
  const state = stateService.getState();

  // Permite acceso si hay un tipo de búsqueda seleccionado
  if (state.tipoBusqueda) {
    return true;
  }

  // Si no hay tipo seleccionado, redirige al inicio
  return router.createUrlTree(['/valor-ya/inicio']);
};

export const canAccessProcesoGuard: CanActivateFn = () => {
  const stateService = inject(ValorYaStateService);
  const router = inject(Router);
  const state = stateService.getState();

  // Permite acceso si hay tipo de búsqueda y valor de búsqueda
  // (la consulta se hace en este paso)
  if (state.tipoBusqueda && state.valorBusqueda) {
    return true;
  }

  // Si no hay datos suficientes, redirige a solicitud
  return router.createUrlTree(['/valor-ya/solicitud']);
};

export const canAccessRespuestaGuard: CanActivateFn = () => {
  const stateService = inject(ValorYaStateService);
  const router = inject(Router);

  if (stateService.hasCatastroResponse() || stateService.hasPredioData()) {
    return true;
  }

  return router.createUrlTree(['/valor-ya/inicio']);
};
