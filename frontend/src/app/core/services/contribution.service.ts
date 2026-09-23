import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Contribution } from '../models/contribution.model';

/**
 * Service des contributions — données simulées (exemple du mockup).
 * Phase future : branchement sur GET /api/member/contributions/recent.
 */
@Injectable({ providedIn: 'root' })
export class ContributionService {
  getRecentContributions(): Observable<Contribution[]> {
    const contributions: Contribution[] = [
      {
        id: 1,
        type: 'Dîme',
        amount: 50000,
        date: '17 sept. 2025',
        temple: 'Temple de Yopougon',
        status: 'PAID',
      },
    ];
    return of(contributions).pipe(delay(400));
  }

  getContributionsSummary(): Observable<{ total: number; monthTotal: number }> {
    return of({ total: 50000, monthTotal: 50000 }).pipe(delay(200));
  }
}