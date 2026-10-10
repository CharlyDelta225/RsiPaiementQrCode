import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DeviceLockService } from '../services/device-lock.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  if (inject(DeviceLockService).canUnlock()) {
    return router.createUrlTree(['/verrouillage'], { queryParams: { retour: state.url } });
  }
  return router.createUrlTree(['/login']);
};

/** Accueil public : sur l'app installée avec code, on va directement au déverrouillage. */
export const unlockFirstGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (inject(AuthService).isAuthenticated()) {
    return router.createUrlTree(['/member/dashboard']);
  }
  if (inject(DeviceLockService).canUnlock()) {
    return router.createUrlTree(['/verrouillage']);
  }
  return true;
};
