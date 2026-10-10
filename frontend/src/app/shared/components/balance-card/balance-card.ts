import { Component, input, signal } from '@angular/core';
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
      <div class="balance__amount-row">
        <p class="balance__amount" aria-live="polite">
          @if (hidden()) {
            <span aria-hidden="true"><span class="balance__mask">••••••</span> FCFA</span>
            <span class="visually-hidden">Montant masqué</span>
          } @else {
            {{ formatAmount() }}
          }
        </p>
        <button
          type="button"
          class="balance__eye"
          [attr.aria-pressed]="!hidden()"
          [attr.aria-label]="hidden() ? 'Afficher le montant' : 'Masquer le montant'"
          (click)="toggle()"
        >
          <app-icon [name]="hidden() ? 'eye' : 'eye-off'" [size]="20" />
        </button>
      </div>
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
    .balance__amount-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .balance__amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-bordeaux-deep);
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
    .balance__mask {
      letter-spacing: 0.08em;
    }
    .balance__eye {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 50%;
      background: var(--color-or-soft);
      color: var(--color-bordeaux);
      transition: background 0.2s;
    }
    .balance__eye:hover {
      background: var(--color-or-30);
    }
    .balance__eye:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
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

  /** Montant masqué par défaut (comme Wave) ; le choix est mémorisé sur l'appareil. */
  protected readonly hidden = signal(readHidden());

  protected toggle(): void {
    const next = !this.hidden();
    this.hidden.set(next);
    try {
      localStorage.setItem(HIDE_KEY, next ? '1' : '0');
    } catch {
      // stockage indisponible (navigation privée) : le choix vaut pour la page en cours
    }
  }

  protected formatAmount(): string {
    return formatFcfa(this.amount());
  }
}

const HIDE_KEY = 'moneglise_hide_amount';

function readHidden(): boolean {
  try {
    return localStorage.getItem(HIDE_KEY) !== '0';
  } catch {
    return true;
  }
}
