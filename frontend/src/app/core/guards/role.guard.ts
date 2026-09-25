import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export function roleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getCurrentUser();

    if (!user || !authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    if (user.roles.some((role) => allowedRoles.includes(role))) {
      return true;
    }
    return router.createUrlTree(['/welcome']);
  };
}
