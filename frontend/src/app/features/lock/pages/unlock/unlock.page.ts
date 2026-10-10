import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceLockService, PinError } from '../../../../core/services/device-lock.service';
import { ChurchLogoComponent } from '../../../../shared/components/church-logo/church-logo';
import { PinPadComponent } from '../../../../shared/components/pin-pad/pin-pad';

/** Ouverture de l'app installée : code secret à la place de l'email et du mot de passe. */
@Component({
  selector: 'app-unlock',
  standalone: true,
  imports: [ChurchLogoComponent, PinPadComponent],
  template: `
    <main class="lock">
      <header class="lock__head">
        <app-church-logo [size]="56" [color]="'var(--color-papier)'" />
        <h1 class="lock__title">
          Bonjour{{ firstName() ? ', ' + firstName() : '' }} 👋
        </h1>
        <p class="lock__subtitle">Entrez votre code secret pour accéder à votre espace.</p>
      </header>

      <p class="lock__message" role="alert" aria-live="assertive">{{ message() }}</p>

      <app-pin-pad [disabled]="checking()" (completed)="submit($event)" />

      <footer class="lock__footer">
        <button type="button" class="lock__link" (click)="forgot()">Code oublié ?</button>
      </footer>
    </main>
  `,
  styleUrl: '../_lock-page.scss',
})
export class UnlockPage implements OnInit {
  private readonly deviceLock = inject(DeviceLockService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pad = viewChild.required(PinPadComponent);

  protected readonly firstName = this.deviceLock.ownerFirstName;
  protected readonly message = signal('');
  protected readonly checking = signal(false);

  ngOnInit(): void {
    if (!this.deviceLock.canUnlock()) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  protected submit(pin: string): void {
    this.checking.set(true);
    this.message.set('');
    this.deviceLock.unlock(pin).subscribe({
      next: () => {
        const retour = this.route.snapshot.queryParamMap.get('retour');
        this.router.navigateByUrl(retour?.startsWith('/member') ? retour : '/member/dashboard', {
          replaceUrl: true,
        });
      },
      error: (error: PinError) => {
        this.checking.set(false);
        this.pad().fail();
        this.message.set(error.message);
        if (error.locked) {
          setTimeout(() => this.router.navigate(['/login'], { replaceUrl: true }), 2500);
        }
      },
    });
  }

  protected forgot(): void {
    this.deviceLock.forget();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
