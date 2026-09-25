export type ContributionStatus = 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';

export interface Contribution {
  id: number;
  type: string;
  amount: number;
  date: string;
  temple: string;
  status: ContributionStatus;
}

export interface DonationReceipt {
  contributionId: number;
  reference: string;
  amount: number;
  currencyCode: string;
  status: ContributionStatus;
  offeringTypeLabel: string;
  paymentProvider: string;
  paymentSimulated: boolean;
  blessingText: string | null;
  blessingRef: string | null;
  paidAt: string | null;
  receiptNumber: string | null;
}