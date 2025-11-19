import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ValorYaStateService } from '../../features/valor-ya/services/valor-ya-state.service';

export const predioDataGuard: CanActivateFn = () => {
  const stateService = inject(ValorYaStateService);
  const router = inject(Router);

  const predioData = stateService.predioData();

  if (!predioData || !predioData.loteid) {
    router.navigate(['/valor-ya/solicitud']);
    return false;
  }

  return true;
};
