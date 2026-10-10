import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceLockService } from '../../../../core/services/device-lock.service';
import { ChurchLogoComponent } from '../../../../shared/components/church-logo/church-logo';
import { PinPadComponent } from '../../../../shared/components/pin-pad/pin-pad';

type Step = 'choose' | 'confirm';

/**
 * Création (après la 1re connexion) ou changement (Réglages) du code secret,
 * uniquement dans l'application installée.
 */
@Component({
  selector: 'app-pin-setup',
  standalone: true,
  imports: [ChurchLogoComponent, PinPadComponent],
  template: `
    <main class="lock">
      <header class="lock__head">
        <app-church-logo [size]="56" [color]="'var(--color-papier)'" />
        <h1 class="lock__title">{{ title() }}</h1>
        <p class="lock__subtitle">{{ subtitle() }}</p>
      </header>

      <p class="lock__message" role="alert" aria-live="assertive">{{ message() }}</p>

      <app-pin-pad [disabled]="saving()" (completed)="onCode($event)" />

      @if (changing) {
        <footer class="lock__footer">
          <button type="button" class="lock__link" (click)="cancel()">Annuler</button>
        </footer>
      }
    </main>
  `,
  styleUrl: '../_lock-page.scss',
})
export class PinSetupPage implements OnInit {
  private readonly deviceLock = inject(DeviceLockService);
  private readonly router = inject(Router);
  private readonly pad = viewChild.required(PinPadComponent);

  /** `change` : depuis Réglages ; sinon création juste après la connexion. */
  protected readonly changing = inject(ActivatedRoute).snapshot.data['pinMode'] === 'change';
  protected readonly step = signal<Step>('choose');
  protected readonly message = signal('');
  protected readonly saving = signal(false);
  private firstEntry = '';

  protected readonly title = computed(() =>
    this.step() === 'confirm'
      ? 'Confirmez votre code'
      : this.changing
        ? 'Nouveau code secret'
        : 'Créez votre code secret',
  );
  protected readonly subtitle = computed(() =>
    this.step() === 'confirm'
      ? 'Saisissez à nouveau les 4 chiffres.'
      : 'Choisissez 4 chiffres. Ils vous seront demandés à chaque ouverture de l’application.',
  );

  ngOnInit(): void {
    if (!this.deviceLock.isActiveContext()) {
      this.router.navigate(['/member/dashboard'], { replaceUrl: true });
    }
  }

  protected onCode(code: string): void {
    if (this.step() === 'choose') {
      this.firstEntry = code;
      this.message.set('');
      this.step.set('confirm');
      this.pad().reset();
      return;
    }
    if (code !== this.firstEntry) {
      this.firstEntry = '';
      this.step.set('choose');
      this.pad().fail();
      this.message.set('Les deux codes ne correspondent pas. Recommencez.');
      return;
    }
    this.saving.set(true);
    this.deviceLock.setPin(code).subscribe({
      next: () =>
        this.router.navigate([this.changing ? '/member/settings' : '/member/dashboard'], {
          replaceUrl: true,
        }),
      error: (error: Error) => {
        this.saving.set(false);
        this.firstEntry = '';
        this.step.set('choose');
        this.pad().fail();
        this.message.set(error.message);
      },
    });
  }

  protected cancel(): void {
    this.router.navigate(['/member/settings']);
  }
}
