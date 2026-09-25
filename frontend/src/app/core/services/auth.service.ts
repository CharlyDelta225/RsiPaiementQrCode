import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthResponse, RegisterRequest, UserView, toUser } from '../models/api.models';
import { User, UserRole } from '../models/user.model';
import { rethrow } from '../utils/api-error';
import { TokenStorageService } from './token-storage.service';

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  templeId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);

  readonly currentUser = signal<User | null>(this.storage.getUser());

  login(identifier: string, password: string): Observable<User> {
    const body = { email: identifier.trim().toLowerCase(), password };
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, body)
      .pipe(map((response) => this.openSession(response)), catchError(rethrow));
  }

  register(payload: RegisterPayload): Observable<User> {
    if (!payload.password) {
      return throwError(() => new Error('L’inscription nécessite un mot de passe.'));
    }
    if (!payload.templeId) {
      return throwError(() => new Error('L’inscription nécessite le choix d’un temple.'));
    }
    const names = payload.fullName.trim().split(/\s+/);
    const firstName = names[0] ?? '';
    const lastName = names.slice(1).join(' ') || firstName;
    const body: RegisterRequest = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      firstName,
      lastName,
      phone: payload.phone,
      templeId: payload.templeId,
    };
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/register`, body)
      .pipe(map((response) => this.openSession(response)), catchError(rethrow));
  }

  hydrate(): Observable<User | null> {
    const token = this.storage.getToken();
    if (!token) {
      this.currentUser.set(null);
      return of(null);
    }
    return this.http.get<UserView>(`${API_BASE_URL}/auth/me`).pipe(
      map((view) => {
        const user = toUser(view);
        this.storage.save(token, user);
        this.currentUser.set(user);
        return user;
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    this.storage.clear();
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.storage.getToken() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser() ?? this.storage.getUser();
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.some((role) => roles.includes(role)) : false;
  }

  private openSession(response: AuthResponse): User {
    const user = toUser(response.user);
    this.storage.save(response.token, user);
    this.currentUser.set(user);
    return user;
  }
}
