import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiError, AuthResponse } from '../models/api.models';
import { User } from '../models/user.model';
import { isStandaloneApp } from '../utils/display-mode';
import { AuthService } from './auth.service';

const DEVICE_TOKEN_KEY = 'rsi_device_token';
const DEVICE_OWNER_KEY = 'rsi_device_owner';
/** Au-delà de ce délai en arrière-plan, l'app redemande le code. */
const BACKGROUND_LOCK_MS = 5 * 60 * 1000;

/** Erreur de déverrouillage : `locked` = code désactivé, retour obligatoire au mot de passe. */
export class PinError extends Error {
  constructor(
    message: string,
    readonly locked: boolean,
  ) {
    super(message);
  }
}

/**
 * Code secret à 4 chiffres, uniquement dans l'application installée (écran d'accueil).
 * Le téléphone garde une clé d'appareil ; le code est vérifié par le serveur.
 */
@Injectable({ providedIn: 'root' })
export class DeviceLockService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Prénom affiché sur l'écran de déverrouillage (« Bonjour Charles »). */
  readonly ownerFirstName = signal<string | null>(readOwner());
  private hiddenAt: number | null = null;

  /** App installée sur l'écran d'accueil : seul contexte où le code secret s'applique. */
  isActiveContext(): boolean {
    return isStandaloneApp();
  }

  hasPin(): boolean {
    return this.readToken() !== null;
  }

  /** Le code peut remplacer le mot de passe sur ce téléphone. */
  canUnlock(): boolean {
    return this.isActiveContext() && this.hasPin();
  }

  /** Après une connexion par mot de passe : faut-il proposer de créer le code ? */
  needsSetup(): boolean {
    return this.isActiveContext() && !this.hasPin();
  }

  /** À chaque ouverture de l'app installée : la session précédente ne suffit pas, code exigé. */
  lockOnLaunch(): void {
    if (this.canUnlock()) {
      this.authService.logout();
    }
  }

  /** Verrouille après 5 minutes passées en arrière-plan. */
  watchBackground(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.hiddenAt = Date.now();
        return;
      }
      const away = this.hiddenAt === null ? 0 : Date.now() - this.hiddenAt;
      this.hiddenAt = null;
      if (away >= BACKGROUND_LOCK_MS && this.canUnlock() && this.authService.isAuthenticated()) {
        this.lock();
      }
    });
  }

  lock(): void {
    const current = this.router.url;
    this.authService.logout();
    this.router.navigate(['/verrouillage'], {
      queryParams: current.startsWith('/member') ? { retour: current } : {},
    });
  }

  /** Crée (ou remplace) le code de ce téléphone ; l'utilisateur doit être connecté. */
  setPin(pin: string): Observable<void> {
    const body = { pin, replaceDeviceToken: this.readToken() };
    return this.http.post<{ deviceToken: string }>(`${API_BASE_URL}/my/device-pin`, body).pipe(
      tap(({ deviceToken }) => {
        this.writeToken(deviceToken);
        this.rememberOwner(this.authService.getCurrentUser());
      }),
      map(() => undefined),
      catchError((error: unknown) => throwError(() => new Error(messageOf(error)))),
    );
  }

  unlock(pin: string): Observable<User> {
    const deviceToken = this.readToken();
    if (!deviceToken) {
      return throwError(() => new PinError('Aucun code sur ce téléphone.', true));
    }
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/pin-login`, { deviceToken, pin }).pipe(
      map((response) => this.authService.adoptSession(response)),
      catchError((error: unknown) => {
        const locked = error instanceof HttpErrorResponse && error.status === 423;
        if (locked) {
          this.clearDevice();
        }
        return throwError(() => new PinError(messageOf(error), locked));
      }),
    );
  }

  /** « Code oublié » ou déconnexion : la clé de ce téléphone est révoquée côté serveur. */
  forget(): void {
    const deviceToken = this.readToken();
    if (deviceToken) {
      this.http
        .post(`${API_BASE_URL}/auth/device/revoke`, { deviceToken })
        .pipe(catchError(() => []))
        .subscribe();
    }
    this.clearDevice();
  }

  private clearDevice(): void {
    remove(DEVICE_TOKEN_KEY);
    remove(DEVICE_OWNER_KEY);
    this.ownerFirstName.set(null);
  }

  private rememberOwner(user: User | null): void {
    const firstName = user?.firstName || user?.fullName.split(' ')[0] || null;
    write(DEVICE_OWNER_KEY, firstName ?? '');
    this.ownerFirstName.set(firstName);
  }

  private readToken(): string | null {
    return read(DEVICE_TOKEN_KEY);
  }

  private writeToken(token: string): void {
    write(DEVICE_TOKEN_KEY, token);
  }
}

function messageOf(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Connexion impossible. Vérifiez votre réseau.';
    }
    const payload = error.error as ApiError | null;
    const detail = payload?.details ? Object.values(payload.details)[0] : undefined;
    return detail ?? payload?.error ?? 'Une erreur est survenue. Réessayez.';
  }
  return 'Une erreur est survenue. Réessayez.';
}

function readOwner(): string | null {
  return read(DEVICE_OWNER_KEY) || null;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // stockage indisponible : le code ne pourra pas être retenu sur cet appareil
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignoré
  }
}
