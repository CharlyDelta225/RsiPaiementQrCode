import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';
import { ContributionService } from './contribution.service';

const RECENT_COUNT = 5;

/**
 * Données agrégées de l'espace membre (tableau de bord).
 */
@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly contributionService = inject(ContributionService);

  getDashboardData(): Observable<DashboardData> {
    return this.contributionService.getMyContributionsWithSummary().pipe(
      map(({ contributions, summary }) => ({
        yearTotal: summary.yearTotal,
        recentContributions: contributions.slice(0, RECENT_COUNT),
      })),
    );
  }
}
