import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChurchLogoComponent } from '../../shared/components/church-logo/church-logo';

/** Page 404 : adresse inconnue (lien périmé, faute de frappe). */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ChurchLogoComponent],
  template: `
    <main class="nf">
      <app-church-logo [size]="56" />
      <p class="nf__code" aria-hidden="true">404</p>
      <h1 class="nf__title">Page introuvable</h1>
      <p class="nf__text">
        Cette page n’existe pas ou a été déplacée. Vérifiez l’adresse ou revenez à l’accueil.
      </p>
      <a class="nf__cta" [routerLink]="homeLink">Retour à l’accueil</a>
      <a class="nf__secondary" routerLink="/don">Faire un don</a>
    </main>
  `,
  styles: `
    .nf {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem 1.5rem;
      text-align: center;
      background: var(--color-creme);
    }
    .nf__code {
      margin: 0.5rem 0 0;
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1;
      color: var(--color-bordeaux);
    }
    .nf__title {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-bordeaux-deep);
    }
    .nf__text {
      max-width: 22rem;
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
    .nf__cta {
      margin-top: 0.75rem;
      padding: 0.875rem 1.75rem;
      font-weight: 700;
      color: var(--color-papier);
      background: var(--color-bordeaux);
      border-radius: var(--radius-pill);
      text-decoration: none;
    }
    .nf__secondary {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-bordeaux);
    }
    .nf__cta:focus-visible,
    .nf__secondary:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
    }
  `,
})
export class NotFoundPage {
  protected readonly homeLink = inject(AuthService).isAuthenticated() ? '/member/dashboard' : '/welcome';
}
