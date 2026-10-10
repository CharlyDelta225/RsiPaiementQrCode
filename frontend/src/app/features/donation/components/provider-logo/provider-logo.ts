import { Component, input } from '@angular/core';
import { PublicPaymentProvider } from '../../../../core/models/payment-provider.model';

/**
 * Pastille de l'opérateur de paiement (couleurs de la marque + nom).
 * Si `src` est fourni (logo officiel fourni par l'agrégateur, ex. /images/providers/wave.svg),
 * l'image remplace la pastille. Décoratif : le nom est déjà écrit à côté.
 */
@Component({
  selector: 'app-provider-logo',
  standalone: true,
  template: `
    @if (src(); as url) {
      <img class="logo logo--img" [src]="url" alt="" width="44" height="44" />
    } @else {
      @switch (provider()) {
        @case ('ORANGE_MONEY') {
          <span class="logo logo--orange" aria-hidden="true"><span>orange</span></span>
        }
        @case ('MTN_MOBILE_MONEY') {
          <span class="logo logo--mtn" aria-hidden="true"><span>MTN</span></span>
        }
        @case ('MOOV_MONEY') {
          <span class="logo logo--moov" aria-hidden="true"><span>moov</span></span>
        }
        @case ('WAVE') {
          <span class="logo logo--wave" aria-hidden="true"><span>wave</span></span>
        }
        @default {
          <span class="logo logo--card" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8" />
              <rect x="2.5" y="8.5" width="19" height="2.6" fill="currentColor" />
              <rect x="5.5" y="14" width="5" height="1.8" rx="0.9" fill="currentColor" />
            </svg>
          </span>
        }
      }
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
      width: 44px;
      height: 44px;
      border-radius: 12px;
      font-family: var(--font-sans);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1;
      user-select: none;
    }
    .logo--img {
      object-fit: contain;
      background: #fff;
      border: 1px solid var(--color-bordure);
    }
    .logo--orange {
      align-items: flex-end;
      justify-content: flex-start;
      padding: 0 0 6px 5px;
      background: #ff7900;
      color: #fff;
      font-size: 11px;
      border-radius: 4px;
    }
    .logo--mtn {
      background: #ffcb05;
      color: #000;
      font-size: 13px;
    }
    .logo--mtn span {
      padding: 4px 5px;
      border: 2px solid #000;
      border-radius: 50%;
    }
    .logo--moov {
      background: #0058a3;
      color: #fff;
      font-size: 12px;
      box-shadow: inset 0 -5px 0 #f39200;
    }
    .logo--wave {
      background: #1dc4ff;
      color: #0b1f3a;
      font-size: 13px;
    }
    .logo--card {
      background: var(--color-creme);
      color: var(--color-bordeaux);
      border: 1px solid var(--color-bordure);
    }
  `,
})
export class ProviderLogoComponent {
  readonly provider = input.required<PublicPaymentProvider>();
  /** Logo officiel optionnel (sinon pastille aux couleurs de l'opérateur). */
  readonly src = input<string | undefined>(undefined);
}
