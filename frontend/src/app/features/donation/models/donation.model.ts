import { PublicPaymentProvider } from '../../../core/models/payment-provider.model';

export type DonationStep = 1 | 2 | 3;

export interface PaymentProviderOption {
  id: PublicPaymentProvider;
  label: string;
  hint: string;
}

export const PAYMENT_PROVIDERS: readonly PaymentProviderOption[] = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', hint: 'Orange' },
  { id: 'MTN_MOBILE_MONEY', label: 'MTN Mobile Money', hint: 'MTN' },
  { id: 'MOOV_MONEY', label: 'Moov Money', hint: 'Moov' },
  { id: 'WAVE', label: 'Wave', hint: 'Wave' },
  { id: 'CARD', label: 'Carte bancaire', hint: 'Visa, Mastercard' },
];

export const QUICK_AMOUNTS: readonly number[] = [1000, 2000, 5000, 10000];

export interface PublicContributionPayload {
  offeringTypeId: number;
  amount: number;
  paymentProvider: PublicPaymentProvider;
}

const MAX_AMOUNT_DIGITS = 9;
const MAX_AMOUNT_DECIMALS = 2;

export function providerLabel(id: string): string {
  return PAYMENT_PROVIDERS.find((option) => option.id === id)?.label ?? id;
}

export function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex === -1) {
    return stripLeadingZeros(cleaned).slice(0, MAX_AMOUNT_DIGITS);
  }
  const whole = stripLeadingZeros(cleaned.slice(0, dotIndex)).slice(0, MAX_AMOUNT_DIGITS);
  const decimals = cleaned
    .slice(dotIndex + 1)
    .replace(/\./g, '')
    .slice(0, MAX_AMOUNT_DECIMALS);
  return `${whole || '0'}.${decimals}`;
}

export function parseAmountInput(raw: string): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function stripLeadingZeros(value: string): string {
  return value.replace(/^0+(?=\d)/, '');
}
