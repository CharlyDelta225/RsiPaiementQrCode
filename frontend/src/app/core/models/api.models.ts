import { Contribution, ContributionStatus, DonationReceipt } from './contribution.model';
import { OfferingType } from './offering-type.model';
import { Temple } from './temple.model';
import { User, UserRole } from './user.model';

export interface ApiError {
  status: number;
  error: string;
  details: Record<string, string> | null;
}

export interface UserView {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  templeId: number | null;
  templeName: string | null;
  active: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserView;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  templeId: number;
}

export interface TempleView {
  id: number;
  name: string;
  city: string;
  address: string;
  churchId: number;
  churchName: string;
  active: boolean;
}

export interface OfferingTypeView {
  id: number;
  code: string;
  label: string;
  description: string | null;
  blessingText: string | null;
  blessingRef: string | null;
}

export interface ContributionView {
  id: number;
  reference: string;
  amount: number;
  currencyCode: string;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
  status: ContributionStatus;
  templeId: number | null;
  templeName: string | null;
  offeringTypeId: number;
  offeringTypeCode: string;
  offeringTypeLabel: string;
  memberId: number | null;
  memberFullName: string | null;
  donorName: string | null;
  donorPhone: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PublicContributionCreatedView {
  contributionId: number;
  reference: string;
}

export interface PublicReceiptView {
  receiptNumber: string;
  verificationToken: string;
  issuedAt: string;
}

export interface PublicContributionView {
  contributionId: number;
  reference: string;
  amount: number;
  currencyCode: string;
  paymentMethod: string;
  paymentProvider: string;
  paymentSimulated: boolean;
  status: ContributionStatus;
  offeringTypeId: number;
  offeringTypeCode: string;
  offeringTypeLabel: string;
  blessingText: string | null;
  blessingRef: string | null;
  paidAt: string | null;
  receipt: PublicReceiptView | null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function toUser(view: UserView): User {
  return {
    id: view.id,
    fullName: `${view.firstName} ${view.lastName}`.trim(),
    email: view.email,
    phone: view.phone,
    roles: [view.role],
  };
}

export function toTemple(view: TempleView): Temple {
  return {
    id: view.id,
    name: view.name,
    city: view.city,
    address: view.address,
    churchName: view.churchName,
    active: view.active,
  };
}

export function toOfferingType(view: OfferingTypeView): OfferingType {
  return {
    id: view.id,
    code: view.code,
    label: view.label,
    description: view.description ?? null,
    blessingText: view.blessingText ?? null,
    blessingRef: view.blessingRef ?? null,
  };
}

export function toContribution(view: ContributionView): Contribution {
  return {
    id: view.id,
    type: view.offeringTypeLabel,
    amount: view.amount,
    date: DATE_FORMATTER.format(new Date(view.paidAt ?? view.createdAt)),
    temple: view.templeName ?? 'Temple inconnu',
    status: view.status,
  };
}

export function toDonationReceipt(view: PublicContributionView): DonationReceipt {
  return {
    contributionId: view.contributionId,
    reference: view.reference,
    amount: view.amount,
    currencyCode: view.currencyCode,
    status: view.status,
    offeringTypeLabel: view.offeringTypeLabel,
    paymentProvider: view.paymentProvider,
    paymentSimulated: view.paymentSimulated,
    blessingText: view.blessingText,
    blessingRef: view.blessingRef,
    paidAt: view.paidAt,
    receiptNumber: view.receipt?.receiptNumber ?? null,
  };
}
