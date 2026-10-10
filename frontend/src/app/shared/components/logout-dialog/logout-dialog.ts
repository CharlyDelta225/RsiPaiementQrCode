import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DeviceLockService } from '../../../core/services/device-lock.service';
import { AppIconComponent } from '../app-icon/app-icon';

/**
 * Demande de confirmation avant déconnexion. `<dialog>` natif : focus piégé,
 * fermeture par Échap et fond assombri gérés par le navigateur.
 */
@Component({
  selector: 'app-logout-dialog',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <dialog
      #dialog
      class="logout"
      aria-labelledby="logout-title"
      aria-describedby="logout-message"
      (click)="onBackdropClick($event)"
    >
      <div class="logout__panel">
        <span class="logout__icon" aria-hidden="true">
          <app-icon name="logout" [size]="24" />
        </span>
        <h2 class="logout__title" id="logout-title">Se déconnecter ?</h2>
        <p class="logout__message" id="logout-message">
          Voulez-vous vous déconnecter de votre compte ?
        </p>
        <div class="logout__actions">
          <button type="button" class="logout__btn logout__btn--cancel" (click)="close()" autofocus>
            Annuler
          </button>
          <button type="button" class="logout__btn logout__btn--confirm" (click)="confirm()">
            Se déconnecter
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: `
    .logout {
      width: min(360px, calc(100vw - 2rem));
      padding: 0;
      border: 0;
      border-radius: var(--radius-lg);
      background: var(--color-papier);
      color: var(--color-text);
      box-shadow: 0 24px 60px var(--color-bordeaux-deep-25);
    }
    .logout::backdrop {
      background: var(--color-bordeaux-deep-75);
    }
    .logout[open] {
      animation: logout-in 0.18s ease-out;
    }
    .logout__panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1.25rem 1.25rem;
      text-align: center;
    }
    .logout__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--color-red-soft);
      color: var(--color-red);
    }
    .logout__title {
      margin: 0.25rem 0 0;
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-bordeaux-deep);
    }
    .logout__message {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
    .logout__actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
      margin-top: 1rem;
    }
    .logout__btn {
      height: 46px;
      border-radius: var(--radius-pill);
      font-weight: 700;
      font-size: var(--text-sm);
      border: 1px solid transparent;
    }
    .logout__btn--cancel {
      background: var(--color-papier);
      color: var(--color-bordeaux);
      border-color: var(--color-bordure);
    }
    .logout__btn--cancel:hover {
      background: var(--color-creme);
    }
    .logout__btn--confirm {
      background: var(--color-red);
      color: var(--color-papier);
    }
    .logout__btn--confirm:hover {
      filter: brightness(0.92);
    }
    .logout__btn:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
    }
    @keyframes logout-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .logout[open] { animation: none; }
    }
  `,
})
export class LogoutDialogComponent {
  private readonly authService = inject(AuthService);
  private readonly deviceLock = inject(DeviceLockService);
  private readonly router = inject(Router);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected confirm(): void {
    this.close();
    this.deviceLock.forget();
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }

  /** Un clic sur le fond (hors du panneau) referme la boîte. */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }
}
