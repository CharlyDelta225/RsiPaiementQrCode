import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/api.config';
import { AppInstallHintService, InstallContext } from '../../../core/services/app-install-hint.service';
import { InstallPromptService } from '../../../core/services/install-prompt.service';
import { AppIconComponent } from '../app-icon/app-icon';

/**
 * Invitation à installer l'application sur mobile, affichée après la connexion sur le web :
 * - ordinateur : QR code à scanner avec le téléphone ;
 * - Android / Chrome : bouton d'installation natif (sinon marche à suivre) ;
 * - iPhone / iPad : marche à suivre « Partager → Sur l'écran d'accueil ».
 */
@Component({
  selector: 'app-install-dialog',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <dialog
      #dialog
      class="install"
      aria-labelledby="install-title"
      (click)="onBackdropClick($event)"
    >
      <div class="install__panel">
        <span class="install__icon" aria-hidden="true">
          <app-icon name="download" [size]="24" />
        </span>
        <h2 class="install__title" id="install-title">Installez l’application sur votre mobile</h2>

        @switch (context()) {
          @case ('desktop') {
            <p class="install__text">
              Scannez ce QR code avec l’appareil photo de votre téléphone pour ouvrir
              l’application, puis ajoutez-la à votre écran d’accueil.
            </p>
            <img
              class="install__qr"
              [src]="qrUrl"
              width="200"
              height="200"
              alt="QR code pour ouvrir l’application sur votre téléphone"
            />
          }
          @case ('ios') {
            <p class="install__text">Donnez en un geste depuis votre écran d’accueil :</p>
            <ol class="install__steps">
              <li>
                Dans Safari, touchez <strong>•••</strong> (en bas à droite), puis
                <strong>Partager</strong>. Sur les anciens iPhone : l’icône Partager
                <span aria-hidden="true">⬆︎</span> directement.
              </li>
              <li>
                Faites défiler et choisissez <strong>Sur l’écran d’accueil</strong>
                (ou <strong>Ajouter à l’écran d’accueil</strong>).
              </li>
              <li>Validez avec <strong>Ajouter</strong>.</li>
            </ol>
            <p class="install__hint">
              L’option n’apparaît pas ? Ouvrez ce lien dans <strong>Safari</strong>, hors navigation
              privée.
            </p>
          }
          @default {
            @if (canPrompt()) {
              <p class="install__text">
                Ajoutez l’application à votre écran d’accueil pour donner en un geste, même avec
                une connexion faible.
              </p>
            } @else {
              <p class="install__text">Donnez en un geste depuis votre écran d’accueil :</p>
              <ol class="install__steps">
                <li>Ouvrez le menu <strong>⋮</strong> de votre navigateur.</li>
                <li>Choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.</li>
              </ol>
            }
          }
        }

        <div class="install__actions">
          @if (context() === 'mobile' && canPrompt()) {
            <button type="button" class="install__btn install__btn--primary" (click)="install()">
              Installer
            </button>
          }
          <button type="button" class="install__btn install__btn--secondary" (click)="close()" autofocus>
            {{ context() === 'mobile' && canPrompt() ? 'Plus tard' : 'J’ai compris' }}
          </button>
          <button type="button" class="install__never" (click)="neverAgain()">
            Ne plus me le proposer
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: `
    .install {
      width: min(400px, calc(100vw - 2rem));
      max-height: calc(100dvh - 2rem);
      padding: 0;
      border: 0;
      border-radius: var(--radius-lg);
      background: var(--color-papier);
      color: var(--color-text);
      box-shadow: 0 24px 60px var(--color-bordeaux-deep-25);
    }
    .install::backdrop {
      background: var(--color-bordeaux-deep-75);
    }
    .install[open] {
      animation: install-in 0.2s ease-out;
    }
    .install__panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1.25rem 1.25rem;
      text-align: center;
    }
    .install__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--color-or-soft);
      color: var(--color-bordeaux);
    }
    .install__title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 700;
      line-height: 1.3;
      color: var(--color-bordeaux-deep);
    }
    .install__text {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
    .install__qr {
      width: 200px;
      height: 200px;
      padding: 0.5rem;
      background: #fff;
      border: 1px solid var(--color-or-35);
      border-radius: var(--radius-md);
    }
    .install__steps {
      margin: 0;
      padding: 0.875rem 1rem 0.875rem 2.25rem;
      width: 100%;
      font-size: var(--text-sm);
      text-align: left;
      background: var(--color-or-soft);
      border-radius: var(--radius-sm);
    }
    .install__steps li + li {
      margin-top: 0.375rem;
    }
    .install__steps strong {
      color: var(--color-bordeaux);
    }
    .install__hint {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
    }
    .install__actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      margin-top: 0.5rem;
    }
    .install__btn {
      height: 46px;
      border-radius: var(--radius-pill);
      font-weight: 700;
      font-size: var(--text-sm);
      border: 1px solid transparent;
    }
    .install__btn--primary {
      background: var(--color-bordeaux);
      color: var(--color-papier);
    }
    .install__btn--secondary {
      background: var(--color-papier);
      color: var(--color-bordeaux);
      border-color: var(--color-bordure);
    }
    .install__btn--secondary:hover {
      background: var(--color-creme);
    }
    .install__never {
      padding: 0.375rem;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      background: none;
      border: 0;
      text-decoration: underline;
    }
    .install__btn:focus-visible,
    .install__never:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
    }
    @keyframes install-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .install[open] { animation: none; }
    }
  `,
})
export class AppInstallDialogComponent {
  private readonly hint = inject(AppInstallHintService);
  private readonly installPrompt = inject(InstallPromptService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly qrUrl = `${API_BASE_URL}/qr/app`;
  protected readonly context = signal<InstallContext>('desktop');
  protected readonly canPrompt = this.installPrompt.canInstallOnDemand;

  /** Ouvre le message si la connexion vient d'avoir lieu et qu'il est pertinent. */
  openIfDue(): void {
    if (this.hint.consume()) {
      this.open();
    }
  }

  /** Ouverture à la demande (carte « Installer l'application »). */
  open(): void {
    this.context.set(this.hint.context());
    this.dialog().nativeElement.showModal();
  }

  protected async install(): Promise<void> {
    this.close();
    await this.installPrompt.prompt(true);
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected neverAgain(): void {
    this.hint.neverAgain();
    this.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }
}
