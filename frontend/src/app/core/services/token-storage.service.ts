import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

const TOKEN_KEY = 'moneglise_token';
const USER_KEY = 'moneglise_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly userSignal = signal<User | null>(readStoredUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();

  getToken(): string | null {
    return this.tokenSignal();
  }

  getUser(): User | null {
    return this.userSignal();
  }

  save(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.tokenSignal.set(token);
    this.userSignal.set(user);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
