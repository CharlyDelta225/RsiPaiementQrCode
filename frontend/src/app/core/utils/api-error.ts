import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiError } from '../models/api.models';

const GENERIC_ERROR = 'Une erreur est survenue. Veuillez réessayer.';

export function toFriendlyError(error: unknown): Error {
  if (!(error instanceof HttpErrorResponse)) {
    return new Error(GENERIC_ERROR);
  }
  if (error.status === 401) {
    return new Error('Identifiants incorrects.');
  }
  if (error.status === 403) {
    return new Error('Accès refusé : autorisation insuffisante.');
  }
  if (error.status === 0) {
    return new Error('Serveur injoignable. Vérifiez que l’API est démarrée.');
  }
  const payload = error.error as ApiError | null;
  return new Error(payload?.error ?? GENERIC_ERROR);
}

export function rethrow(error: unknown): Observable<never> {
  return throwError(() => toFriendlyError(error));
}
