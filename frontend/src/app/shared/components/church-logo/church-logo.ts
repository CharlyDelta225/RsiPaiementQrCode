import { Component, input } from '@angular/core';

/**
 * Logo église (couleur configurable : blanc pour les fonds sombres,
 * bleu pour les fonds clairs).
 */
@Component({
  selector: 'app-church-logo',
  standalone: true,
  template: `
    <svg
      class="church-logo"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Mon Église"
    >
      <g [attr.fill]="color()">
        <rect x="22.5" y="1" width="3" height="16" rx="1.5" />
        <rect x="15" y="5" width="18" height="3" rx="1.5" />
        <path d="M24 12 L42 24 H6 Z" />
        <rect x="8" y="24" width="32" height="18" rx="2.5" />
        <path d="M19 42 V31.5 A5 5 0 0 1 29 31.5 V42 Z" />
        <rect x="12" y="28" width="6" height="9" rx="1.2" />
        <rect x="30" y="28" width="6" height="9" rx="1.2" />
      </g>
    </svg>
  `,
  styles: `
    .church-logo {
      display: block;
    }
  `,
})
export class ChurchLogoComponent {
  readonly size = input(45);
  readonly color = input('#1677E8');
}