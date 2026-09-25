import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);
  const token = storage.getToken();

  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint(request.url)) {
        storage.clear();
        if (!router.url.startsWith('/login')) {
          void router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};

function isAuthEndpoint(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/register');
}
