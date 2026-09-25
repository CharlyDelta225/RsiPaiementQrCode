import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../../core/config/api.config';
import { parseAmountInput, sanitizeAmountInput } from '../models/donation.model';
import { DonationFlowService } from './donation-flow.service';

const OFFERING_TYPES_URL = `${API_BASE_URL}/public/offering-types`;
const CONTRIBUTIONS_URL = `${API_BASE_URL}/public/contributions`;
const SIMULATE_URL = `${CONTRIBUTIONS_URL}/7/simulate-payment`;

const RECEIPT_VIEW = {
  contributionId: 7,
  reference: 'CONT-20260925-0007',
  amount: 5000,
  currencyCode: 'XOF',
  paymentMethod: 'MOBILE_MONEY',
  paymentProvider: 'MOOV_MONEY',
  paymentSimulated: true,
  status: 'PAID',
  offeringTypeId: 3,
  offeringTypeCode: 'DON',
  offeringTypeLabel: 'Don',
  blessingText: 'Que chacun donne comme il l’a décidé en son cœur.',
  blessingRef: '2 Corinthiens 9:7',
  paidAt: '2026-09-25T10:15:30',
  receipt: { receiptNumber: 'REC-20260925-0007', verificationToken: 'vrf-1', issuedAt: '2026-09-25T10:15:30' },
};

describe('DonationFlowService', () => {
  let service: DonationFlowService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DonationFlowService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('charge les types actifs et passe en ready', () => {
    service.loadOfferingTypes();
    expect(service.offeringTypesState()).toBe('loading');

    const request = http.expectOne(OFFERING_TYPES_URL);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        code: 'DIME',
        label: 'Dîme',
        description: 'La dîme : 10% des revenus',
        blessingText: 'Apportez toutes les dîmes…',
        blessingRef: 'Malachie 3:10',
      },
    ]);

    expect(service.offeringTypesState()).toBe('ready');
    expect(service.offeringTypes().length).toBe(1);
    expect(service.offeringTypes()[0].blessingRef).toBe('Malachie 3:10');
  });

  it('bascule en error et propose un nouvel essai', () => {
    service.loadOfferingTypes();
    http.expectOne(OFFERING_TYPES_URL).flush('oups', { status: 500, statusText: 'Server Error' });
    expect(service.offeringTypesState()).toBe('error');

    service.loadOfferingTypes(true);
    http.expectOne(OFFERING_TYPES_URL).flush([]);
    expect(service.offeringTypesState()).toBe('ready');
  });

  it('bloque chaque étape tant que la saisie est invalide', () => {
    service.loadOfferingTypes();
    http.expectOne(OFFERING_TYPES_URL).flush([]);

    expect(service.canContinue()).toBeFalse();
    service.next();
    expect(service.step()).toBe(1);

    service.selectOfferingType(2);
    expect(service.canContinue()).toBeTrue();
    service.next();
    expect(service.step()).toBe(2);

    service.setAmountInput('0');
    expect(service.amountValid()).toBeFalse();
    expect(service.canContinue()).toBeFalse();
    service.next();
    expect(service.step()).toBe(2);

    service.setAmountInput('5000');
    expect(service.canContinue()).toBeTrue();
    service.next();
    expect(service.step()).toBe(3);

    expect(service.canContinue()).toBeFalse();
    service.selectPaymentProvider('MOOV_MONEY');
    expect(service.canContinue()).toBeTrue();
  });

  it('compose le payload public attendu', () => {
    service.loadOfferingTypes();
    http.expectOne(OFFERING_TYPES_URL).flush([
      { id: 3, code: 'DON', label: 'Don', description: null, blessingText: null, blessingRef: null },
    ]);

    service.selectOfferingType(3);
    service.setAmountInput('5000');
    service.selectPaymentProvider('MOOV_MONEY');
    service.showRecap();

    expect(service.payload()).toEqual({ offeringTypeId: 3, amount: 5000, paymentProvider: 'MOOV_MONEY' });
    expect(JSON.stringify(service.payload())).toBe(
      '{"offeringTypeId":3,"amount":5000,"paymentProvider":"MOOV_MONEY"}',
    );
    expect(service.recapVisible()).toBeTrue();
  });

  it('revient à l’étape précédente et se réinitialise', () => {
    service.loadOfferingTypes();
    http.expectOne(OFFERING_TYPES_URL).flush([]);

    service.selectOfferingType(1);
    service.next();
    service.setAmountInput('2000');
    service.next();
    service.selectPaymentProvider('WAVE');

    service.previous();
    expect(service.step()).toBe(2);
    service.previous();
    expect(service.step()).toBe(1);
    service.previous();
    expect(service.step()).toBe(1);
    expect(service.amountInput()).toBe('2000');

    service.reset();
    expect(service.step()).toBe(1);
    expect(service.offeringTypeId()).toBeNull();
    expect(service.amountInput()).toBe('');
    expect(service.paymentProvider()).toBeNull();
  });

  it('ne construit aucun payload incomplet', () => {
    service.selectOfferingType(1);
    expect(service.payload()).toBeNull();

    service.setAmountInput('1000');
    expect(service.payload()).toBeNull();

    service.selectPaymentProvider('CARD');
    expect(service.payload()).toEqual({ offeringTypeId: 1, amount: 1000, paymentProvider: 'CARD' });
  });

  it('nettoie la saisie du montant', () => {
    expect(sanitizeAmountInput('abc5000')).toBe('5000');
    expect(sanitizeAmountInput('05000')).toBe('5000');
    expect(sanitizeAmountInput('5000.567')).toBe('5000.56');
    expect(sanitizeAmountInput('12.')).toBe('12.');
    expect(sanitizeAmountInput('.')).toBe('0.');
    expect(sanitizeAmountInput('1234567890')).toBe('123456789');
    expect(sanitizeAmountInput('')).toBe('');

    expect(parseAmountInput('0')).toBe(0);
    expect(parseAmountInput('5000')).toBe(5000);
    expect(parseAmountInput('12.')).toBe(12);
    expect(parseAmountInput('')).toBeNull();
  });

  it('enchaîne création puis simulation et expose le reçu', () => {
    prepareCompleteDonation();

    let receipt: unknown = null;
    service.submit().subscribe((result) => (receipt = result));

    expect(service.submitting()).toBeTrue();
    const create = http.expectOne(CONTRIBUTIONS_URL);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({
      offeringTypeId: 3,
      amount: 5000,
      paymentProvider: 'MOOV_MONEY',
    });
    create.flush({ contributionId: 7, reference: 'CONT-20260925-0007' }, { status: 201, statusText: 'Created' });

    const simulate = http.expectOne(SIMULATE_URL);
    expect(simulate.request.method).toBe('POST');
    simulate.flush(RECEIPT_VIEW, { status: 200, statusText: 'OK' });

    expect(service.submitting()).toBeFalse();
    expect(service.errorMessage()).toBeNull();
    expect(receipt).toEqual(service.receipt());
    expect(service.receipt()?.reference).toBe('CONT-20260925-0007');
    expect(service.receipt()?.receiptNumber).toBe('REC-20260925-0007');
    expect(service.receipt()?.blessingText).toBe('Que chacun donne comme il l’a décidé en son cœur.');
    expect(service.receipt()?.blessingRef).toBe('2 Corinthiens 9:7');
    expect(service.receipt()?.paymentProvider).toBe('MOOV_MONEY');
  });

  it('affiche le message du backend et permet un nouvel essai après un 400', () => {
    prepareCompleteDonation();

    let failed = false;
    service.submit().subscribe({ error: () => (failed = true) });
    http.expectOne(CONTRIBUTIONS_URL).flush(
      {
        status: 400,
        error: 'Le montant doit être supérieur à 0',
        details: { amount: 'Le montant doit être supérieur à 0' },
      },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(failed).toBeTrue();
    expect(service.submitting()).toBeFalse();
    expect(service.errorMessage()).toBe('Le montant doit être supérieur à 0');
    expect(service.receipt()).toBeNull();

    service.submit().subscribe();
    const retry = http.expectOne(CONTRIBUTIONS_URL);
    expect(retry.request.body).toEqual({
      offeringTypeId: 3,
      amount: 5000,
      paymentProvider: 'MOOV_MONEY',
    });
    retry.flush({ contributionId: 8, reference: 'CONT-20260925-0008' }, { status: 201, statusText: 'Created' });
    http.expectOne(`${CONTRIBUTIONS_URL}/8/simulate-payment`).flush(RECEIPT_VIEW);

    expect(service.errorMessage()).toBeNull();
    expect(service.receipt()?.reference).toBe('CONT-20260925-0007');
  });

  it('signale un type d’offrande invalide sans créer de reçu', () => {
    prepareCompleteDonation();

    service.submit().subscribe({ error: () => undefined });
    http.expectOne(CONTRIBUTIONS_URL).flush(
      { status: 404, error: 'Type d’offrande introuvable', details: null },
      { status: 404, statusText: 'Not Found' },
    );

    expect(service.errorMessage()).toBe('Type d’offrande introuvable');
    expect(service.receipt()).toBeNull();
    expect(service.submitting()).toBeFalse();
  });

  it('ignore un second envoi pendant le traitement et vide le reçu au reset', () => {
    prepareCompleteDonation();

    service.submit().subscribe();
    http.expectOne(CONTRIBUTIONS_URL).flush({ contributionId: 7, reference: 'CONT-7' }, { status: 201, statusText: 'Created' });

    let duplicateRejected = false;
    service.submit().subscribe({ error: () => (duplicateRejected = true) });
    expect(duplicateRejected).toBeTrue();
    http.expectNone(CONTRIBUTIONS_URL);

    http.expectOne(SIMULATE_URL).flush(RECEIPT_VIEW);
    expect(service.receipt()).not.toBeNull();

    service.reset();
    expect(service.receipt()).toBeNull();
    expect(service.errorMessage()).toBeNull();
    expect(service.submitting()).toBeFalse();
  });

  function prepareCompleteDonation(): void {
    service.loadOfferingTypes();
    http.expectOne(OFFERING_TYPES_URL).flush([
      { id: 3, code: 'DON', label: 'Don', description: null, blessingText: null, blessingRef: null },
    ]);
    service.selectOfferingType(3);
    service.setAmountInput('5000');
    service.selectPaymentProvider('MOOV_MONEY');
    service.showRecap();
  }
});
