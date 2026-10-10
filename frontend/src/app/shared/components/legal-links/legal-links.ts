import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pied de page légal : confidentialité et conditions d'utilisation. */
@Component({
  selector: 'app-legal-links',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="legal" [class.legal--light]="tone() === 'light'" aria-label="Informations légales">
      <a routerLink="/confidentialite">Confidentialité</a>
      <span aria-hidden="true">·</span>
      <a routerLink="/conditions">Conditions d’utilisation</a>
    </nav>
  `,
  styles: `
    .legal {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
    }
    .legal a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .legal a:hover {
      color: var(--color-bordeaux);
    }
    .legal--light {
      color: var(--color-blanc-85);
    }
    .legal--light a:hover {
      color: var(--color-papier);
    }
    .legal a:focus-visible {
      outline: 2px solid var(--color-or-60);
      outline-offset: 2px;
      border-radius: 2px;
    }
  `,
})
export class LegalLinksComponent {
  /** `light` sur fond sombre (photo), `dark` sur fond clair. */
  readonly tone = input<'light' | 'dark'>('dark');
}
