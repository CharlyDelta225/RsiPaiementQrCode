import { Component, input } from '@angular/core';
import { PublicPaymentProvider } from '../../../../core/models/payment-provider.model';

/**
 * Logo rond de l'opérateur de paiement (icône officielle de son application).
 * Sans `src`, pastille générique (ex. carte bancaire). Décoratif : le nom est écrit à côté.
 */
@Component({
  selector: 'app-provider-logo',
  standalone: true,
  host: {
    '[class.is-selected]': 'selected()',
  },
  template: `
    @if (src(); as url) {
      <span class="logo" [class]="'logo logo--' + provider()" aria-hidden="true">
        <img [src]="url" alt="" width="48" height="48" loading="lazy" decoding="async" />
      </span>
    } @else {
      <span class="logo logo--generic" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8" />
          <rect x="2.5" y="8.5" width="19" height="2.6" fill="currentColor" />
          <rect x="5.5" y="14" width="5" height="1.8" rx="0.9" fill="currentColor" />
        </svg>
      </span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      overflow: hidden;
      border-radius: 50%;
      background: #fff;
      box-shadow:
        0 0 0 2px var(--color-papier),
        0 0 0 3px var(--color-bordure),
        0 4px 10px var(--color-bordeaux-deep-12);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    /* Moov Money : losange sur fond bleu Moov, comme dans l'application. */
    .logo--MOOV_MONEY {
      background: #0f5aa8;
    }
    .logo--MOOV_MONEY img {
      object-fit: contain;
      padding: 3px;
    }
    .logo--generic {
      background: var(--color-creme);
      color: var(--color-bordeaux);
    }
    :host(.is-selected) .logo {
      transform: scale(1.06);
      box-shadow:
        0 0 0 2px var(--color-papier),
        0 0 0 4px var(--color-or),
        0 6px 14px var(--color-bordeaux-deep-15);
    }
    @media (prefers-reduced-motion: reduce) {
      .logo {
        transition: none;
      }
      :host(.is-selected) .logo {
        transform: none;
      }
    }
  `,
})
export class ProviderLogoComponent {
  readonly provider = input.required<PublicPaymentProvider>();
  /** Icône officielle (public/images/providers/…) ; sinon pastille générique. */
  readonly src = input<string | undefined>(undefined);
  readonly selected = input(false);
}
