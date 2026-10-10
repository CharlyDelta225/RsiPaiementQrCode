import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contribution } from '../../../../core/models/contribution.model';
import {
  ContributionService,
  ContributionsSummary,
} from '../../../../core/services/contribution.service';
import { formatFcfa } from '../../../../core/utils/format';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { ContributionItemComponent } from '../../../../shared/components/contribution-item/contribution-item';

interface MonthGroup {
  key: string;
  label: string;
  total: number;
  items: Contribution[];
}

const ALL_TYPES = 'Tous';
const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, AppIconComponent, ContributionItemComponent],
  templateUrl: './history.page.html',
  styleUrl: './history.page.scss',
})
export class HistoryPage {
  private readonly contributionService = inject(ContributionService);

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly contributions = signal<Contribution[]>([]);
  protected readonly summary = signal<ContributionsSummary | null>(null);
  protected readonly selectedType = signal(ALL_TYPES);

  protected readonly types = computed(() => [
    ALL_TYPES,
    ...new Set(this.contributions().map((item) => item.type)),
  ]);

  protected readonly groups = computed<MonthGroup[]>(() => {
    const type = this.selectedType();
    const filtered = this.contributions().filter(
      (item) => type === ALL_TYPES || item.type === type,
    );
    const groups = new Map<string, MonthGroup>();
    for (const item of filtered) {
      const date = new Date(item.isoDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      let group = groups.get(key);
      if (!group) {
        const label = MONTH_FORMATTER.format(date);
        group = { key, label: label.charAt(0).toUpperCase() + label.slice(1), total: 0, items: [] };
        groups.set(key, group);
      }
      group.items.push(item);
      if (item.status === 'PAID') {
        group.total += item.amount;
      }
    }
    return [...groups.values()];
  });

  protected readonly formatFcfa = formatFcfa;
  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.contributionService.getMyContributionsWithSummary().subscribe({
      next: ({ contributions, summary }) => {
        this.contributions.set(contributions);
        this.summary.set(summary);
        this.state.set('ready');
      },
      error: () => this.state.set('error'),
    });
  }

  protected selectType(type: string): void {
    this.selectedType.set(type);
  }
}
