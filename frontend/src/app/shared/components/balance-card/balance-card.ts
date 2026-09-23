import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../app-icon/app-icon';
import { formatFcfa } from '../../../core/utils/format';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  template: `
    <div class="balance">
      <div class="balance__top">
        <span class="balance__label">{{ label() }}</span>
        <app-icon name="chevron-right" [size]="18" />
      </div>
      <p class="balance__amount">{{ formatAmount() }}</p>
      <a class="balance__link" routerLink="{{ linkRoute() }}">
        Voir mon historique
        <app-icon name="chevron-right" [size]="16" />
      </a>
    </div>
  `,
  styles: `
    .balance {
      background: var(--color-white);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      padding: 1.25rem 1.375rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .balance__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--color-primary);
    }
    .balance__label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .balance__amount {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-dark-blue);
      margin: 0;
    }
    .balance__link {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 0.25rem;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-primary);
      text-decoration: none;
    }
  `,
})
export class BalanceCardComponent {
  readonly label = input('Solde de mon compte');
  readonly amount = input(0);
  readonly linkRoute = input('/member/contributions');

  protected formatAmount(): string {
    return formatFcfa(this.amount());
  }
}