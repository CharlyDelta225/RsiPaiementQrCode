import { Component, inject } from '@angular/core';
import { AppInstallHintService } from '../../../core/services/app-install-hint.service';
import { AppIconComponent } from '../app-icon/app-icon';
import { AppInstallDialogComponent } from '../app-install-dialog/app-install-dialog';

/**
 * Carte permanente « Installer l'application » tant qu'on utilise la version web.
 * Le bouton ouvre la fenêtre adaptée à l'appareil (QR code, installation, marche à suivre).
 */
@Component({
  selector: 'app-install-banner',
  standalone: true,
  imports: [AppIconComponent, AppInstallDialogComponent],
  template: `
    @if (visible()) {
      <section class="banner" aria-labelledby="install-banner-title">
        <span class="banner__icon" aria-hidden="true">
          <app-icon name="download" [size]="22" />
        </span>
        <div class="banner__text">
          <h2 class="banner__title" id="install-banner-title">Installez l’application</h2>
          <p class="banner__hint">Ajoutez-la à votre écran d’accueil pour donner en un geste.</p>
        </div>
        <button type="button" class="banner__cta" aria-haspopup="dialog" (click)="dialog.open()">
          Installer
        </button>
        <button
          type="button"
          class="banner__close"
          aria-label="Masquer pour cette visite"
          (click)="hide()"
        >
          <span aria-hidden="true">×</span>
        </button>
      </section>
    }
    <app-install-dialog #dialog />
  `,
  styles: `
    .banner {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 2.25rem 0.875rem 0.875rem;
      background: var(--color-papier);
      color: var(--color-text);
      border: 1px dashed var(--color-or);
      border-radius: var(--radius-md);
    }
    .banner__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--color-or-soft);
      color: var(--color-bordeaux);
    }
    .banner__text {
      flex: 1;
      min-width: 0;
    }
    .banner__title {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-bordeaux-deep);
    }
    .banner__hint {
      margin: 0.125rem 0 0;
      font-size: var(--text-xs);
      line-height: 1.35;
      color: var(--color-text-secondary);
    }
    .banner__cta {
      flex-shrink: 0;
      padding: 0.5rem 0.875rem;
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-bordeaux);
      background: transparent;
      border: 1px solid var(--color-bordeaux);
      border-radius: var(--radius-pill);
    }
    .banner__cta:hover {
      background: var(--color-creme);
    }
    .banner__close {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      width: 30px;
      height: 30px;
      font-size: 1.25rem;
      line-height: 1;
      color: var(--color-text-secondary);
      background: none;
      border: 0;
      border-radius: 50%;
    }
    .banner__close:hover {
      background: var(--color-creme);
    }
    .banner__cta:focus-visible,
    .banner__close:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
    }
  `,
})
export class AppInstallBannerComponent {
  private readonly hint = inject(AppInstallHintService);

  protected readonly visible = this.hint.bannerVisible;

  protected hide(): void {
    this.hint.hideBannerForSession();
  }
}
