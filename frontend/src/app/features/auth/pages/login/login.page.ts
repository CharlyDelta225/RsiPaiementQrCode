import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
  ) {}

  protected onForgotClick(event: Event): void {
    event.preventDefault();
    console.log('forgot password');
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
        this.router.navigate(['/member/dashboard']);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}