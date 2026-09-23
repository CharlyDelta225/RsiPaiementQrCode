import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.model';

/**
 * Service d'authentification.
 * Phase actuelle : authentification simulée (mock) avec des identifiants de démonstration.
 * Phase future : branchement sur l'API Spring Boot (/api/auth/login, /api/auth/register).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'moneglise_token';
  private readonly USER_KEY = 'moneglise_user';

  private readonly demoCredentials = {
    email: 'demo@moneglise.com',
    password: 'password',
  };

  private readonly demoUser: User = {
    id: 1,
    fullName: 'Jean Kouassi',
    email: 'demo@moneglise.com',
    phone: '+225 07 07 07 07 07',
    roles: ['MEMBER'],
  };

  readonly currentUser = signal<User | null>(this.getStoredUser());

  login(identifier: string, password: string): Observable<User> {
    const normalized = identifier.trim().toLowerCase();
    if (
      normalized === this.demoCredentials.email &&
      password === this.demoCredentials.password
    ) {
      const user = this.demoUser;
      this.persistSession('demo-token', user);
      this.currentUser.set(user);
      return of(user).pipe(delay(600));
    }
    return throwError(() => new Error('Identifiants incorrects.')).pipe(delay(400));
  }

  register(payload: { fullName: string; phone: string; email: string }): Observable<User> {
    const user: User = {
      id: Math.floor(Date.now() / 1000),
      fullName: payload.fullName,
      email: payload.email.toLowerCase().trim(),
      phone: payload.phone,
      roles: ['MEMBER'],
    };
    this.persistSession('demo-registered-token', user);
    this.currentUser.set(user);
    return of(user).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.getStoredToken() !== null;
  }

  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  private persistSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}