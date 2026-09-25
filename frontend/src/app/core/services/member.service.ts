import { Injectable, signal } from '@angular/core';
import { Observable, of, map, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { DashboardData } from '../models/dashboard.model';
import { AuthService } from './auth.service';
import { ContributionService } from './contribution.service';

export interface MemberProfile {
  fullName: string;
  email: string;
  phone: string;
  churchName: string;
  memberSince: string;
}

export interface WalletBalance {
  amount: number;
  currency: string;
  label: string;
}

/**
 * Service "membre" — données simulées en attendant l'API Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class MemberService {
  readonly profile = signal<MemberProfile | null>(null);
  readonly balance = signal<WalletBalance>({ amount: 0, currency: 'FCFA', label: 'Solde de mon compte' });

  constructor(
    private authService: AuthService,
    private contributionService: ContributionService,
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profile.set(this.buildProfile(user));
    }
  }

  getProfile(): Observable<MemberProfile> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
    }
    const profile = this.buildProfile(user);
    this.profile.set(profile);
    return of(profile);
  }

  getDashboardData(): Observable<DashboardData> {
    return this.contributionService.getRecentContributions().pipe(
      map((recentContributions) => ({
        balance: this.balance().amount,
        recentContributions,
      })),
    );
  }

  refresh(): void {
    this.getProfile().subscribe();
  }

  private buildProfile(user: User): MemberProfile {
    return {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      churchName: 'Mon Église',
      memberSince: 'Janvier 2025',
    };
  }
}