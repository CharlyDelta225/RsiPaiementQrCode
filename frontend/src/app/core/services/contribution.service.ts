import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ContributionView, toContribution } from '../models/api.models';
import { Contribution, ContributionStatus } from '../models/contribution.model';
import { rethrow } from '../utils/api-error';

export interface AdminContributionQuery {
  search?: string;
  templeId?: number;
  offeringTypeId?: number;
  status?: ContributionStatus;
  from?: string;
  to?: string;
}

export interface ContributionsSummary {
  total: number;
  monthTotal: number;
}

@Injectable({ providedIn: 'root' })
export class ContributionService {
  private readonly http = inject(HttpClient);

  getMyContributions(): Observable<Contribution[]> {
    return this.fetchMyViews().pipe(map(toContributionList));
  }

  getAdminContributions(query: AdminContributionQuery = {}): Observable<Contribution[]> {
    return this.http
      .get<ContributionView[]>(`${API_BASE_URL}/admin/contributions`, { params: toParams(query) })
      .pipe(map(toContributionList), catchError(rethrow));
  }

  getRecentContributions(): Observable<Contribution[]> {
    return this.getMyContributions().pipe(map((contributions) => contributions.slice(0, 5)));
  }

  getContributionsSummary(): Observable<ContributionsSummary> {
    return this.fetchMyViews().pipe(
      map((views) => {
        const paid = views.filter((view) => view.status === 'PAID');
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthTotal = paid
          .filter((view) => new Date(view.paidAt ?? view.createdAt) >= startOfMonth)
          .reduce((sum, view) => sum + view.amount, 0);
        return {
          total: paid.reduce((sum, view) => sum + view.amount, 0),
          monthTotal,
        };
      }),
    );
  }

  private fetchMyViews(): Observable<ContributionView[]> {
    return this.http
      .get<ContributionView[]>(`${API_BASE_URL}/my/contributions`)
      .pipe(catchError(rethrow));
  }
}

function toContributionList(views: ContributionView[]): Contribution[] {
  return views.map(toContribution);
}

function toParams(query: AdminContributionQuery): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
