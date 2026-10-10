import { Contribution } from './contribution.model';

export interface DashboardData {
  /** Total des contributions payées depuis le 1er janvier. */
  yearTotal: number;
  recentContributions: Contribution[];
}
