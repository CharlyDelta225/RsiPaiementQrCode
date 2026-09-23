export type ContributionStatus = 'PAID' | 'PENDING' | 'FAILED';

export interface Contribution {
  id: number;
  type: string;
  amount: number;
  date: string;
  temple: string;
  status: ContributionStatus;
}