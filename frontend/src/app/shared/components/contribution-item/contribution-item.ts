import { Component, Input } from '@angular/core';
import { Contribution, ContributionStatus } from '../../../core/models/contribution.model';
import { AppIconComponent } from '../app-icon/app-icon';
import { IconName } from '../app-icon/icons';
import { formatFcfa } from '../../../core/utils/format';

@Component({
  selector: 'app-contribution-item',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="item">
      <div class="item__icon" [class]="'item__icon--' + status()">
        <app-icon [name]="icon()" [size]="20" />
      </div>
      <div class="item__body">
        <p class="item__title">
          {{ title() }} - {{ formattedAmount() }}
        </p>
        <p class="item__meta">{{ date() }} · {{ temple() }}</p>
      </div>
      <span class="item__badge" [class]="'item__badge--' + status()">
        {{ statusLabel() }}
      </span>
    </div>
  `,
  styles: `
    .item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--color-white);
      border: 1px solid #e5edf5;
      border-radius: 14px;
      padding: 0.875rem 1rem;
    }
    .item__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .item__icon--PAID { background: var(--color-success-soft); color: var(--color-success); }
    .item__icon--PENDING { background: var(--color-orange-soft); color: var(--color-orange); }
    .item__icon--FAILED { background: var(--color-red-soft); color: var(--color-red); }
    .item__body {
      flex: 1;
      min-width: 0;
    }
    .item__title {
      font-weight: 700;
      font-size: var(--text-base);
      color: var(--color-text);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item__meta {
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
      margin: 0.125rem 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item__badge {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-pill);
      flex-shrink: 0;
      white-space: nowrap;
    }
    .item__badge--PAID { background: var(--color-success-soft); color: var(--color-success); }
    .item__badge--PENDING { background: var(--color-orange-soft); color: var(--color-orange); }
    .item__badge--FAILED { background: var(--color-red-soft); color: var(--color-red); }
  `,
})
export class ContributionItemComponent {
  @Input() contribution!: Contribution;

  protected status(): ContributionStatus {
    return this.contribution.status;
  }
  protected title(): string {
    return this.contribution.type;
  }
  protected formattedAmount(): string {
    return formatFcfa(this.contribution.amount);
  }
  protected date(): string {
    return this.contribution.date;
  }
  protected temple(): string {
    return this.contribution.temple;
  }
  protected icon(): IconName {
    return this.contribution.type === 'Dîme' ? 'temple' : 'heart';
  }
  protected statusLabel(): string {
    switch (this.contribution.status) {
      case 'PAID':
        return 'Payé';
      case 'PENDING':
        return 'En attente';
      default:
        return 'Échec';
    }
  }
}