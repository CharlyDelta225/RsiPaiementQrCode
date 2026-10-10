import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  ContributionView,
  PublicContributionView,
  toContribution,
  toDonationReceipt,
} from '../models/api.models';
import { Contribution, ContributionStatus, DonationReceipt } from '../models/contribution.model';
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
  yearTotal: number;
  paidCount: number;
}

export interface MyContributions {
  contributions: Contribution[];
  summary: ContributionsSummary;
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

  getMyContributionsWithSummary(): Observable<MyContributions> {
    return this.fetchMyViews().pipe(
      map((views) => ({ contributions: toContributionList(views), summary: summarize(views) })),
    );
  }

  getMyContributionDetail(id: number): Observable<DonationReceipt> {
    return this.http
      .get<PublicContributionView>(`${API_BASE_URL}/my/contributions/${id}`)
      .pipe(map(toDonationReceipt), catchError(rethrow));
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

function summarize(views: ContributionView[]): ContributionsSummary {
  const paid = views.filter((view) => view.status === 'PAID');
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sumSince = (since: Date) =>
    paid
      .filter((view) => new Date(view.paidAt ?? view.createdAt) >= since)
      .reduce((sum, view) => sum + view.amount, 0);
  return {
    total: paid.reduce((sum, view) => sum + view.amount, 0),
    monthTotal: sumSince(startOfMonth),
    yearTotal: sumSince(startOfYear),
    paidCount: paid.length,
  };
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
