import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { InquiryStateService } from '../services/inquiry-state.service';

export const canAccessSolicitudGuard: CanActivateFn = () => {
  const stateService = inject(InquiryStateService);
  const router = inject(Router);
  const state = stateService.getState();

  // Permite acceso si hay un tipo de búsqueda seleccionado
  if (state.tipoBusqueda) {
    return true;
  }

  // Si no hay tipo seleccionado, redirige al inicio
  console.warn('⚠️ Acceso denegado a /solicitud: No hay tipo de búsqueda seleccionado');
  return router.createUrlTree(['/valor-ya/inicio']);
};

export const canAccessProcesoGuard: CanActivateFn = () => {
  const stateService = inject(InquiryStateService);
  const router = inject(Router);

  // Permite acceso solo si hay datos del predio
  if (stateService.hasPredioData()) {
    return true;
  }

  // Si no hay datos, redirige al inicio
  console.warn('⚠️ Acceso denegado a /proceso: No hay datos del predio');
  return router.createUrlTree(['/valor-ya/inicio']);
};

export const canAccessRespuestaGuard: CanActivateFn = () => {
  const stateService = inject(InquiryStateService);
  const router = inject(Router);

  // Permite acceso solo si hay datos del predio
  if (stateService.hasPredioData()) {
    return true;
  }

  // Si no hay datos, redirige al inicio
  console.warn('⚠️ Acceso denegado a /respuesta: No hay datos del predio');
  return router.createUrlTree(['/valor-ya/inicio']);
};
