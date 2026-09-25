import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { TempleView, toTemple } from '../models/api.models';
import { Temple } from '../models/temple.model';
import { rethrow } from '../utils/api-error';

@Injectable({ providedIn: 'root' })
export class TempleService {
  private readonly http = inject(HttpClient);

  getTemples(): Observable<Temple[]> {
    return this.http.get<TempleView[]>(`${API_BASE_URL}/temples`).pipe(
      map((views) => views.filter((view) => view.active).map(toTemple)),
      catchError(rethrow),
    );
  }

  getTemple(id: number): Observable<Temple> {
    return this.http
      .get<TempleView>(`${API_BASE_URL}/temples/${id}`)
      .pipe(map(toTemple), catchError(rethrow));
  }
}
