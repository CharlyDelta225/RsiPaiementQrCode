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
      background: linear-gradient(
        160deg,
        var(--color-papier) 0%,
        var(--color-creme) 100%
      );
      border: 1px solid var(--color-or-30);
      border-radius: 16px;
      box-shadow: 0 6px 20px var(--color-bordeaux-deep-08);
      padding: 1.25rem 1.375rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .balance__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--color-bordeaux);
    }
    .balance__label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-bordeaux-light);
    }
    .balance__amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-bordeaux-deep);
      margin: 0;
    }
    .balance__link {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 0.25rem;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-bordeaux);
      text-decoration: none;
    }
    .balance__link app-icon {
      color: var(--color-or);
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