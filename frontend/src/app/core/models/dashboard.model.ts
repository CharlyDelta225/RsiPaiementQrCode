import { Contribution } from './contribution.model';

export interface DashboardData {
  balance: number;
  recentContributions: Contribution[];
}