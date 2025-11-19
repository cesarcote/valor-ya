import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TestStateService } from '../../features/test/services/test-state.service';

export const testDataGuard: CanActivateFn = () => {
  const stateService = inject(TestStateService);
  const router = inject(Router);

  const predioData = stateService.predioData();

  if (!predioData || !predioData.loteid) {
    router.navigate(['/test/solicitud']);
    return false;
  }

  return true;
};
