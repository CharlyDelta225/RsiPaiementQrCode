import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppInstallHintService } from '../../../../core/services/app-install-hint.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DeviceLockService } from '../../../../core/services/device-lock.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { AuthInputComponent } from '../../../../shared/components/auth-input/auth-input';
import { ChurchLogoComponent } from '../../../../shared/components/church-logo/church-logo';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input';
import { PrimaryButtonComponent } from '../../../../shared/components/primary-button/primary-button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppIconComponent,
    AuthInputComponent,
    ChurchLogoComponent,
    PasswordInputComponent,
    PrimaryButtonComponent,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  protected readonly form = new FormGroup({
    identifier: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    remember: new FormControl<boolean>(true, { nonNullable: true }),
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly installHint: AppInstallHintService,
    private readonly deviceLock: DeviceLockService,
  ) {}

  /** Pas encore de réinitialisation en ligne : on oriente vers l'église. */
  protected readonly forgotHintVisible = signal(false);

  protected onForgotClick(event: Event): void {
    event.preventDefault();
    this.forgotHintVisible.set(true);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);

    const { identifier, password } = this.form.getRawValue();

    this.authService.login(identifier, password).subscribe({
      next: () => {
        this.installHint.armAfterLogin();
        this.router.navigate([this.deviceLock.needsSetup() ? '/code-secret' : '/member/dashboard']);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}