import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  ApiError,
  OfferingTypeView,
  PublicContributionCreatedView,
  PublicContributionView,
  toDonationReceipt,
  toOfferingType,
} from '../../../core/models/api.models';
import { DonationReceipt } from '../../../core/models/contribution.model';
import { OfferingType } from '../../../core/models/offering-type.model';
import { PublicPaymentProvider } from '../../../core/models/payment-provider.model';
import { rethrow } from '../../../core/utils/api-error';
import {
  DonationStep,
  PublicContributionPayload,
  parseAmountInput,
  sanitizeAmountInput,
} from '../models/donation.model';

export type OfferingTypesState = 'loading' | 'ready' | 'error';

const STEPS: readonly DonationStep[] = [1, 2, 3];
const GENERIC_DONATION_ERROR = 'Votre don n’a pas pu être enregistré. Veuillez réessayer.';

@Injectable({ providedIn: 'root' })
export class DonationFlowService {
  private readonly http = inject(HttpClient);

  readonly step = signal<DonationStep>(1);
  readonly offeringTypes = signal<OfferingType[]>([]);
  readonly offeringTypesState = signal<OfferingTypesState>('loading');
  readonly offeringTypeId = signal<number | null>(null);
  readonly amountInput = signal('');
  readonly paymentProvider = signal<PublicPaymentProvider | null>(null);
  readonly recapVisible = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly receipt = signal<DonationReceipt | null>(null);

  readonly amount = computed(() => parseAmountInput(this.amountInput()));
  readonly amountValid = computed(() => (this.amount() ?? 0) >= 1);
  readonly selectedOfferingType = computed(
    () => this.offeringTypes().find((type) => type.id === this.offeringTypeId()) ?? null,
  );
  readonly canContinue = computed(() => {
    switch (this.step()) {
      case 1:
        return this.offeringTypesState() === 'ready' && this.offeringTypeId() !== null;
      case 2:
        return this.amountValid();
      case 3:
        return this.paymentProvider() !== null;
    }
  });
  readonly progress = computed(() => Math.round((this.step() / STEPS.length) * 100));
  readonly payload = computed<PublicContributionPayload | null>(() => {
    const offeringTypeId = this.offeringTypeId();
    const paymentProvider = this.paymentProvider();
    const amount = this.amount();
    if (offeringTypeId === null || paymentProvider === null || amount === null || amount < 1) {
      return null;
    }
    return { offeringTypeId, amount: Number(amount.toFixed(2)), paymentProvider };
  });

  loadOfferingTypes(force = false): void {
    if (!force && this.offeringTypesState() === 'ready') {
      return;
    }
    this.offeringTypesState.set('loading');
    this.http
      .get<OfferingTypeView[]>(`${API_BASE_URL}/public/offering-types`)
      .pipe(
        map((views) => views.map(toOfferingType)),
        catchError(rethrow),
      )
      .subscribe({
        next: (types) => {
          this.offeringTypes.set(types);
          this.offeringTypesState.set('ready');
        },
        error: () => {
          this.offeringTypes.set([]);
          this.offeringTypesState.set('error');
        },
      });
  }

  selectOfferingType(id: number): void {
    this.offeringTypeId.set(id);
    this.recapVisible.set(false);
    this.errorMessage.set(null);
  }

  setAmountInput(raw: string): void {
    this.amountInput.set(sanitizeAmountInput(raw));
    this.recapVisible.set(false);
    this.errorMessage.set(null);
  }

  selectPaymentProvider(id: PublicPaymentProvider): void {
    this.paymentProvider.set(id);
    this.recapVisible.set(false);
    this.errorMessage.set(null);
  }

  next(): void {
    if (!this.canContinue()) {
      return;
    }
    const target = STEPS[STEPS.indexOf(this.step()) + 1];
    if (target) {
      this.step.set(target);
    }
  }

  previous(): void {
    this.recapVisible.set(false);
    this.step.set(STEPS[STEPS.indexOf(this.step()) - 1] ?? 1);
  }

  showRecap(): void {
    if (this.payload()) {
      this.recapVisible.set(true);
    }
  }

  hideRecap(): void {
    this.recapVisible.set(false);
  }

  submit(): Observable<DonationReceipt> {
    const payload = this.payload();
    if (!payload || this.submitting()) {
      return throwError(() => new Error('Don incomplet.'));
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    return this.http
      .post<PublicContributionCreatedView>(`${API_BASE_URL}/public/contributions`, payload)
      .pipe(
        switchMap((created) =>
          this.http.post<PublicContributionView>(
            `${API_BASE_URL}/public/contributions/${created.contributionId}/simulate-payment`,
            {},
          ),
        ),
        map(toDonationReceipt),
        tap((receipt) => this.receipt.set(receipt)),
        catchError((error: unknown) => {
          const message = donationErrorMessage(error);
          this.errorMessage.set(message);
          return throwError(() => new Error(message));
        }),
        finalize(() => this.submitting.set(false)),
      );
  }

  reset(): void {
    this.step.set(1);
    this.offeringTypeId.set(null);
    this.amountInput.set('');
    this.paymentProvider.set(null);
    this.recapVisible.set(false);
    this.submitting.set(false);
    this.errorMessage.set(null);
    this.receipt.set(null);
  }
}

function donationErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Serveur injoignable. Vérifiez que l’API est démarrée.';
    }
    const payload = error.error as ApiError | null;
    const detail = payload?.details ? Object.values(payload.details)[0] : undefined;
    if (detail) {
      return detail;
    }
    if (payload?.error) {
      return payload.error;
    }
  }
  return GENERIC_DONATION_ERROR;
}
